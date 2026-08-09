const express = require("express");

const app = express();

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const bikeRoutes = require("./routes/bikeRoutes");

app.use("/api/users", userRoutes);
app.use("/api/bikes", bikeRoutes);
module.exports = app;