const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    recommendBikes
} = require("../controllers/aiController");

const router = express.Router();


// =========================================================
// AI BIKE RECOMMENDATION
// =========================================================

router.post(
    "/recommend",
    protect,
    recommendBikes
);


module.exports = router;