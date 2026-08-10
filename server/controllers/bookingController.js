const Booking = require("../models/Booking");
const Bike = require("../models/Bike");

const createBooking = async (req, res) => {
    try {
        const {
            bike,
            startDate,
            endDate,
            pickupLocation
        } = req.body;

        // Validate required fields
        if (!bike || !startDate || !endDate || !pickupLocation) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        // Find the bike
        const bikeData = await Bike.findById(bike);

        if (!bikeData) {
            return res.status(404).json({
                success: false,
                message: "Bike not found."
            });
        }

        // Convert dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format."
            });
        }

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date."
            });
        }

        // Calculate rental duration in hours
        const durationInMilliseconds = end - start;
        const durationInHours = Math.ceil(
            durationInMilliseconds / (1000 * 60 * 60)
        );

        // Calculate total amount on the server
        const totalAmount = durationInHours * bikeData.pricePerHour;

// Check if bike is already booked for the selected time
const existingBooking = await Booking.findOne({
    bike: bikeData._id,
    status: { $in: ["pending", "confirmed"] },
    startDate: { $lt: end },
    endDate: { $gt: start }
});

if (existingBooking) {
    return res.status(409).json({
        success: false,
        message: "Bike is already booked for the selected time."
    });
}

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            bike: bikeData._id,
            startDate: start,
            endDate: end,
            pickupLocation,
            totalAmount
        });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully.",
            booking
        });

    } catch (error) {
        console.log("CREATE BOOKING ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id
        })
            .populate("bike")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.log("GET MY BOOKINGS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("user", "-password")
            .populate("bike")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.log("GET ALL BOOKINGS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Validate status
        const allowedStatuses = [
            "pending",
            "confirmed",
            "completed",
            "cancelled"
        ];

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status."
            });
        }

        // Find booking
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        // Update status
        booking.status = status;

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking status updated successfully.",
            booking
        });

    } catch (error) {
        console.log("UPDATE BOOKING STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus
};