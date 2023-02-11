import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { Room } from "@prisma/client";
import { createRoomWithHotelId } from "./hotels-factory";

export default async function createBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId,
        }
    })
}