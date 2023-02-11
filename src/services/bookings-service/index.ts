import { notFoundError } from "@/errors";
import bookingsRespostory from "@/repositories/bookings-repository";

async function getBookings(userId: number){
    const booking = await bookingsRespostory.getBookings(userId)
    if(!booking){
        throw notFoundError()
    }
    return booking
}


const bookingsService = {
    getBookings
}

export default bookingsService;