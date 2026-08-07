const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
       const user = await User.findById(decoded.id).select("-password");

if (!user) {
    return res.status(401).json({
        success: false,
        message: "User not found"
    });
}

req.user = user;

        // Continue to the next middleware/controller
        next();

    } catch (error) {
        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};

module.exports = protect;