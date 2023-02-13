import { AuthenticatedRequest } from "@/middlewares";
import bookingsService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
        const booking = await bookingsService.getBookings(Number(userId))
        res.status(httpStatus.OK).send(booking)
    } catch (error) {
        res.sendStatus(httpStatus.NOT_FOUND)
    }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
    const userId = Number(req.userId);
    const roomId = Number(req.body.roomId)

    try {
        const newRoom = await bookingsService.postBookings(roomId, userId);
        return res.status(httpStatus.OK).json({ "roomId": newRoom.id })
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.FORBIDDEN)
    }

}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
    const {bookingId} = req.params
    const userId = Number(req.userId);
    const roomId = Number(req.body.roomId);

    try {
        const booking = await bookingsService.putBooking(roomId, userId, Number(bookingId));
        return res.status(httpStatus.OK).json({ "bookingId": booking.id })
    } catch (error) {
        console.log(error)
        if(error.name === "NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND)
        }
        return res.sendStatus(httpStatus.FORBIDDEN)
    }
}

