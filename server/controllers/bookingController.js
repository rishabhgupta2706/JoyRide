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

        if (["maintenance", "inactive"].includes(bikeData.status)) {
    return res.status(400).json({
        success: false,
        message: `Bike is currently ${bikeData.status} and cannot be booked.`
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

        // Define allowed status transitions
        const allowedTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["completed", "cancelled"],
            completed: [],
            cancelled: []
        };

        // Check if status transition is allowed
        if (!allowedTransitions[booking.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Booking cannot be changed from ${booking.status} to ${status}.`
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

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the booking
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        // Make sure the logged-in user owns this booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to cancel this booking."
            });
        }

        // Only pending or confirmed bookings can be cancelled
        if (!["pending", "confirmed"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Booking cannot be cancelled because its current status is ${booking.status}.`
            });
        }

        // Cancel booking
        booking.status = "cancelled";

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            booking
        });

    } catch (error) {
        console.log("CANCEL BOOKING ERROR:", error);

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
    updateBookingStatus,
    cancelBooking
};