const Bike = require("../models/Bike");

const {
    getRecommendations,
    getRecommendationsFromAI
} = require("../services/recommendationService");

const {
    parseUserPreferences
} = require("../services/ollamaService");


// =========================================================
// AI BIKE RECOMMENDATION
// =========================================================

const recommendBikes = async (req, res) => {
    try {
        const { prompt } = req.body || {};

        if (
            !prompt ||
            !prompt.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide your requirements."
            });
        }


        // -------------------------------------------------
        // GET AVAILABLE BIKES
        // -------------------------------------------------

        const bikes = await Bike.find({
            status: "available"
        });


        if (
            bikes.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "No available bikes found."
            });
        }


        // -------------------------------------------------
        // TRY LOCAL AI
        // -------------------------------------------------

        try {
            const aiPreferences =
                await parseUserPreferences(
                    prompt
                );

            console.log(
                "AI PREFERENCES:",
                aiPreferences
            );


            const recommendations =
                await getRecommendationsFromAI(
                    prompt,
                    bikes,
                    aiPreferences
                );


            if (
                recommendations.length === 0
            ) {
                return res.status(200).json({
                    success: true,

                    source: "ollama",

                    message:
                        "No available bikes match your requirements.",

                    preferences:
                        aiPreferences,

                    recommendations: []
                });
            }


            return res.status(200).json({
                success: true,

                source: "ollama",

                message:
                    "AI recommendations generated successfully.",

                preferences:
                    aiPreferences,

                recommendations
            });

        } catch (aiError) {

            console.error(
                "OLLAMA ERROR:",
                aiError.message
            );


            // -------------------------------------------------
            // FALLBACK TO RULE-BASED ENGINE
            // -------------------------------------------------

            const recommendations =
                await getRecommendations(
                    prompt,
                    bikes
                );


            if (
                recommendations.length === 0
            ) {
                return res.status(200).json({
                    success: true,

                    source: "rules",

                    message:
                        "No available bikes match your requirements.",

                    recommendations: []
                });
            }


            return res.status(200).json({
                success: true,

                source: "rules",

                message:
                    "Recommendations generated using fallback engine.",

                recommendations
            });
        }

    } catch (error) {
        console.error(
            "AI RECOMMENDATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate recommendations."
        });
    }
};


module.exports = {
    recommendBikes
};