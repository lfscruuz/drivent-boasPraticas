import app, { init } from "@/app"
import { prisma } from "@/config"
import faker from "@faker-js/faker"
import httpStatus from "http-status"
import supertest from "supertest"
import { createHotel, createRoomWithHotelId, createUser } from "../factories"
import createBooking from "../factories/booking-factory"
import { cleanDb, generateValidToken } from "../helpers"

beforeAll(async () => {
    await init()
})

afterEach(async () => {
    await cleanDb()
})

const server = supertest(app);

describe("GET /bookings", () => {
    it("should respond with statuscode 401 if no token is given", async () => {
        const { status } = await server.get("/bookings/1");
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    it("should respond with statuscode 401 if token is invalid", async () => {
        const token = faker.random.alphaNumeric();
        const { status } = await server.get("/bookings/1").set("Authorization", `Bearer ${token}`);
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    describe("when token exists and it's valid", () => {

        it("should respond with statuscode 404 if user hasn't booked anything yet", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const { status } = await server.get("/bookings").set("Authorization", `Bearer ${token}`)
            expect(status).toBe(httpStatus.NOT_FOUND)
        })
        it("should respond with statuscode 200 if user has bookings", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            console.log(user, createdRoom)
            const createdBooking = await createBooking(user.id, createdRoom.id);

            const { status, body } = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

            expect(body).toEqual({
                id: createdBooking.id,
                Room: {
                    id: createdRoom.id,
                    name: createdRoom.name,
                    capacity: createdRoom.capacity,
                    hotelId: createdHotel.id,
                    createdAt: createdRoom.createdAt.toISOString(),
                    updatedAt: createdRoom.updatedAt.toISOString(),
                }
            })
            expect(status).toBe(httpStatus.OK);
        })
    })
})