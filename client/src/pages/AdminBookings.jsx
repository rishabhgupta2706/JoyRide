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

            setBookings(response.data.bookings || []);
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
            setError(
                error.response?.data?.message ||
                "Failed to update booking status."
            );
        } finally {
            setUpdatingBooking(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const getStatusClass = (status) => {
        return `admin-booking-status admin-booking-status-${status}`;
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <h2>Loading bookings...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">

            <section className="admin-page-hero">
                <p className="admin-eyebrow">
                    JOYRIDE ADMIN
                </p>

                <h1>Manage Bookings</h1>

                <p>
                    View and manage all customer bookings.
                </p>
            </section>

            <section className="admin-bookings-section">

                <div className="admin-section-header">
                    <div>
                        <h2>All Bookings</h2>

                        <p>
                            {bookings.length} booking
                            {bookings.length !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-back-button"
                        onClick={() => navigate("/admin")}
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="admin-empty-state">
                        <h2>No bookings found</h2>

                        <p>
                            Customer bookings will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="admin-bookings-list">

                        {bookings.map((booking) => (
                            <article
                                className="admin-booking-card"
                                key={booking._id}
                            >

                                <div className="admin-booking-header">

                                    <div>
                                        <p className="admin-booking-label">
                                            BIKE
                                        </p>

                                        <h2>
                                            {booking.bike?.name || "Bike"}
                                        </h2>

                                        <p className="admin-booking-brand">
                                            {booking.bike?.brand || "Unknown brand"}
                                        </p>
                                    </div>

                                    <span
                                        className={getStatusClass(
                                            booking.status
                                        )}
                                    >
                                        {booking.status}
                                    </span>

                                </div>

                                <div className="admin-booking-details">

                                    <div>
                                        <p className="admin-booking-label">
                                            CUSTOMER
                                        </p>

                                        <strong>
                                            {booking.user?.name || "Unknown"}
                                        </strong>

                                        <p>
                                            {booking.user?.email || "Unknown"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="admin-booking-label">
                                            PICKUP LOCATION
                                        </p>

                                        <strong>
                                            {booking.pickupLocation}
                                        </strong>
                                    </div>

                                    <div>
                                        <p className="admin-booking-label">
                                            START
                                        </p>

                                        <strong>
                                            {formatDate(booking.startDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <p className="admin-booking-label">
                                            END
                                        </p>

                                        <strong>
                                            {formatDate(booking.endDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <p className="admin-booking-label">
                                            AMOUNT
                                        </p>

                                        <strong>
                                            ₹
                                            {Number(
                                                booking.totalAmount || 0
                                            ).toLocaleString("en-IN")}
                                        </strong>
                                    </div>

                                </div>

                                {["pending", "confirmed"].includes(
                                    booking.status
                                ) && (
                                    <div className="admin-booking-actions">

                                        {booking.status === "pending" && (
                                            <button
                                                type="button"
                                                className="admin-action-button admin-confirm-button"
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
                                                {updatingBooking ===
                                                booking._id
                                                    ? "Updating..."
                                                    : "Confirm"}
                                            </button>
                                        )}

                                        {booking.status === "confirmed" && (
                                            <button
                                                type="button"
                                                className="admin-action-button admin-complete-button"
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
                                                {updatingBooking ===
                                                booking._id
                                                    ? "Updating..."
                                                    : "Complete"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="admin-action-button admin-cancel-button"
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
                                            {updatingBooking ===
                                            booking._id
                                                ? "Updating..."
                                                : "Cancel"}
                                        </button>

                                    </div>
                                )}

                            </article>
                        ))}

                    </div>
                )}

            </section>
        </div>
    );
}

export default AdminBookings;