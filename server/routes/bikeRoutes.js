const express = require("express");
const router = express.Router();
const { getAllBikes } = require("../controllers/bikeController");
const { addBike } = require("../controllers/bikeController");
const { getBikeById } = require("../controllers/bikeController");
const { updateBike } = require("../controllers/bikeController");
const { deleteBike } = require("../controllers/bikeController");
const { checkBikeAvailability } = require("../controllers/bikeController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, addBike);
router.get("/", protect, getAllBikes);
router.get("/:id", protect, getBikeById);
router.put("/:id", protect, updateBike);
router.delete("/:id", protect, deleteBike);
router.get("/:id/availability", checkBikeAvailability);

module.exports = router;