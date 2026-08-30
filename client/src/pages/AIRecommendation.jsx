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

    const examplePrompts = [
        "I want a comfortable bike for a long trip",
        "I need a cheap bike for daily commuting",
        "I want an adventure bike under ₹100 per hour",
        "I need a bike in Chennai for a road trip"
    ];

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
                    prompt: prompt.trim()
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

    const handlePromptKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            e.ctrlKey
        ) {
            getRecommendations();
        }
    };

    const handleExampleClick = (example) => {
        setPrompt(example);
        setError("");
    };

    return (
        <div className="ai-page">

            {/* =================================================
                HERO / SEARCH
            ================================================= */}

            <section className="ai-hero">

                <div className="ai-hero-content">

                    <span className="ai-badge">
                        AI Powered
                    </span>

                    <h1>
                        Find Your Perfect Bike
                    </h1>

                    <p>
                        Tell JoyRide what you need and
                        our AI will recommend the best
                        available bikes for your ride.
                    </p>

                    <div className="ai-input-container">

                        <textarea
                            value={prompt}
                            onChange={(e) =>
                                setPrompt(e.target.value)
                            }
                            onKeyDown={
                                handlePromptKeyDown
                            }
                            placeholder={
                                "Example: I want a comfortable bike for a long trip in Chennai under ₹100 per hour"
                            }
                            rows={5}
                        />

                        <div className="ai-input-footer">

                            <span>
                                {prompt.length}/500
                            </span>

                            <button
                                onClick={
                                    getRecommendations
                                }
                                disabled={
                                    loading ||
                                    !prompt.trim()
                                }
                            >
                                {loading
                                    ? "Finding Bikes..."
                                    : "Find My Bike"}
                            </button>

                        </div>

                    </div>

                    <div className="ai-examples">

                        <p>
                            Try an example:
                        </p>

                        <div className="ai-example-list">

                            {examplePrompts.map(
                                (example) => (
                                    <button
                                        key={example}
                                        type="button"
                                        onClick={() =>
                                            handleExampleClick(
                                                example
                                            )
                                        }
                                    >
                                        {example}
                                    </button>
                                )
                            )}

                        </div>

                    </div>

                    <p className="ai-shortcut">
                        Tip: Press Ctrl + Enter to search
                    </p>

                </div>

            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="ai-message ai-error">
                    <strong>
                        Something went wrong
                    </strong>

                    <p>
                        {error}
                    </p>
                </div>
            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
                <section className="ai-loading">

                    <div className="ai-loading-spinner">
                        <div></div>
                    </div>

                    <h2>
                        Finding your perfect bike...
                    </h2>

                    <p>
                        Our AI is analyzing your
                        requirements and available bikes.
                    </p>

                </section>
            )}


            {/* =================================================
                NO RESULTS
            ================================================= */}

            {!loading &&
                !error &&
                recommendations.length === 0 &&
                message && (
                    <section className="ai-no-results">

                        <div className="ai-no-results-icon">
                            ?
                        </div>

                        <h2>
                            No matching bikes found
                        </h2>

                        <p>
                            {message}
                        </p>

                        <div className="ai-no-results-tips">

                            <span>
                                Try increasing your budget
                            </span>

                            <span>
                                Try another location
                            </span>

                            <span>
                                Try a different riding style
                            </span>

                        </div>

                    </section>
                )}


            {/* =================================================
                RESULTS
            ================================================= */}

            {!loading &&
                recommendations.length > 0 && (
                    <section className="ai-results">

                        <div className="ai-results-header">

                            <div>
                                <span className="ai-results-label">
                                    AI RESULTS
                                </span>

                                <h2>
                                    Recommended For You
                                </h2>

                                <p>
                                    Based on your requirements,
                                    these bikes are the best matches.
                                </p>
                            </div>

                            <div className="ai-results-count">
                                {recommendations.length}{" "}
                                {recommendations.length === 1
                                    ? "Bike"
                                    : "Bikes"}
                            </div>

                        </div>


                        <div className="ai-bike-grid">

                            {recommendations.map(
                                (recommendation, index) => {

                                    const bike =
                                        recommendation.bike;

                                    return (
                                        <article
                                            className="ai-bike-card"
                                            key={bike._id}
                                        >

                                            {/* Ranking */}

                                            <div className="ai-rank">
                                                #{index + 1}
                                            </div>


                                            {/* Image */}

                                            <div className="ai-bike-image">

                                                {bike.image ? (
                                                    <img
                                                        src={getOptimizedImageUrl(
                                                            bike.image,
                                                            800
                                                        )}
                                                        alt={
                                                            bike.name
                                                        }
                                                    />
                                                ) : (
                                                    <div className="ai-bike-no-image">
                                                        No Image
                                                    </div>
                                                )}

                                            </div>


                                            {/* Content */}

                                            <div className="ai-bike-content">

                                                <div className="ai-bike-title-row">

                                                    <div>

                                                        <h3>
                                                            {bike.name}
                                                        </h3>

                                                        <p className="ai-bike-subtitle">
                                                            {bike.brand}{" "}
                                                            {bike.model}
                                                        </p>

                                                    </div>

                                                    <span className="ai-available">
                                                        Available
                                                    </span>

                                                </div>


                                                {/* Bike details */}

                                                <div className="ai-bike-meta">

                                                    <div>
                                                        <span>
                                                            Category
                                                        </span>

                                                        <strong>
                                                            {
                                                                bike.category
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Location
                                                        </span>

                                                        <strong>
                                                            {
                                                                bike.location
                                                            }
                                                        </strong>
                                                    </div>

                                                </div>


                                                {/* Price */}

                                                <div className="ai-bike-price">

                                                    <strong>
                                                        ₹
                                                        {
                                                            bike.pricePerHour
                                                        }
                                                    </strong>

                                                    <span>
                                                        / hour
                                                    </span>

                                                </div>


                                                {/* Why recommended */}

                                                <div className="ai-reasons">

                                                    <h4>
                                                        Why this bike?
                                                    </h4>

                                                    <ul>

                                                        {recommendation.reasons?.map(
                                                            (
                                                                reason,
                                                                reasonIndex
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        reasonIndex
                                                                    }
                                                                >
                                                                    <span>
                                                                        ✓
                                                                    </span>

                                                                    {reason}
                                                                </li>
                                                            )
                                                        )}

                                                    </ul>

                                                </div>


                                                {/* Actions */}

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
                                                            navigate(
                                                                "/booking",
                                                                {
                                                                    state: {
                                                                        bike
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    >
                                                        Book This Bike
                                                    </button>

                                                </div>

                                            </div>

                                        </article>
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