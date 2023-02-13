import { getBooking, postBooking, putBooking } from "@/controllers/booking-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingsRouter = Router()

bookingsRouter
.all("/*", authenticateToken)
.get("/", getBooking)
.post("/", postBooking)
.put("/:bookingId", putBooking)
export { bookingsRouter }