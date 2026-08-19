import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBookings = async () => {
        try {
            const response = await api.get("/bookings/my");

            setBookings(response.data.bookings);
        } catch (error) {
            console.error("GET BOOKINGS ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load bookings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const cancelBooking = async (bookingId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.patch(`/bookings/${bookingId}/cancel`);

            await fetchBookings();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to cancel booking."
            );
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    if (loading) {
        return <h2>Loading bookings...</h2>;
    }

    return (
        <div>
            <h1>My Bookings</h1>

            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>

            {error && <p>{error}</p>}

            {!error && bookings.length === 0 && (
                <div>
                    <h2>No bookings yet</h2>

                    <button onClick={() => navigate("/bikes")}>
                        Browse Bikes
                    </button>
                </div>
            )}

            {bookings.map((booking) => (
                <div key={booking._id}>
                    <hr />

                    <h2>
                        {booking.bike?.name || "Bike"}
                    </h2>

                    <p>
                        Brand: {booking.bike?.brand || "N/A"}
                    </p>

                    <p>
                        Pickup Location: {booking.pickupLocation}
                    </p>

                    <p>
                        Start: {formatDate(booking.startDate)}
                    </p>

                    <p>
                        End: {formatDate(booking.endDate)}
                    </p>

                    <p>
                        Total Amount: ₹{booking.totalAmount}
                    </p>

                    <p>
                        Status: {booking.status}
                    </p>

                    {["pending", "confirmed"].includes(booking.status) && (
                        <button
                            onClick={() =>
                                cancelBooking(booking._id)
                            }
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default MyBookings;