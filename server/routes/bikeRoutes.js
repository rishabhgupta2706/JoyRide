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
const upload = require("../middleware/uploadMiddleware");

// Admin-only operations
router.post("/", protect, adminOnly,upload.single("image"), addBike);
router.put("/:id", protect, adminOnly,upload.single("image"), updateBike);
router.delete("/:id", protect, adminOnly, deleteBike);

// Authenticated user operations
router.get("/", protect, getAllBikes);
router.get("/:id", protect, getBikeById);

// Availability check
router.get("/:id/availability", protect, checkBikeAvailability);

module.exports = router;