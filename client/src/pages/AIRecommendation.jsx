import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function AIRecommendation() {
    const navigate = useNavigate();

    const [prompt, setPrompt] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getRecommendations = async () => {
        if (!prompt.trim()) {
            setError(
                "Please describe what kind of bike you are looking for."
            );

            setRecommendations([]);
            setMessage("");

            return;
        }

        setLoading(true);
        setError("");
        setMessage("");
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

            setMessage(
                response.data.message || ""
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

            setRecommendations([]);
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-page">

            <section className="ai-hero">

                <h1>
                    AI Bike Recommendation
                </h1>

                <p>
                    Tell JoyRide what kind of bike you
                    are looking for.
                </p>

                <textarea
                    value={prompt}
                    onChange={(e) =>
                        setPrompt(e.target.value)
                    }
                    placeholder="Example: I want a cheap bike in Chennai"
                    rows="5"
                />

                <br />

                <button
                    onClick={getRecommendations}
                    disabled={loading}
                >
                    {loading
                        ? "Finding Bikes..."
                        : "Get Recommendation"}
                </button>

            </section>


            {/* Error Message */}

            {error && (
                <p className="ai-error">
                    {error}
                </p>
            )}


            {/* Loading Message */}

            {loading && (
                <div className="ai-no-results">
                    <h2>
                        Finding the best bikes for you...
                    </h2>
                </div>
            )}


            {/* No Results */}

            {!loading &&
                !error &&
                recommendations.length === 0 &&
                message && (
                    <div className="ai-no-results">

                        <h2>
                            No bikes found
                        </h2>

                        <p>
                            {message}
                        </p>

                        <p>
                            Try increasing your budget
                            or changing your location.
                        </p>

                    </div>
                )}


            {/* Recommendations */}

            {!loading &&
                recommendations.length > 0 && (
                    <section className="ai-results">

                        <h2>
                            Recommended Bikes
                        </h2>

                        <div className="ai-bike-grid">

                            {recommendations.map(
                                (recommendation) => {

                                    const bike =
                                        recommendation.bike;

                                    return (
                                        <div
                                            className="ai-bike-card"
                                            key={bike._id}
                                        >

                                            {/* Bike Image */}

                                            <div className="ai-bike-image">

                                                {bike.image ? (
                                                    <img
                                                        src={
                                                            bike.image
                                                        }
                                                        alt={
                                                            bike.name
                                                        }
                                                    />
                                                ) : (
                                                    <div>
                                                        No Image
                                                    </div>
                                                )}

                                            </div>


                                            {/* Bike Information */}

                                            <div className="ai-bike-content">

                                                <h3>
                                                    {bike.name}
                                                </h3>

                                                <p>
                                                    {bike.brand}{" "}
                                                    {bike.model}
                                                </p>

                                                <p>
                                                    Category:{" "}
                                                    {
                                                        bike.category
                                                    }
                                                </p>

                                                <p>
                                                    Location:{" "}
                                                    {
                                                        bike.location
                                                    }
                                                </p>


                                                {/* Price */}

                                                <div>
                                                    <strong>
                                                        ₹
                                                        {
                                                            bike.pricePerHour
                                                        }
                                                    </strong>

                                                    <span>
                                                        /hour
                                                    </span>
                                                </div>


                                                {/* Status */}

                                                <p>
                                                    Status:{" "}
                                                    {
                                                        bike.status
                                                    }
                                                </p>


                                                {/* Reasons */}

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


                                                {/* View Details */}

                                                <div className="ai-bike-actions">

    <button
        className="ai-details-button"
        onClick={() =>
            navigate(
                `/bikes/${bike._id}`
            )
        }
    >
        View Details
    </button>

    <button
        className="ai-book-button"
        onClick={() =>
            navigate("/booking", {
                state: {
                    bike
                }
            })
        }
    >
        Book This Bike
    </button>

</div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </section>
                )}

        </div>
    );
}

export default AIRecommendation; 