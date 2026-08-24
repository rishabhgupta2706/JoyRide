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

        /*
         * ------------------------------------------------
         * 1. EXTRACT BUDGET
         * ------------------------------------------------
         */

        const budgetMatch = text.match(
            /(?:under|below|less than|upto|up to|max|maximum|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i
        );

        const budget = budgetMatch
            ? Number(budgetMatch[1])
            : null;

        /*
         * ------------------------------------------------
         * 2. DETECT PRICE PREFERENCES
         * ------------------------------------------------
         */

        const wantsCheap =
            text.includes("cheap") ||
            text.includes("cheapest") ||
            text.includes("budget") ||
            text.includes("affordable") ||
            text.includes("low price") ||
            text.includes("low cost") ||
            text.includes("economical") ||
            text.includes("inexpensive");

        const wantsPremium =
            text.includes("premium") ||
            text.includes("expensive") ||
            text.includes("luxury") ||
            text.includes("high end") ||
            text.includes("powerful");

        /*
         * ------------------------------------------------
         * 3. DETECT LOCATION
         * ------------------------------------------------
         */

        const locations = [
            ...new Set(
                bikes
                    .map((bike) =>
                        bike.location?.toLowerCase().trim()
                    )
                    .filter(Boolean)
            )
        ];

        const requestedLocation =
            locations.find((location) =>
                text.includes(location)
            ) || null;

        /*
         * ------------------------------------------------
         * 4. DETECT RIDING STYLE
         * ------------------------------------------------
         */

        const categoryPreferences = [];

        if (
            text.includes("commuter") ||
            text.includes("office") ||
            text.includes("daily") ||
            text.includes("work") ||
            text.includes("college") ||
            text.includes("school") ||
            text.includes("city") ||
            text.includes("everyday") ||
            text.includes("commute")
        ) {
            categoryPreferences.push("commuter");
        }

        if (
            text.includes("cruiser") ||
            text.includes("comfortable") ||
            text.includes("comfort") ||
            text.includes("relaxed") ||
            text.includes("long ride") ||
            text.includes("long trip") ||
            text.includes("highway")
        ) {
            categoryPreferences.push("cruiser");
        }

        if (
            text.includes("roadster") ||
            text.includes("street bike") ||
            text.includes("street")
        ) {
            categoryPreferences.push("roadster");
        }

        if (
            text.includes("sport") ||
            text.includes("sports") ||
            text.includes("sporty") ||
            text.includes("racing") ||
            text.includes("fast") ||
            text.includes("performance")
        ) {
            categoryPreferences.push("sports");
            categoryPreferences.push("sport");
        }

        if (
            text.includes("adventure") ||
            text.includes("off road") ||
            text.includes("off-road") ||
            text.includes("rough roads") ||
            text.includes("hills") ||
            text.includes("mountains")
        ) {
            categoryPreferences.push("adventure");
        }

        if (
            text.includes("touring") ||
            text.includes("tour") ||
            text.includes("road trip") ||
            text.includes("travel")
        ) {
            categoryPreferences.push("touring");
        }

        const requestedCategories = [
            ...new Set(categoryPreferences)
        ];

        /*
         * ------------------------------------------------
         * 5. HARD FILTER
         * ------------------------------------------------
         *
         * Budget and location are treated as hard
         * requirements when explicitly mentioned.
         */

        let filteredBikes = bikes;

        /*
         * Budget filter
         */

        if (budget !== null) {
            filteredBikes = filteredBikes.filter(
                (bike) =>
                    bike.pricePerHour <= budget
            );
        }

        /*
         * Location filter
         */

        if (requestedLocation) {
            filteredBikes = filteredBikes.filter(
                (bike) =>
                    bike.location?.toLowerCase().trim() ===
                    requestedLocation
            );
        }

        /*
         * If no bikes match the hard requirements,
         * return an empty recommendation list.
         */

        if (filteredBikes.length === 0) {
            return res.status(200).json({
                success: true,
                message:
                    "No available bikes match all of your requirements.",
                recommendations: []
            });
        }

        /*
         * ------------------------------------------------
         * 6. SCORE REMAINING BIKES
         * ------------------------------------------------
         */

        const scoredBikes = filteredBikes.map((bike) => {
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

            /*
             * Location match
             */

            if (
                requestedLocation &&
                bike.location
                    ?.toLowerCase()
                    .trim() === requestedLocation
            ) {
                score += 30;

                reasons.push(
                    `Matches your preferred location: ${bike.location}`
                );
            }

            /*
             * Bike name match
             */

            if (
                bikeName &&
                text.includes(bikeName)
            ) {
                score += 40;

                reasons.push(
                    `Matches the bike you mentioned: ${bike.name}`
                );
            }

            /*
             * Brand match
             */

            if (
                brand &&
                text.includes(brand)
            ) {
                score += 25;

                reasons.push(
                    `Matches your preferred brand: ${bike.brand}`
                );
            }

            /*
             * Model match
             */

            if (
                model &&
                text.includes(model)
            ) {
                score += 20;

                reasons.push(
                    `Matches your preferred model: ${bike.model}`
                );
            }

            /*
             * Category match
             */

            const categoryMatched =
                requestedCategories.some(
                    (requestedCategory) =>
                        category.includes(
                            requestedCategory
                        )
                );

            if (categoryMatched) {
                score += 35;

                reasons.push(
                    `Matches your preferred riding style: ${bike.category}`
                );
            }

            /*
             * Budget match
             */

            if (budget !== null) {
                score += 50;

                reasons.push(
                    `Fits your budget of ₹${budget}/hour`
                );
            }

            /*
             * Cheap preference
             */

            if (wantsCheap) {
                if (
                    bike.pricePerHour <= 30
                ) {
                    score += 30;

                    reasons.push(
                        "Excellent choice for a budget-friendly ride"
                    );
                } else if (
                    bike.pricePerHour <= 50
                ) {
                    score += 20;

                    reasons.push(
                        "Good choice for a budget-friendly ride"
                    );
                } else if (
                    bike.pricePerHour <= 100
                ) {
                    score += 10;

                    reasons.push(
                        "Reasonably priced for rental"
                    );
                }
            }

            /*
             * Premium preference
             */

            if (wantsPremium) {
                if (
                    bike.pricePerHour >= 100
                ) {
                    score += 30;

                    reasons.push(
                        "Matches your preference for a premium bike"
                    );
                } else if (
                    bike.pricePerHour >= 50
                ) {
                    score += 15;

                    reasons.push(
                        "Offers a higher-priced rental option"
                    );
                }
            }

            /*
             * Daily commute
             */

            if (
                text.includes("office") ||
                text.includes("daily") ||
                text.includes("college") ||
                text.includes("commute")
            ) {
                if (
                    category.includes("commuter")
                ) {
                    score += 25;

                    reasons.push(
                        "Suitable for daily commuting"
                    );
                }
            }

            /*
             * Comfort / long rides
             */

            if (
                text.includes("comfortable") ||
                text.includes("comfort") ||
                text.includes("long ride") ||
                text.includes("long trip")
            ) {
                if (
                    category.includes("cruiser") ||
                    category.includes("touring")
                ) {
                    score += 25;

                    reasons.push(
                        "Suitable for comfortable long-distance rides"
                    );
                }
            }

            /*
             * Sport / performance
             */

            if (
                text.includes("sporty") ||
                text.includes("sports") ||
                text.includes("fast") ||
                text.includes("racing") ||
                text.includes("performance")
            ) {
                if (
                    category.includes("sport") ||
                    category.includes("roadster")
                ) {
                    score += 25;

                    reasons.push(
                        "Suitable for a sporty and performance-oriented ride"
                    );
                }
            }

            /*
             * Adventure
             */

            if (
                text.includes("adventure") ||
                text.includes("off road") ||
                text.includes("rough roads") ||
                text.includes("mountains") ||
                text.includes("hills")
            ) {
                if (
                    category.includes("adventure")
                ) {
                    score += 25;

                    reasons.push(
                        "Suitable for adventure and rough-road riding"
                    );
                }
            }

            /*
             * Remove duplicate reasons
             */

            const uniqueReasons = [
                ...new Set(reasons)
            ];

            if (
                uniqueReasons.length === 0
            ) {
                uniqueReasons.push(
                    "Available for your selected rental"
                );
            }

            return {
                bike,
                score,
                reasons: uniqueReasons
            };
        });

        /*
         * ------------------------------------------------
         * 7. SORT
         * ------------------------------------------------
         *
         * Highest score first.
         * If scores are equal, cheaper bike first.
         */

        scoredBikes.sort((a, b) => {
            if (
                b.score !== a.score
            ) {
                return b.score - a.score;
            }

            return (
                a.bike.pricePerHour -
                b.bike.pricePerHour
            );
        });

        /*
         * ------------------------------------------------
         * 8. TOP 3 RECOMMENDATIONS
         * ------------------------------------------------
         */

        const recommendations =
            scoredBikes
                .slice(0, 3)
                .map((item) => ({
                    bike: item.bike,
                    score: item.score,
                    reasons: item.reasons
                }));

        /*
         * ------------------------------------------------
         * 9. RESPONSE
         * ------------------------------------------------
         */

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