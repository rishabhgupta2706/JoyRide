const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        brand: {
            type: String,
            required: true,
            trim: true
        },
        model: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        pricePerHour: {
            type: Number,
            required: true,
            min: 0
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["available", "booked", "maintenance", "inactive"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Bike", bikeSchema);