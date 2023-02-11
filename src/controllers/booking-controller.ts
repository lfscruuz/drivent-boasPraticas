import { AuthenticatedRequest } from "@/middlewares";
import bookingsService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response){
    const {userId} = req;
    
    try {
        const booking = await bookingsService.getBookings(Number(userId))
        return booking
    } catch (error) {
        res.sendStatus(httpStatus.NOT_FOUND)
    }
}

