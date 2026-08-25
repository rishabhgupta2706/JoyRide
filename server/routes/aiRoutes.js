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
         * 2. PRICE PREFERENCES
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
         * 3. LOCATION
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
         * 4. RIDING STYLE / USE CASE
         * ------------------------------------------------
         */

        const categoryPreferences = [];

        const wantsCommuter =
            text.includes("commuter") ||
            text.includes("office") ||
            text.includes("daily") ||
            text.includes("work") ||
            text.includes("college") ||
            text.includes("school") ||
            text.includes("city") ||
            text.includes("everyday") ||
            text.includes("commute");

        const wantsCruiser =
            text.includes("cruiser") ||
            text.includes("comfortable") ||
            text.includes("comfort") ||
            text.includes("relaxed") ||
            text.includes("long ride") ||
            text.includes("long trip") ||
            text.includes("highway");

        const wantsRoadster =
            text.includes("roadster") ||
            text.includes("street bike") ||
            text.includes("street");

        const wantsSport =
            text.includes("sport") ||
            text.includes("sports") ||
            text.includes("sporty") ||
            text.includes("racing") ||
            text.includes("fast") ||
            text.includes("performance");

        const wantsAdventure =
            text.includes("adventure") ||
            text.includes("off road") ||
            text.includes("off-road") ||
            text.includes("rough roads") ||
            text.includes("hills") ||
            text.includes("mountains");

        const wantsTouring =
            text.includes("touring") ||
            text.includes("tour") ||
            text.includes("road trip") ||
            text.includes("travel");

        if (wantsCommuter) {
            categoryPreferences.push("commuter");
        }

        if (wantsCruiser) {
            categoryPreferences.push("cruiser");
        }

        if (wantsRoadster) {
            categoryPreferences.push("roadster");
        }

        if (wantsSport) {
            categoryPreferences.push("sports");
            categoryPreferences.push("sport");
        }

        if (wantsAdventure) {
            categoryPreferences.push("adventure");
        }

        if (wantsTouring) {
            categoryPreferences.push("touring");
        }

        const requestedCategories = [
            ...new Set(categoryPreferences)
        ];

        /*
         * ------------------------------------------------
         * 5. HARD FILTER
         * ------------------------------------------------
         */

        let filteredBikes = bikes;

        /*
         * Budget is a hard requirement.
         */

        if (budget !== null) {
            filteredBikes = filteredBikes.filter(
                (bike) =>
                    bike.pricePerHour <= budget
            );
        }

        /*
         * Location is a hard requirement when
         * explicitly mentioned.
         */

        if (requestedLocation) {
            filteredBikes = filteredBikes.filter(
                (bike) =>
                    bike.location?.toLowerCase().trim() ===
                    requestedLocation
            );
        }

        /*
         * No bike matches the hard requirements.
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
         * 6. SCORE BIKES
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
             * --------------------------------------------
             * LOCATION
             * --------------------------------------------
             */

            if (
                requestedLocation &&
                bike.location
                    ?.toLowerCase()
                    .trim() === requestedLocation
            ) {
                score += 20;

                reasons.push(
                    `Available at your preferred location: ${bike.location}`
                );
            }

            /*
             * --------------------------------------------
             * EXACT BIKE NAME
             * --------------------------------------------
             */

            if (
                bikeName &&
                text.includes(bikeName)
            ) {
                score += 100;

                reasons.push(
                    `Matches the bike you mentioned: ${bike.name}`
                );
            }

            /*
             * --------------------------------------------
             * BRAND
             * --------------------------------------------
             */

            if (
                brand &&
                text.includes(brand)
            ) {
                score += 60;

                reasons.push(
                    `Matches your preferred brand: ${bike.brand}`
                );
            }

            /*
             * --------------------------------------------
             * MODEL
             * --------------------------------------------
             */

            if (
                model &&
                text.includes(model)
            ) {
                score += 70;

                reasons.push(
                    `Matches your preferred model: ${bike.model}`
                );
            }

            /*
             * --------------------------------------------
             * CATEGORY
             * --------------------------------------------
             */

            const categoryMatched =
                requestedCategories.some(
                    (requestedCategory) =>
                        category.includes(
                            requestedCategory
                        )
                );

            if (categoryMatched) {
                score += 70;

                reasons.push(
                    `Matches your preferred riding style: ${bike.category}`
                );
            }

            /*
             * --------------------------------------------
             * BUDGET
             * --------------------------------------------
             *
             * Budget has already been hard filtered.
             * We give a smaller score here because
             * satisfying the budget is expected.
             */

            if (budget !== null) {
                score += 20;

                reasons.push(
                    `Fits your budget of ₹${budget}/hour`
                );
            }

            /*
             * --------------------------------------------
             * CHEAP PREFERENCE
             * --------------------------------------------
             */

            if (wantsCheap) {
                if (
                    bike.pricePerHour <= 30
                ) {
                    score += 40;

                    reasons.push(
                        "Excellent choice for a budget-friendly ride"
                    );
                } else if (
                    bike.pricePerHour <= 50
                ) {
                    score += 25;

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
             * --------------------------------------------
             * PREMIUM PREFERENCE
             * --------------------------------------------
             */

            if (wantsPremium) {
                if (
                    bike.pricePerHour >= 100
                ) {
                    score += 40;

                    reasons.push(
                        "Matches your preference for a premium bike"
                    );
                } else if (
                    bike.pricePerHour >= 50
                ) {
                    score += 20;

                    reasons.push(
                        "Offers a higher-priced rental option"
                    );
                }
            }

            /*
             * --------------------------------------------
             * COMMUTER
             * --------------------------------------------
             */

            if (wantsCommuter) {
                if (
                    category.includes("commuter")
                ) {
                    score += 60;

                    reasons.push(
                        "Well suited for daily commuting"
                    );
                }
            }

            /*
             * --------------------------------------------
             * CRUISER / COMFORT
             * --------------------------------------------
             */

            if (wantsCruiser) {
                if (
                    category.includes("cruiser") ||
                    category.includes("touring")
                ) {
                    score += 60;

                    reasons.push(
                        "Suitable for comfortable long-distance rides"
                    );
                }
            }

            /*
             * --------------------------------------------
             * SPORT / PERFORMANCE
             * --------------------------------------------
             */

            if (wantsSport) {
                if (
                    category.includes("sport") ||
                    category.includes("roadster")
                ) {
                    score += 60;

                    reasons.push(
                        "Suitable for sporty and performance-oriented riding"
                    );
                }
            }

            /*
             * --------------------------------------------
             * ROADSTER
             * --------------------------------------------
             */

            if (wantsRoadster) {
                if (
                    category.includes("roadster")
                ) {
                    score += 60;

                    reasons.push(
                        "Matches your preference for a roadster"
                    );
                }
            }

            /*
             * --------------------------------------------
             * ADVENTURE
             * --------------------------------------------
             */

            if (wantsAdventure) {
                if (
                    category.includes("adventure")
                ) {
                    score += 60;

                    reasons.push(
                        "Suitable for adventure and rough-road riding"
                    );
                }
            }

            /*
             * --------------------------------------------
             * TOURING
             * --------------------------------------------
             */

            if (wantsTouring) {
                if (
                    category.includes("touring") ||
                    category.includes("cruiser")
                ) {
                    score += 60;

                    reasons.push(
                        "Suitable for touring and longer trips"
                    );
                }
            }

            /*
             * --------------------------------------------
             * REMOVE DUPLICATE REASONS
             * --------------------------------------------
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
         * 8. TOP 3
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