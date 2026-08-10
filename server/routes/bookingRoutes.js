const express = require("express");
const router = express.Router();

const { createBooking } = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");
const { getMyBookings } = require("../controllers/bookingController");
const { getAllBookings } = require("../controllers/bookingController");
const  adminOnly = require("../middleware/roleMiddleware");
const { updateBookingStatus } = require("../controllers/bookingController");

router.get("/", protect, adminOnly, getAllBookings);
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.patch("/:id/status", protect, adminOnly, updateBookingStatus);

module.exports = router;