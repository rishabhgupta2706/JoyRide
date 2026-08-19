const express = require("express");
const cors = require("cors");

const app = express();
app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/api/users", userRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/bookings", bookingRoutes);
module.exports = app;