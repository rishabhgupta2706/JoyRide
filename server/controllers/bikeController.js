const Bike = require("../models/Bike");

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
            image
        } = req.body;

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

        const existingBike = await Bike.findOne({
            registrationNumber
        });

        if (existingBike) {
            return res.status(409).json({
                success: false,
                message: "A bike with this registration number already exists."
            });
        }

        const bike = await Bike.create({
            name,
            brand,
            model,
            category,
            registrationNumber,
            pricePerHour,
            location,
            description,
            image
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


// Get all bikes
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
const getBikeById = async (req, res) => {
    try {
        const { id } = req.params;

        const bike = await Bike.findById(id);

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        return res.status(200).json({
            success: true,
            bike
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const updateBike = async (req, res) => {
    try {
        const { id } = req.params;

        const bike = await Bike.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bike updated successfully",
            bike
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};const deleteBike = async (req, res) => {
    try {
        const { id } = req.params;

        const bike = await Bike.findByIdAndDelete(id);

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bike deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




module.exports = {
    addBike,
    getAllBikes,
    getBikeById,
    updateBike,
    deleteBike
};