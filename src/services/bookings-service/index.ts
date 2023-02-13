import { notFoundError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import bookingsRespostory from "@/repositories/bookings-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getBookings(userId?: number, roomId?: number) {
    const booking = await bookingsRespostory.getBookings(userId, roomId)
    if (!booking) {
        throw notFoundError()
    }
    return booking
}

async function checkTicket(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    
    if (!ticket || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status !== "PAID"){
        throw forbiddenError()
    }
}

async function countBookings(roomId: number) {
    const roomCount = await bookingsRespostory.countBookings(roomId);
    if (roomCount >= 3) {
        throw forbiddenError()
    }
}

async function postBookings(roomId: number, userId: number) {

    await countBookings(roomId);
    await checkTicket(userId)

    const booking = await bookingsRespostory.postBookings(roomId, userId);
    if (!booking) throw notFoundError();
    return booking
}

async function putBooking(roomId: number, userId: number, bookingId: number){
    await getBookings(undefined, roomId)

    await countBookings(roomId);
    
    const booking = await bookingsRespostory.putBooking(roomId, bookingId);
    if(!booking){
        throw notFoundError();
    }
    return booking
}

const bookingsService = {
    getBookings,
    postBookings,
    putBooking
}

export default bookingsService;