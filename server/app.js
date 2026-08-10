const express = require("express");

const app = express();

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/api/users", userRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/bookings", bookingRoutes);
module.exports = app;