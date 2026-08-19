const express = require("express");

const router = express.Router();

const {
    getAllBikes,
    addBike,
    getBikeById,
    updateBike,
    deleteBike,
    checkBikeAvailability
} = require("../controllers/bikeController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

// Admin-only operations
router.post("/", protect, adminOnly, addBike);
router.put("/:id", protect, adminOnly, updateBike);
router.delete("/:id", protect, adminOnly, deleteBike);

// Authenticated user operations
router.get("/", protect, getAllBikes);
router.get("/:id", protect, getBikeById);

// Availability check
router.get("/:id/availability", protect, checkBikeAvailability);

module.exports = router;