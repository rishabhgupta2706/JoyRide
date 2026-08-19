import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBookings = async () => {
        try {
            const response = await api.get("/bookings");

            setBookings(response.data.bookings);
        } catch (error) {
            console.error("GET ALL BOOKINGS ERROR:", error);

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

    const updateStatus = async (bookingId, status) => {
        try {
            await api.patch(`/bookings/${bookingId}/status`, {
                status
            });

            await fetchBookings();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to update booking status."
            );
        }
    };

    if (loading) {
        return <h2>Loading bookings...</h2>;
    }

    return (
        <div>
            <h1>Admin Bookings</h1>

            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>

            {error && <p>{error}</p>}

            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                bookings.map((booking) => (
                    <div key={booking._id}>
                        <hr />

                        <h2>
                            {booking.bike?.name || "Bike"}
                        </h2>

                        <p>
                            Customer:{" "}
                            {booking.user?.name || "Unknown"}
                        </p>

                        <p>
                            Email:{" "}
                            {booking.user?.email || "Unknown"}
                        </p>

                        <p>
                            Pickup Location:{" "}
                            {booking.pickupLocation}
                        </p>

                        <p>
                            Start:{" "}
                            {new Date(
                                booking.startDate
                            ).toLocaleString()}
                        </p>

                        <p>
                            End:{" "}
                            {new Date(
                                booking.endDate
                            ).toLocaleString()}
                        </p>

                        <p>
                            Total Amount: ₹
                            {booking.totalAmount}
                        </p>

                        <p>
                            Status: {booking.status}
                        </p>

                        <div>
                            {booking.status === "pending" && (
                                <>
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                booking._id,
                                                "confirmed"
                                            )
                                        }
                                    >
                                        Confirm
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                booking._id,
                                                "cancelled"
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}

                            {booking.status === "confirmed" && (
                                <>
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                booking._id,
                                                "completed"
                                            )
                                        }
                                    >
                                        Complete
                                    </button>

                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                booking._id,
                                                "cancelled"
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default AdminBookings;