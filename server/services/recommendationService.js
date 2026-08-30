const extractBudget = (text) => {
    const budgetPatterns = [
        /(?:under|below|less than|upto|up to|max|maximum|within|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i,

        /(?:₹|rs\.?|inr)\s*(\d+)\s*(?:or less|per hour|\/hour)?/i,

        /(?:around|about|approximately)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i
    ];

    for (const pattern of budgetPatterns) {
        const match = text.match(pattern);

        if (match) {
            return Number(match[1]);
        }
    }

    return null;
};


// =========================================================
// EXTRACT PREFERENCES USING RULES
// =========================================================

const extractPreferences = (prompt, bikes) => {
    const text = prompt.toLowerCase().trim();

    const budget = extractBudget(text);

    const wantsCheap =
        text.includes("cheap") ||
        text.includes("cheapest") ||
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

    const wantsComfort =
        text.includes("comfortable") ||
        text.includes("comfort") ||
        text.includes("relaxed") ||
        text.includes("smooth");

    const locations = [
        ...new Set(
            bikes
                .map((bike) =>
                    bike.location
                        ?.toLowerCase()
                        .trim()
                )
                .filter(Boolean)
        )
    ];

    const requestedLocation =
        locations.find((location) =>
            text.includes(location)
        ) || null;

    const requestedBike =
        bikes.find((bike) => {
            const bikeName =
                bike.name?.toLowerCase();

            return (
                bikeName &&
                text.includes(bikeName)
            );
        }) || null;

    const requestedBrand =
        bikes.find((bike) => {
            const brand =
                bike.brand?.toLowerCase();

            return (
                brand &&
                text.includes(brand)
            );
        })?.brand?.toLowerCase() || null;

    const requestedModel =
        bikes.find((bike) => {
            const model =
                bike.model?.toLowerCase();

            return (
                model &&
                text.includes(model)
            );
        })?.model?.toLowerCase() || null;

    const requestedCategories = [];

    if (
        text.includes("commuter") ||
        text.includes("office") ||
        text.includes("daily") ||
        text.includes("work") ||
        text.includes("college") ||
        text.includes("city") ||
        text.includes("everyday") ||
        text.includes("commute")
    ) {
        requestedCategories.push("commuter");
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
        requestedCategories.push("cruiser");
    }

    if (
        text.includes("roadster") ||
        text.includes("street bike") ||
        text.includes("street")
    ) {
        requestedCategories.push("roadster");
    }

    if (
        text.includes("sport") ||
        text.includes("sports") ||
        text.includes("sporty") ||
        text.includes("racing") ||
        text.includes("fast") ||
        text.includes("performance")
    ) {
        requestedCategories.push("sports");
        requestedCategories.push("sport");
    }

    if (
        text.includes("adventure") ||
        text.includes("off road") ||
        text.includes("off-road") ||
        text.includes("rough roads") ||
        text.includes("hills") ||
        text.includes("mountains")
    ) {
        requestedCategories.push("adventure");
    }

    if (
        text.includes("touring") ||
        text.includes("tour") ||
        text.includes("road trip") ||
        text.includes("travel") ||
        text.includes("long trip") ||
        text.includes("long ride")
    ) {
        requestedCategories.push("touring");
    }

    return {
        text,
        budget,
        wantsCheap,
        wantsPremium,
        requestedLocation,
        requestedBike,
        requestedBrand,
        requestedModel,

        requestedCategories: [
            ...new Set(requestedCategories)
        ],

        comfort: wantsComfort,

        purpose: text.includes("long trip") ||
            text.includes("long ride") ||
            text.includes("road trip") ||
            text.includes("highway") ||
            text.includes("travel") ||
            text.includes("tour")
            ? "long trip"
            : null
    };
};


// =========================================================
// NORMALIZE AI PREFERENCES
// =========================================================

const normalizeAIPreferences = (
    aiPreferences,
    bikes,
    prompt
) => {
    const text = prompt.toLowerCase().trim();

    let requestedLocation =
        aiPreferences.location
            ?.toLowerCase()
            .trim() || null;

    if (requestedLocation) {
        const actualLocation =
            bikes.find(
                (bike) =>
                    bike.location
                        ?.toLowerCase()
                        .trim() ===
                    requestedLocation
            );

        if (actualLocation) {
            requestedLocation =
                actualLocation.location
                    .toLowerCase()
                    .trim();
        }
    }

    const category =
        aiPreferences.category
            ?.toLowerCase()
            .trim() || null;

    const requestedCategories = [];

    if (category) {
        requestedCategories.push(category);
    }

    // Add categories from the original user prompt too.
    // This prevents the AI from losing important context.

    if (
        text.includes("comfortable") ||
        text.includes("comfort") ||
        text.includes("relaxed") ||
        text.includes("long ride") ||
        text.includes("long trip") ||
        text.includes("highway")
    ) {
        requestedCategories.push("cruiser");
    }

    if (
        text.includes("adventure") ||
        text.includes("off road") ||
        text.includes("off-road") ||
        text.includes("rough roads") ||
        text.includes("hills") ||
        text.includes("mountains")
    ) {
        requestedCategories.push("adventure");
    }

    if (
        text.includes("touring") ||
        text.includes("tour") ||
        text.includes("road trip") ||
        text.includes("travel") ||
        text.includes("long trip") ||
        text.includes("long ride")
    ) {
        requestedCategories.push("touring");
    }

    if (
        text.includes("commute") ||
        text.includes("commuter") ||
        text.includes("office") ||
        text.includes("college") ||
        text.includes("daily")
    ) {
        requestedCategories.push("commuter");
    }

    if (
        text.includes("sport") ||
        text.includes("sports") ||
        text.includes("sporty") ||
        text.includes("racing") ||
        text.includes("fast") ||
        text.includes("performance")
    ) {
        requestedCategories.push("sport");
    }

    return {
        text,

        budget:
            typeof aiPreferences.budget === "number"
                ? aiPreferences.budget
                : extractBudget(text),

        /*
         * Important:
         * A budget limit does NOT mean the user wants
         * the cheapest possible bike.
         */
        wantsCheap:
            Boolean(aiPreferences.cheap) ||
            text.includes("cheapest") ||
            text.includes("cheap") ||
            text.includes("affordable"),

        wantsPremium:
            Boolean(aiPreferences.premium),

        requestedLocation,

        requestedBike: null,

        requestedBrand: null,

        requestedModel: null,

        requestedCategories: [
            ...new Set(requestedCategories)
        ],

        comfort:
            Boolean(aiPreferences.comfort) ||
            text.includes("comfortable") ||
            text.includes("comfort"),

        purpose:
            aiPreferences.purpose ||
            (
                text.includes("long trip") ||
                text.includes("long ride") ||
                text.includes("road trip") ||
                text.includes("highway") ||
                text.includes("travel")
                    ? "long trip"
                    : null
            )
    };
};


// =========================================================
// FILTER BIKES
// =========================================================

const filterBikes = (
    bikes,
    preferences
) => {
    let filteredBikes = bikes.filter(
        (bike) =>
            bike.status === "available"
    );

    if (
        preferences.budget !== null
    ) {
        filteredBikes =
            filteredBikes.filter(
                (bike) =>
                    Number(
                        bike.pricePerHour
                    ) <=
                    preferences.budget
            );
    }

    if (
        preferences.requestedLocation
    ) {
        filteredBikes =
            filteredBikes.filter(
                (bike) =>
                    bike.location
                        ?.toLowerCase()
                        .trim() ===
                    preferences.requestedLocation
            );
    }

    return filteredBikes;
};


// =========================================================
// SCORE BIKES
// =========================================================

const scoreBikes = (
    bikes,
    preferences
) => {
    return bikes.map((bike) => {
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

        const description =
            bike.description?.toLowerCase() || "";

        const price =
            Number(bike.pricePerHour);


        // =====================================================
        // LOCATION
        // =====================================================

        if (
            preferences.requestedLocation &&
            bike.location
                ?.toLowerCase()
                .trim() ===
            preferences.requestedLocation
        ) {
            score += 20;

            reasons.push(
                `Available at your preferred location: ${bike.location}`
            );
        }


        // =====================================================
        // EXACT BIKE
        // =====================================================

        if (
            preferences.requestedBike &&
            bikeName ===
            preferences.requestedBike.name
                ?.toLowerCase()
        ) {
            score += 100;

            reasons.push(
                `Matches the bike you mentioned: ${bike.name}`
            );
        }


        // =====================================================
        // BRAND
        // =====================================================

        if (
            preferences.requestedBrand &&
            brand ===
            preferences.requestedBrand
        ) {
            score += 60;

            reasons.push(
                `Matches your preferred brand: ${bike.brand}`
            );
        }


        // =====================================================
        // MODEL
        // =====================================================

        if (
            preferences.requestedModel &&
            model ===
            preferences.requestedModel
        ) {
            score += 70;

            reasons.push(
                `Matches your preferred model: ${bike.model}`
            );
        }


        // =====================================================
        // CATEGORY MATCH
        // =====================================================

        const categoryMatched =
            preferences.requestedCategories
                ?.some(
                    (requestedCategory) =>
                        category.includes(
                            requestedCategory
                        ) ||
                        requestedCategory.includes(
                            category
                        )
                );

        if (categoryMatched) {
            score += 70;

            reasons.push(
                `Matches your preferred riding style: ${bike.category}`
            );
        }


        // =====================================================
        // COMFORT
        // =====================================================

        if (
            preferences.comfort
        ) {
            if (
                category.includes("cruiser")
            ) {
                score += 70;

                reasons.push(
                    "Cruiser category is well suited for comfortable riding"
                );
            }

            if (
                category.includes("touring")
            ) {
                score += 80;

                reasons.push(
                    "Touring category is designed for comfortable long-distance riding"
                );
            }

            if (
                category.includes("adventure")
            ) {
                score += 55;

                reasons.push(
                    "Adventure bike is suitable for comfortable longer rides"
                );
            }

            if (
                description.includes("comfort") ||
                description.includes("comfortable") ||
                description.includes("relaxed")
            ) {
                score += 35;

                reasons.push(
                    "Bike description mentions comfort"
                );
            }
        }


        // =====================================================
        // LONG TRIP / TOURING PURPOSE
        // =====================================================

        const purpose =
            preferences.purpose
                ?.toLowerCase() || "";

        const wantsLongTrip =
            purpose.includes("long") ||
            purpose.includes("tour") ||
            purpose.includes("travel") ||
            purpose.includes("highway") ||
            preferences.text.includes("long trip") ||
            preferences.text.includes("long ride") ||
            preferences.text.includes("road trip") ||
            preferences.text.includes("highway") ||
            preferences.text.includes("travel");


        if (wantsLongTrip) {

            if (
                category.includes("touring")
            ) {
                score += 100;

                reasons.push(
                    "Excellent category for long-distance touring"
                );
            }

            else if (
                category.includes("cruiser")
            ) {
                score += 85;

                reasons.push(
                    "Cruiser is well suited for relaxed long-distance rides"
                );
            }

            else if (
                category.includes("adventure")
            ) {
                score += 80;

                reasons.push(
                    "Adventure bike is well suited for longer trips"
                );
            }

            else if (
                category.includes("roadster")
            ) {
                score += 35;

                reasons.push(
                    "Roadster can handle longer road rides"
                );
            }

            else if (
                category.includes("commuter")
            ) {
                score += 10;

                reasons.push(
                    "Suitable for shorter everyday rides"
                );
            }

            else if (
                category.includes("scooter")
            ) {
                score -= 15;
            }
        }


        // =====================================================
        // HIGHWAY
        // =====================================================

        if (
            preferences.text.includes("highway")
        ) {
            if (
                category.includes("cruiser") ||
                category.includes("touring") ||
                category.includes("adventure")
            ) {
                score += 60;

                reasons.push(
                    "Suitable for highway riding"
                );
            }
        }


        // =====================================================
        // ADVENTURE / ROUGH ROADS
        // =====================================================

        if (
            preferences.text.includes("adventure") ||
            preferences.text.includes("off road") ||
            preferences.text.includes("off-road") ||
            preferences.text.includes("rough roads") ||
            preferences.text.includes("hills") ||
            preferences.text.includes("mountains")
        ) {
            if (
                category.includes("adventure")
            ) {
                score += 100;

                reasons.push(
                    "Designed for adventure and rough-road riding"
                );
            }
        }


        // =====================================================
        // COMMUTING
        // =====================================================

        if (
            preferences.requestedCategories
                ?.includes("commuter")
        ) {
            if (
                category.includes("commuter")
            ) {
                score += 70;

                reasons.push(
                    "Well suited for daily commuting"
                );
            }

            if (
                category.includes("scooter")
            ) {
                score += 50;

                reasons.push(
                    "Scooter is convenient for city commuting"
                );
            }
        }


        // =====================================================
        // SPORT
        // =====================================================

        if (
            preferences.requestedCategories
                ?.some(
                    (item) =>
                        item === "sport" ||
                        item === "sports"
                )
        ) {
            if (
                category.includes("sport") ||
                category.includes("roadster")
            ) {
                score += 70;

                reasons.push(
                    "Suitable for sporty riding"
                );
            }
        }


        // =====================================================
        // DESCRIPTION MATCH
        // =====================================================

        const descriptionKeywords = [
            "comfortable",
            "comfort",
            "long ride",
            "long trip",
            "highway",
            "city",
            "daily",
            "commute",
            "touring",
            "performance",
            "powerful",
            "sporty",
            "adventure",
            "off road"
        ];

        const matchedDescriptionKeywords =
            descriptionKeywords.filter(
                (keyword) =>
                    preferences.text.includes(
                        keyword
                    ) &&
                    description.includes(
                        keyword
                    )
            );

        if (
            matchedDescriptionKeywords.length > 0
        ) {
            score +=
                matchedDescriptionKeywords.length *
                15;

            reasons.push(
                "Bike description matches your requirements"
            );
        }


        // =====================================================
        // BUDGET
        // =====================================================

        if (
            preferences.budget !== null
        ) {
            if (price <= preferences.budget) {
                score += 20;

                reasons.push(
                    `Fits your budget of ₹${preferences.budget}/hour`
                );
            }
        }


        // =====================================================
        // CHEAP
        // =====================================================

        /*
         * Only apply price preference when the user
         * explicitly asks for a cheap/affordable bike.
         */

        if (
            preferences.wantsCheap
        ) {
            if (
                price <= 30
            ) {
                score += 40;

                reasons.push(
                    "Excellent choice for a budget-friendly ride"
                );
            }

            else if (
                price <= 50
            ) {
                score += 25;

                reasons.push(
                    "Good choice for a budget-friendly ride"
                );
            }

            else if (
                price <= 100
            ) {
                score += 10;

                reasons.push(
                    "Reasonably priced for rental"
                );
            }
        }


        // =====================================================
        // PREMIUM
        // =====================================================

        if (
            preferences.wantsPremium
        ) {
            if (
                price >= 100
            ) {
                score += 40;

                reasons.push(
                    "Matches your preference for a premium bike"
                );
            }

            else if (
                price >= 50
            ) {
                score += 20;

                reasons.push(
                    "Offers a higher-priced rental option"
                );
            }
        }


        // =====================================================
        // VALUE FOR MONEY
        // =====================================================

        if (
            preferences.budget !== null &&
            !preferences.wantsCheap
        ) {
            const budgetUsage =
                price /
                preferences.budget;

            /*
             * Give a small value bonus without allowing
             * cheap bikes to dominate the recommendation.
             */

            if (
                budgetUsage >= 0.6 &&
                budgetUsage <= 1
            ) {
                score += 10;

                reasons.push(
                    "Offers good value within your budget"
                );
            }
        }


        // =====================================================
        // FALLBACK REASON
        // =====================================================

        if (
            reasons.length === 0
        ) {
            reasons.push(
                "Available for your requirements"
            );
        }


        return {
            bike,
            score,
            reasons: [
                ...new Set(reasons)
            ]
        };
    });
};


// =========================================================
// GENERATE RECOMMENDATIONS
// =========================================================

const generateRecommendations = (
    bikes,
    preferences
) => {
    const filteredBikes =
        filterBikes(
            bikes,
            preferences
        );

    if (
        filteredBikes.length === 0
    ) {
        return [];
    }

    const scoredBikes =
        scoreBikes(
            filteredBikes,
            preferences
        );

    scoredBikes.sort(
        (a, b) => {
            if (
                b.score !== a.score
            ) {
                return (
                    b.score -
                    a.score
                );
            }

            return (
                Number(
                    a.bike.pricePerHour
                ) -
                Number(
                    b.bike.pricePerHour
                )
            );
        }
    );

    return scoredBikes
        .slice(0, 3)
        .map((item) => ({
            bike: item.bike,
            score: item.score,
            reasons: item.reasons
        }));
};


// =========================================================
// RULE-BASED RECOMMENDATIONS
// =========================================================

const getRecommendations = async (
    prompt,
    bikes
) => {
    const preferences =
        extractPreferences(
            prompt,
            bikes
        );

    console.log(
        "RULE PREFERENCES:",
        preferences
    );

    return generateRecommendations(
        bikes,
        preferences
    );
};


// =========================================================
// AI-BASED RECOMMENDATIONS
// =========================================================

const getRecommendationsFromAI = async (
    prompt,
    bikes,
    aiPreferences
) => {
    const preferences =
        normalizeAIPreferences(
            aiPreferences,
            bikes,
            prompt
        );

    console.log(
        "NORMALIZED AI PREFERENCES:",
        preferences
    );

    return generateRecommendations(
        bikes,
        preferences
    );
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    getRecommendations,
    getRecommendationsFromAI
};