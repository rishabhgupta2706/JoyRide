const Bike = require("../models/Bike");
const Booking = require("../models/Booking");
const cloudinary = require("../config/cloudinary");


// =========================================================
// ADD BIKE
// =========================================================

const addBike = async (req, res) => {
    try {
        const {
            name,
            brand,
            model,
            category,
            registrationNumber,
            pricePerHour,
            location,
            description,
            status
        } = req.body || {};

        // Validate required fields
        if (
            !name ||
            !brand ||
            !model ||
            !category ||
            !registrationNumber ||
            !pricePerHour ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        // Check duplicate registration number
        const existingBike = await Bike.findOne({
            registrationNumber
        });

        if (existingBike) {
            return res.status(409).json({
                success: false,
                message:
                    "A bike with this registration number already exists."
            });
        }

        // Upload image to Cloudinary
        let imageUrl = "";

        if (req.file) {
            const uploadResult = await new Promise(
                (resolve, reject) => {
                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder: "joyride/bikes",
                                resource_type: "image"
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );

                    uploadStream.end(req.file.buffer);
                }
            );

            imageUrl = uploadResult.secure_url;
        }

        // Create bike
        const bike = await Bike.create({
            name,
            brand,
            model,
            category,
            registrationNumber,
            pricePerHour,
            location,
            description,
            status: status || "available",
            image: imageUrl
        });

        return res.status(201).json({
            success: true,
            message: "Bike added successfully.",
            bike
        });

    } catch (error) {
        console.log("ADD BIKE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================================================
// GET ALL BIKES
// =========================================================

const getAllBikes = async (req, res) => {
    try {
        const bikes = await Bike.find();

        return res.status(200).json({
            success: true,
            count: bikes.length,
            bikes
        });

    } catch (error) {
        console.log("GET ALL BIKES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================================================
// GET BIKE BY ID
// =========================================================

const getBikeById = async (req, res) => {
    try {
        const { id } = req.params;

        const bike = await Bike.findById(id);

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found."
            });
        }

        return res.status(200).json({
            success: true,
            bike
        });

    } catch (error) {
        console.log("GET BIKE BY ID ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================================================
// UPDATE BIKE
// =========================================================

const updateBike = async (req, res) => {
    try {
        const { id } = req.params;

        const body = req.body || {};

        // Find existing bike
        const existingBike = await Bike.findById(id);

        if (!existingBike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found."
            });
        }

        // Check duplicate registration number
        if (
            body.registrationNumber &&
            body.registrationNumber !==
                existingBike.registrationNumber
        ) {
            const duplicateBike = await Bike.findOne({
                registrationNumber: body.registrationNumber,
                _id: { $ne: id }
            });

            if (duplicateBike) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A bike with this registration number already exists."
                });
            }
        }

        // Prepare update data
        const updateData = {
            name: body.name,
            brand: body.brand,
            model: body.model,
            category: body.category,
            registrationNumber:
                body.registrationNumber,
            pricePerHour:
                body.pricePerHour,
            location: body.location,
            description:
                body.description,
            status:
                body.status
        };

        // -------------------------------------------------
        // NEW IMAGE SELECTED
        // -------------------------------------------------

        if (req.file) {
            const uploadResult = await new Promise(
                (resolve, reject) => {
                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder: "joyride/bikes",
                                resource_type: "image"
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );

                    uploadStream.end(req.file.buffer);
                }
            );

            updateData.image =
                uploadResult.secure_url;
        }

        // -------------------------------------------------
        // NO NEW IMAGE
        // KEEP EXISTING IMAGE
        // -------------------------------------------------

        if (!req.file) {
            updateData.image =
                existingBike.image;
        }

        // Update bike
        const bike =
            await Bike.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "Bike updated successfully.",
            bike
        });

    } catch (error) {
        console.log(
            "UPDATE BIKE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================================================
// DELETE BIKE
// =========================================================

const deleteBike = async (req, res) => {
    try {
        const { id } = req.params;

        const bike =
            await Bike.findByIdAndDelete(id);

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Bike deleted successfully."
        });

    } catch (error) {
        console.log(
            "DELETE BIKE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================================================
// CHECK BIKE AVAILABILITY
// =========================================================

const checkBikeAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } =
            req.query;

        // Check required dates
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Start date and end date are required."
            });
        }

        // Find bike
        const bike =
            await Bike.findById(id);

        if (!bike) {
            return res.status(404).json({
                success: false,
                message:
                    "Bike not found."
            });
        }

        // Check bike status
        if (
            ["maintenance", "inactive"].includes(
                bike.status
            )
        ) {
            return res.status(200).json({
                success: true,
                available: false,
                message:
                    `Bike is currently ${bike.status}.`
            });
        }

        // Convert dates
        const start =
            new Date(startDate);

        const end =
            new Date(endDate);

        // Validate dates
        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid date format."
            });
        }

        // End date must be after start date
        if (end <= start) {
            return res.status(400).json({
                success: false,
                message:
                    "End date must be after start date."
            });
        }

        // Check overlapping bookings
        const existingBooking =
            await Booking.findOne({
                bike: bike._id,
                status: {
                    $in: [
                        "pending",
                        "confirmed"
                    ]
                },
                startDate: {
                    $lt: end
                },
                endDate: {
                    $gt: start
                }
            });

        if (existingBooking) {
            return res.status(200).json({
                success: true,
                available: false,
                message:
                    "Bike is already booked for the selected time."
            });
        }

        return res.status(200).json({
            success: true,
            available: true,
            message:
                "Bike is available for the selected time."
        });

    } catch (error) {
        console.log(
            "CHECK BIKE AVAILABILITY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    addBike,
    getAllBikes,
    getBikeById,
    updateBike,
    deleteBike,
    checkBikeAvailability
};