import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

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

    useEffect(() => {
        const checkAvailability = async () => {
            if (!startDate || !endDate || !bike) {
                setAvailability(null);
                return;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start <= new Date() || end <= start) {
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

    if (!bike) {
        return (
            <div>
                <h2>Bike information not found</h2>

                <button onClick={() => navigate("/bikes")}>
                    Back to Bikes
                </button>
            </div>
        );
    }

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

    const estimatedAmount = hours * bike.pricePerHour;

    const handleBooking = async (e) => {
        e.preventDefault();

        setError("");

        if (!startDate || !endDate || !pickupLocation) {
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

        if (!availability?.available) {
            setError(
                "Please select an available time before booking."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/bookings", {
                bike: bike._id,
                startDate,
                endDate,
                pickupLocation
            });

            console.log(
                "BOOKING RESPONSE:",
                response.data
            );

            navigate("/bookings");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Booking failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={() =>
                    navigate(`/bikes/${bike._id}`)
                }
            >
                Back to Bike
            </button>

            <h1>Book {bike.name}</h1>

            <p>
                Price: ₹{bike.pricePerHour}/hour
            </p>

            <form onSubmit={handleBooking}>
                <div>
                    <label>
                        Start Date and Time
                    </label>

                    <input
                        type="datetime-local"
                        value={startDate}
                        min={new Date()
                            .toISOString()
                            .slice(0, 16)}
                        onChange={(e) =>
                            setStartDate(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>
                        End Date and Time
                    </label>

                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(e.target.value)
                        }
                        required
                    />
                </div>

                {checkingAvailability && (
                    <p>
                        Checking bike availability...
                    </p>
                )}

                {availability?.available && (
                    <p>
                        {availability.message}
                    </p>
                )}

                {availability &&
                    !availability.available && (
                        <p>
                            {availability.message}
                        </p>
                    )}

                <div>
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

                <div>
                    <p>
                        Rental Hours: {hours}
                    </p>

                    <p>
                        Estimated Amount: ₹
                        {estimatedAmount}
                    </p>
                </div>

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="submit"
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
    );
}

export default Booking;