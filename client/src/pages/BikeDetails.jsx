import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function BikeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBike = async () => {
            try {
                const response = await api.get(`/bikes/${id}`);

                setBike(response.data.bike);
            } catch (error) {
                console.error("GET BIKE DETAILS ERROR:", error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load bike details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBike();
    }, [id]);

    if (loading) {
        return (
            <div className="bike-details-page">
                <div className="bike-details-message">
                    Loading bike details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bike-details-page">
                <div className="bike-details-message">
                    <h2>Something went wrong</h2>

                    <p>{error}</p>

                    <button
                        onClick={() => navigate("/bikes")}
                    >
                        Back to Bikes
                    </button>
                </div>
            </div>
        );
    }

    if (!bike) {
        return (
            <div className="bike-details-page">
                <div className="bike-details-message">
                    <h2>Bike not found</h2>

                    <button
                        onClick={() => navigate("/bikes")}
                    >
                        Back to Bikes
                    </button>
                </div>
            </div>
        );
    }

    const isAvailable = bike.status === "available";

    return (
        <div className="bike-details-page">

            <div className="bike-details-container">

                {/* BACK BUTTON */}

                <button
                    className="bike-details-back"
                    onClick={() => navigate("/bikes")}
                >
                    ← Back to Bikes
                </button>


                {/* MAIN DETAILS */}

                <section className="bike-details-card">

                    {/* IMAGE */}

                    <div className="bike-details-image">

                        {bike.image ? (
                            <img
                                src={getOptimizedImageUrl(
                                    bike.image,
                                    1200
                                )}
                                alt={bike.name}
                            />
                        ) : (
                            <div className="bike-details-image-placeholder">
                                No Image Available
                            </div>
                        )}

                    </div>


                    {/* CONTENT */}

                    <div className="bike-details-content">

                        {/* TOP SECTION */}

                        <div className="bike-details-top">

                            <div>
                                <p className="bike-details-label">
                                    JOYRIDE BIKE
                                </p>

                                <h1>
                                    {bike.name}
                                </h1>

                                <p className="bike-details-brand">
                                    {bike.brand} {bike.model}
                                </p>
                            </div>

                            <span
                                className={
                                    isAvailable
                                        ? "bike-details-status available"
                                        : "bike-details-status"
                                }
                            >
                                {bike.status}
                            </span>

                        </div>


                        {/* INFORMATION */}

                        <div className="bike-details-info">

                            {/* CATEGORY */}

                            <div className="bike-details-info-item">

                                <div className="bike-details-info-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M20.59 13.41 11 3.83A2.83 2.83 0 0 0 9 3H5a2 2 0 0 0-2 2v4c0 .53.21 1.04.59 1.41l9.59 9.59a2 2 0 0 0 2.82 0l4.59-4.59a2 2 0 0 0 0-2.82ZM6.5 8A1.5 1.5 0 1 1 6.5 5a1.5 1.5 0 0 1 0 3Z"
                                        />
                                    </svg>
                                </div>

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {bike.category}
                                </strong>

                            </div>


                            {/* LOCATION */}

                            <div className="bike-details-info-item">

                                <div className="bike-details-info-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
                                        />
                                    </svg>
                                </div>

                                <span>
                                    Location
                                </span>

                                <strong>
                                    {bike.location}
                                </strong>

                            </div>


                            {/* MODEL YEAR */}

                            <div className="bike-details-info-item">

                                <div className="bike-details-info-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 17H5V10h14v9ZM7 12h4v3H7v-3Z"
                                        />
                                    </svg>
                                </div>

                                <span>
                                    Model Year
                                </span>

                                <strong>
                                    {bike.model}
                                </strong>

                            </div>


                            {/* RENTAL PRICE */}

                            <div className="bike-details-info-item">

                                <div className="bike-details-info-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M13.5 3h-3v2.1C8.07 5.55 6.5 7.1 6.5 9.2c0 2.72 2.03 3.76 5.18 4.55 2.2.56 2.82 1.08 2.82 2.12 0 1.02-.94 1.7-2.38 1.7-1.57 0-2.65-.78-3.32-2.04l-2.47 1.43c.9 1.73 2.28 2.72 4.17 3.16V22h3v-1.86c2.55-.42 4-2.02 4-4.38 0-2.68-1.87-3.72-5.08-4.55-2.27-.59-2.92-1.13-2.92-2.14 0-.9.77-1.52 2-1.52 1.22 0 2.05.59 2.67 1.67l2.42-1.48c-.77-1.43-1.8-2.32-3.09-2.68V3Z"
                                        />
                                    </svg>
                                </div>

                                <span>
                                    Rental Price
                                </span>

                                <strong>
                                    ₹{bike.pricePerHour}/hour
                                </strong>

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        {bike.description && (
                            <div className="bike-details-description">

                                <h2>
                                    About this bike
                                </h2>

                                <p>
                                    {bike.description}
                                </p>

                            </div>
                        )}


                        {/* FOOTER */}

                        <div className="bike-details-footer">

                            <div className="bike-details-price">

                                <strong>
                                    ₹{bike.pricePerHour}
                                </strong>

                                <span>
                                    /hour
                                </span>

                            </div>


                            {user?.role !== "admin" && (
                                <button
                                    className="bike-details-book"
                                    disabled={!isAvailable}
                                    onClick={() =>
                                        navigate("/booking", {
                                            state: { bike }
                                        })
                                    }
                                >
                                    {isAvailable
                                        ? "Book This Bike"
                                        : "Currently Unavailable"}
                                </button>
                            )}

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default BikeDetails;