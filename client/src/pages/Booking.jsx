import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Booking() {
    const location = useLocation();
    const navigate = useNavigate();

    const bike = location.state?.bike;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        if (end <= start) {
            setError("End date must be after start date.");
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

            console.log("BOOKING RESPONSE:", response.data);

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
                onClick={() => navigate(`/bikes/${bike._id}`)}
            >
                Back to Bike
            </button>

            <h1>Book {bike.name}</h1>

            <p>
                Price: ₹{bike.pricePerHour}/hour
            </p>

            <form onSubmit={handleBooking}>
                <div>
                    <label>Start Date and Time</label>

                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>End Date and Time</label>

                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Pickup Location</label>

                    <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) =>
                            setPickupLocation(e.target.value)
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
                        Estimated Amount: ₹{estimatedAmount}
                    </p>
                </div>

                {error && <p>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
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