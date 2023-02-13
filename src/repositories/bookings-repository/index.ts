import { prisma } from "@/config"

async function getBookings(userId?: number, roomId?: number){
 if (userId === undefined){
    return prisma.booking.findFirst({
        where:{
            roomId
        },
        select: {
            id: true,
            Room: true
        }
    })
 }
 return prisma.booking.findFirst({
    where:{
        userId
    },
    select: {
        id: true,
        Room: true
    }
})
}

async function postBookings(roomId: number, userId: number){
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

async function countBookings(roomId: number){
    return prisma.booking.count({
        where: {
            roomId
        }
    })
}

async function putBooking(roomId: number, bookingId: number){
    return prisma.booking.update({
        where:{
            id: bookingId
        },
        data: {
            roomId: roomId
        }
    })
}

const bookingsRespostory = {
    getBookings,
    postBookings,
    countBookings,
    putBooking
}

export default bookingsRespostory