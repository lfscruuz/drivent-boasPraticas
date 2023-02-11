import { prisma } from "@/config"

async function getBookings(userId: number){
    return prisma.booking.findFirst({
        where:{
            userId
        }, include: {
            Room: true
        }
    })
}

const bookingsRespostory = {
    getBookings
}

export default bookingsRespostory