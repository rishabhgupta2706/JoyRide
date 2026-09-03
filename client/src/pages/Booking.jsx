import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function Booking() {
    const location = useLocation();
    const navigate = useNavigate();

    const bike = location.state?.bike;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");

    const [availability, setAvailability] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Get current date and time in the format required by datetime-local
    const getMinDateTime = () => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Check bike availability whenever dates change
    useEffect(() => {
        const checkAvailability = async () => {
            if (!startDate || !endDate || !bike) {
                setAvailability(null);
                return;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();

            if (start <= now || end <= start) {
                setAvailability(null);
                return;
            }

            try {
                setCheckingAvailability(true);
                setError("");

                const response = await api.get(
                    `/bikes/${bike._id}/availability`,
                    {
                        params: {
                            startDate,
                            endDate
                        }
                    }
                );

                setAvailability(response.data);
            } catch (error) {
                console.error(
                    "CHECK AVAILABILITY ERROR:",
                    error
                );

                setAvailability(null);

                setError(
                    error.response?.data?.message ||
                    "Failed to check bike availability."
                );
            } finally {
                setCheckingAvailability(false);
            }
        };

        checkAvailability();
    }, [startDate, endDate, bike]);

    // If bike information was not passed from the previous page
    if (!bike) {
        return (
            <div>
                <h2>Bike information not found</h2>

                <p>
                    Please select a bike again before making a booking.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/bikes")}
                >
                    Back to Bikes
                </button>
            </div>
        );
    }

    // Calculate rental duration
    const calculateHours = () => {
        if (!startDate || !endDate) {
            return 0;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const difference = end - start;

        if (difference <= 0) {
            return 0;
        }

        return Math.ceil(
            difference / (1000 * 60 * 60)
        );
    };

    const hours = calculateHours();

    const estimatedAmount =
        hours * Number(bike.pricePerHour || 0);

    // When start date changes, reset invalid end date
    const handleStartDateChange = (value) => {
        setStartDate(value);
        setAvailability(null);
        setError("");

        if (endDate && new Date(endDate) <= new Date(value)) {
            setEndDate("");
        }
    };

    // Handle booking submission
    const handleBooking = async (e) => {
        e.preventDefault();

        setError("");

        if (!startDate || !endDate || !pickupLocation.trim()) {
            setError("All fields are required.");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start <= now) {
            setError(
                "Start date and time must be in the future."
            );
            return;
        }

        if (end <= start) {
            setError(
                "End date must be after start date."
            );
            return;
        }

        if (hours <= 0) {
            setError(
                "Rental duration must be greater than zero."
            );
            return;
        }

        if (!availability?.available) {
            setError(
                "Please select an available time before booking."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/bookings", {
                bike: bike._id,
                startDate,
                endDate,
                pickupLocation: pickupLocation.trim()
            });

            console.log(
                "BOOKING RESPONSE:",
                response.data
            );

            navigate("/bookings");
        } catch (error) {
            console.error(
                "CREATE BOOKING ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Booking failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="booking-page">

        <div className="booking-container">

            {/* BACK BUTTON */}

            <button
                type="button"
                className="booking-back"
                onClick={() =>
                    navigate(`/bikes/${bike._id}`)
                }
            >
                ← Back to Bike
            </button>


            {/* MAIN BOOKING CARD */}

            <section className="booking-card">

                {/* LEFT SIDE - BIKE */}

                <div className="booking-bike-section">

                    <div className="booking-bike-image">

                        {bike.image ? (
                            <img
                                src={getOptimizedImageUrl(
                                    bike.image,
                                    800
                                )}
                                alt={bike.name}
                            />
                        ) : (
                            <div className="booking-image-placeholder">
                                No Image Available
                            </div>
                        )}

                    </div>

                    <div className="booking-bike-content">

                        <p className="booking-label">
                            JOYRIDE BIKE
                        </p>

                        <h1>
                            {bike.name}
                        </h1>

                        <p className="booking-bike-brand">
                            {bike.brand} {bike.model}
                        </p>

                        <div className="booking-bike-price">

                            <strong>
                                ₹{bike.pricePerHour}
                            </strong>

                            <span>
                                /hour
                            </span>

                        </div>

                    </div>

                </div>


                {/* RIGHT SIDE - FORM */}

                <div className="booking-form-section">

                    <div className="booking-form-header">

                        <p className="booking-label">
                            RESERVE YOUR RIDE
                        </p>

                        <h2>
                            Book Your Bike
                        </h2>

                        <p>
                            Select your rental time and pickup location.
                        </p>

                    </div>


                    <form onSubmit={handleBooking}>

                        {/* START DATE */}

                        <div className="booking-field">

    <label>
        Start Date and Time
    </label>

    <div className="booking-datetime-wrapper">

        <input
            type="datetime-local"
            value={startDate}
            min={getMinDateTime()}
            onChange={(e) =>
                handleStartDateChange(
                    e.target.value
                )
            }
            onClick={(e) => {
                if (e.currentTarget.showPicker) {
                    e.currentTarget.showPicker();
                }
            }}
            required
        />

        <span className="booking-datetime-icon">
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 17H5V10h14v9ZM7 12h3v3H7v-3Z"
                />
            </svg>
        </span>

    </div>

</div>


                        {/* END DATE */}
<div className="booking-field">

    <label>
        End Date and Time
    </label>

    <div className="booking-datetime-wrapper">

        <input
            type="datetime-local"
            value={endDate}
            min={
                startDate ||
                getMinDateTime()
            }
            onChange={(e) => {
                setEndDate(e.target.value);
                setAvailability(null);
                setError("");
            }}
            onClick={(e) => {
                if (e.currentTarget.showPicker) {
                    e.currentTarget.showPicker();
                }
            }}
            required
        />

        <span className="booking-datetime-icon">
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 17H5V10h14v9ZM7 12h3v3H7v-3Z"
                />
            </svg>
        </span>

    </div>

</div>


                        {/* AVAILABILITY */}

                        {checkingAvailability && (
                            <div className="booking-status checking">
                                Checking bike availability...
                            </div>
                        )}

                        {availability?.available && (
                            <div className="booking-status success">
                                {availability.message}
                            </div>
                        )}

                        {availability &&
                            !availability.available && (
                                <div className="booking-status unavailable">
                                    {availability.message}
                                </div>
                            )}


                        {/* PICKUP LOCATION */}

                        <div className="booking-field">

                            <label>
                                Pickup Location
                            </label>

                            <input
                                type="text"
                                value={pickupLocation}
                                onChange={(e) =>
                                    setPickupLocation(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter pickup location"
                                required
                            />

                        </div>


                        {/* PRICE SUMMARY */}

                        <div className="booking-summary">

                            <div className="booking-summary-row">

                                <span>
                                    Rental Hours
                                </span>

                                <strong>
                                    {hours}
                                </strong>

                            </div>

                            <div className="booking-summary-row">

                                <span>
                                    Price Per Hour
                                </span>

                                <strong>
                                    ₹{bike.pricePerHour}
                                </strong>

                            </div>

                            <div className="booking-summary-divider" />

                            <div className="booking-summary-total">

                                <span>
                                    Estimated Amount
                                </span>

                                <strong>
                                    ₹{estimatedAmount}
                                </strong>

                            </div>

                        </div>


                        {/* ERROR */}

                        {error && (
                            <div className="booking-error">
                                {error}
                            </div>
                        )}


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="booking-submit"
                            disabled={
                                loading ||
                                checkingAvailability ||
                                !availability?.available
                            }
                        >
                            {loading
                                ? "Creating Booking..."
                                : "Confirm Booking"}
                        </button>

                    </form>

                </div>

            </section>

        </div>

    </div>
);
}

export default Booking;