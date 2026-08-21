import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingBooking, setUpdatingBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/bookings", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

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
            const token = localStorage.getItem("token");

            setUpdatingBooking(bookingId);
            setError("");

            await api.patch(
                `/bookings/${bookingId}/status`,
                {
                    status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchBookings();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to update booking status."
            );
        } finally {
            setUpdatingBooking(null);
        }
    };

    if (loading) {
        return <h2>Loading bookings...</h2>;
    }

    return (
        <div>
            <h1>Admin Bookings</h1>

            <button onClick={() => navigate("/admin")}>
                Back to Admin Dashboard
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
                                        disabled={
                                            updatingBooking ===
                                            booking._id
                                        }
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
                                        disabled={
                                            updatingBooking ===
                                            booking._id
                                        }
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
                                        disabled={
                                            updatingBooking ===
                                            booking._id
                                        }
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
                                        disabled={
                                            updatingBooking ===
                                            booking._id
                                        }
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