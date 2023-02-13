import app, { init } from "@/app"
import { prisma } from "@/config"
import faker from "@faker-js/faker"
import { TicketStatus } from "@prisma/client"
import httpStatus from "http-status"
import supertest from "supertest"
import {
    createEnrollmentWithAddress,
    createHotel,
    createPayment,
    createRoomWithHotelId,
    createTicket,
    createTicketTypeRemote,
    createTicketTypeWithHotel,
    createUser
} from "../factories"
import createBooking from "../factories/booking-factory"
import { cleanDb, generateValidToken } from "../helpers"

beforeAll(async () => {
    await init()
})

afterEach(async () => {
    await cleanDb()
})

const server = supertest(app);

describe("GET /booking", () => {
    it("should respond with statuscode 401 if no token is given", async () => {
        const { status } = await server.get("/booking/1");
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    it("should respond with statuscode 401 if token is invalid", async () => {
        const token = faker.random.alphaNumeric();
        const { status } = await server.get("/booking/1").set("Authorization", `Bearer ${token}`);
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    describe("when token exists and it's valid", () => {

        it("should respond with statuscode 404 if user hasn't booked anything yet", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const { status } = await server.get("/booking").set("Authorization", `Bearer ${token}`)
            expect(status).toBe(httpStatus.NOT_FOUND)
        })
        it("should respond with statuscode 200 if user has bookings", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);

            const { status, body } = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(body).toEqual({
                id: booking.id,
                Room: {
                    id: room.id,
                    name: room.name,
                    capacity: room.capacity,
                    hotelId: hotel.id,
                    createdAt: room.createdAt.toISOString(),
                    updatedAt: room.updatedAt.toISOString(),
                }
            })
            expect(status).toBe(httpStatus.OK);
        })
    })
})

describe("POST /booking", () => {
    it("should respond with statuscode 401 if no token is given", async () => {
        const { status } = await server.post("/booking/1");
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    it("should respond with statuscode 401 if token is invalid", async () => {
        const token = faker.random.alphaNumeric();
        const { status } = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    describe("when token exists and it's valid", () => {
        describe("403 cases", () => {
            it("should respond with statuscode 403 if ticket is remote", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);

                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeRemote();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                await createPayment(ticket.id, ticketType.price)

                const { status } = await server.post(`/booking`).set("Authorization", `Bearer ${token}`).send({ roomId: room.id }); expect(status).toBe(httpStatus.FORBIDDEN)

            })
            it("should respond with statuscode 403 if user didn't pay", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);

                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

                const { status, body } = await server.post("/booking").set("Auhtorization", `Bearer ${token}`).send({ roomId: room.id })
                console.log(body)
                expect(status).toBe(httpStatus.FORBIDDEN)
            })
            it("should respond with statuscode 403 if room fully booked", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);

                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                await createPayment(ticket.id, ticketType.price)

                await createBooking(user.id, room.id);
                await createBooking(user.id, room.id);
                await createBooking(user.id, room.id);

                const { status } = await server.post(`/booking`).set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
                expect(status).toBe(httpStatus.FORBIDDEN)
            })
        })
        it("should respond with statuscode 404 if no roomId", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const { status } = await server.post(`/booking`).set("Authorization", `Bearer ${token}`).send({ roomId: 0 });
            expect(status).toBe(httpStatus.NOT_FOUND)
        })
        it("should respond with statuscode 200 if ok", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price)

            await createBooking(user.id, room.id);

            const { status, body } = await server.post(`/booking`).set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
            expect(status).toBe(httpStatus.OK)
        })
    })
})

describe("PUT /booking/:bookingId", () => {
    it("should respond with statuscode 401 if no token is given", async () => {
        const { status } = await server.put("/booking/1");
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    it("should respond with statuscode 401 if token is invalid", async () => {
        const token = faker.random.alphaNumeric();
        const { status } = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
        expect(status).toBe(httpStatus.UNAUTHORIZED);
    })
    describe("when token exists and it's valid", () => {
        it("should respond with statuscode 404 if bookingId doesn't exist",async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const { status } = await server.put(`/booking/0`).set("Authorization", `Bearer ${token}`).send({ roomId: 0 });
            expect(status).toBe(httpStatus.NOT_FOUND)
        })
        it("should respond with statuscode 403 if room fully booked", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price)

            await createBooking(user.id, room.id);

            const newRoom = await createRoomWithHotelId(hotel.id);

            await createBooking(user.id, newRoom.id);
            await createBooking(user.id, newRoom.id);
            await createBooking(user.id, newRoom.id);

            const booking = await createBooking(user.id, newRoom.id);

            const { status } = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: newRoom.id });
            expect(status).toBe(httpStatus.FORBIDDEN)
        })
        it("should respond with statuscode 200 if ok",async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price)

            await createBooking(user.id, room.id);
            const newRoom = await createRoomWithHotelId(hotel.id);

            const booking = await createBooking(user.id, newRoom.id);
            const { status } = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: newRoom.id });
            expect(status).toBe(httpStatus.OK)
        })
    })
})