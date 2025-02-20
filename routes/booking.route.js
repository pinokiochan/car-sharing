const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/summary", verifyToken, bookingController.getBookingSummary);
router.post("/", verifyToken, bookingController.createBooking);
router.get("/", verifyToken, bookingController.getBookings);
router.delete("/:id", verifyToken, bookingController.deleteBooking);
router.post("/:id/pay", verifyToken, bookingController.payBooking);
router.delete("/:id/cancel", verifyToken, bookingController.cancelBooking);
router.put("/:id", verifyToken, bookingController.updateBookingTime);
router.get("/:carId/unavailable-days", bookingController.getUnavailableDays);
router.get("/:carId/editable-days", verifyToken, bookingController.getEditableDays);

module.exports = router;
