const express = require("express");
const Bike = require("../models/Bike");

const router = express.Router();

router.post("/recommend", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide your requirements."
            });
        }

        const bikes = await Bike.find({
            status: "available"
        });

        if (bikes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No available bikes found."
            });
        }

        const text = prompt.toLowerCase().trim();

        // Extract budget from requests such as:
        // "under 50", "below 100", "up to 200"
        const budgetMatch = text.match(
            /(?:under|below|less than|upto|up to|max|maximum)\s*(?:₹|rs\.?|inr)?\s*(\d+)/
        );

        const budget = budgetMatch
            ? Number(budgetMatch[1])
            : null;

        // Price preferences
        const wantsCheap =
            text.includes("cheap") ||
            text.includes("budget") ||
            text.includes("affordable") ||
            text.includes("low price");

        const wantsPremium =
            text.includes("premium") ||
            text.includes("expensive") ||
            text.includes("luxury") ||
            text.includes("powerful");

        // Common bike categories
        const categoryKeywords = [
            "commuter",
            "cruiser",
            "roadster",
            "sports",
            "sport",
            "adventure",
            "touring"
        ];

        const requestedCategories =
            categoryKeywords.filter((category) =>
                text.includes(category)
            );

        const scoredBikes = bikes.map((bike) => {
            let score = 0;
            const reasons = [];

            const bikeName =
                bike.name?.toLowerCase() || "";

            const brand =
                bike.brand?.toLowerCase() || "";

            const model =
                bike.model?.toLowerCase() || "";

            const category =
                bike.category?.toLowerCase() || "";

            const location =
                bike.location?.toLowerCase() || "";

            // Location match
            if (text.includes(location)) {
                score += 30;

                reasons.push(
                    `Matches your preferred location: ${bike.location}`
                );
            }

            // Bike name match
            if (text.includes(bikeName)) {
                score += 40;

                reasons.push(
                    `Matches the bike you mentioned: ${bike.name}`
                );
            }

            // Brand match
            if (text.includes(brand)) {
                score += 25;

                reasons.push(
                    `Matches your preferred brand: ${bike.brand}`
                );
            }

            // Model match
            if (text.includes(model)) {
                score += 20;

                reasons.push(
                    `Matches your preferred model: ${bike.model}`
                );
            }

            // Category match
            const categoryMatched =
                requestedCategories.some(
                    (requestedCategory) =>
                        category.includes(requestedCategory)
                );

            if (categoryMatched) {
                score += 30;

                reasons.push(
                    `Matches your preferred category: ${bike.category}`
                );
            }

            // Budget match
            if (budget !== null) {
                if (bike.pricePerHour <= budget) {
                    score += 40;

                    reasons.push(
                        `Fits your budget of ₹${budget}/hour`
                    );
                } else {
                    score -= 20;
                }
            }

            // Cheap preference
            if (wantsCheap) {
                if (bike.pricePerHour <= 50) {
                    score += 25;

                    reasons.push(
                        "Good choice for a budget-friendly ride"
                    );
                } else if (bike.pricePerHour <= 100) {
                    score += 10;

                    reasons.push(
                        "Reasonably priced for rental"
                    );
                } else {
                    score -= 10;
                }
            }

            // Premium preference
            if (wantsPremium) {
                if (bike.pricePerHour >= 100) {
                    score += 25;

                    reasons.push(
                        "Matches your preference for a premium bike"
                    );
                } else if (bike.pricePerHour >= 50) {
                    score += 10;

                    reasons.push(
                        "Offers a higher-priced rental option"
                    );
                }
            }

            // Default reason for bikes with no specific match
            if (reasons.length === 0) {
                reasons.push(
                    "Available for your selected rental"
                );
            }

            return {
                bike,
                score,
                reasons
            };
        });

        // Highest score first.
        // If scores are equal, cheaper bike comes first.
        scoredBikes.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return (
                a.bike.pricePerHour -
                b.bike.pricePerHour
            );
        });

        const recommendations = scoredBikes
            .slice(0, 3)
            .map((item) => ({
                bike: item.bike,
                score: item.score,
                reasons: item.reasons
            }));

        return res.status(200).json({
            success: true,
            message:
                "Bike recommendations generated successfully.",
            recommendations
        });

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
});

module.exports = router;