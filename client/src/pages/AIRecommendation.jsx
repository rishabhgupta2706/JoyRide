import { useState } from "react";
import api from "../services/api";

function AIRecommendation() {
    const [prompt, setPrompt] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getRecommendations = async () => {
        if (!prompt.trim()) {
            setError(
                "Please describe what kind of bike you are looking for."
            );
            return;
        }

        setLoading(true);
        setError("");
        setRecommendations([]);

        try {
            const response = await api.post(
                "/ai/recommend",
                {
                    prompt
                }
            );

            setRecommendations(
                response.data.recommendations || []
            );
        } catch (error) {
            console.error(
                "AI RECOMMENDATION ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to get bike recommendations."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>AI Bike Recommendation</h1>

            <p>
                Tell JoyRide what kind of bike you are
                looking for.
            </p>

            <div>
                <textarea
                    value={prompt}
                    onChange={(e) =>
                        setPrompt(e.target.value)
                    }
                    placeholder="Example: I want a cheap bike in Chennai"
                    rows="5"
                    cols="50"
                />
            </div>

            <br />

            <button
                onClick={getRecommendations}
                disabled={loading}
            >
                {loading
                    ? "Finding Bikes..."
                    : "Get Recommendation"}
            </button>

            {error && (
                <p>{error}</p>
            )}

            {recommendations.length > 0 && (
                <div>
                    <h2>
                        Recommended Bikes
                    </h2>

                    {recommendations.map(
                        (recommendation) => {
                            const bike =
                                recommendation.bike;

                            return (
                                <div
                                    key={bike._id}
                                >
                                    <hr />

                                    {bike.image && (
                                        <img
                                            src={
                                                bike.image
                                            }
                                            alt={
                                                bike.name
                                            }
                                            width="250"
                                        />
                                    )}

                                    <h3>
                                        {bike.name}
                                    </h3>

                                    <p>
                                        Brand:{" "}
                                        {bike.brand}
                                    </p>

                                    <p>
                                        Model:{" "}
                                        {bike.model}
                                    </p>

                                    <p>
                                        Category:{" "}
                                        {bike.category}
                                    </p>

                                    <p>
                                        Location:{" "}
                                        {bike.location}
                                    </p>

                                    <p>
                                        Price: ₹
                                        {
                                            bike.pricePerHour
                                        }
                                        /hour
                                    </p>

                                    <p>
                                        Status:{" "}
                                        {bike.status}
                                    </p>

                                    <h4>
                                        Why this bike
                                        was recommended
                                    </h4>

                                    <ul>
                                        {recommendation.reasons.map(
                                            (
                                                reason,
                                                index
                                            ) => (
                                                <li
                                                    key={
                                                        index
                                                    }
                                                >
                                                    {
                                                        reason
                                                    }
                                                </li>
                                            )
                                        )}
                                    </ul>

                                    <p>
                                        Recommendation
                                        Score:{" "}
                                        {
                                            recommendation.score
                                        }
                                    </p>
                                </div>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
}

export default AIRecommendation;