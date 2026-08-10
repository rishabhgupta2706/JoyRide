const express = require("express");
const router = express.Router();

const { createBooking } = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");
const { getMyBookings } = require("../controllers/bookingController");
const { getAllBookings } = require("../controllers/bookingController");
const  adminOnly = require("../middleware/roleMiddleware");

router.get("/", protect, adminOnly, getAllBookings);
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

module.exports = router;