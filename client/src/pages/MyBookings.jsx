import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function MyBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/bookings/my");

            setBookings(response.data.bookings || []);
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
            setCancellingId(bookingId);
            setError("");

            await api.patch(
                `/bookings/${bookingId}/cancel`,
                {}
            );

            await fetchBookings();
        } catch (error) {
            console.error(
                "CANCEL BOOKING ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to cancel booking."
            );
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN");
    };

    // Separate bookings by status
    const upcomingBookings = bookings.filter(
        (booking) =>
            booking.status === "pending" ||
            booking.status === "confirmed"
    );

    const completedBookings = bookings.filter(
        (booking) =>
            booking.status === "completed"
    );

    const cancelledBookings = bookings.filter(
        (booking) =>
            booking.status === "cancelled"
    );

    const renderBookingCard = (booking) => {
        const bike = booking.bike;

        return (
            <article
                className="my-booking-card"
                key={booking._id}
            >

                {/* Bike Image */}

                <div className="my-booking-image">

                    {bike?.image ? (
                        <img
                            src={getOptimizedImageUrl(
                                bike.image,
                                800
                            )}
                            alt={
                                bike.name ||
                                "Bike"
                            }
                        />
                    ) : (
                        <div>
                            No Image
                        </div>
                    )}

                </div>


                {/* Booking Content */}

                <div className="my-booking-content">

                    {/* Header */}

                    <div className="my-booking-header-row">

                        <div>

                            <p className="my-booking-label">
                                BIKE RENTAL
                            </p>

                            <h2>
                                {bike?.name || "Bike"}
                            </h2>

                            <p className="my-booking-brand">
                                {bike?.brand || "N/A"}{" "}
                                {bike?.model || ""}
                            </p>

                        </div>

                        <span
                            className={`my-booking-status ${booking.status}`}
                        >
                            {booking.status}
                        </span>

                    </div>


                    {/* Booking Information */}

                    <div className="my-booking-info">

                        <div>
                            <span>
                                Pickup Location
                            </span>

                            <strong>
                                {booking.pickupLocation}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Start
                            </span>

                            <strong>
                                {formatDate(
                                    booking.startDate
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>
                                End
                            </span>

                            <strong>
                                {formatDate(
                                    booking.endDate
                                )}
                            </strong>
                        </div>

                    </div>


                    {/* Footer */}

                    <div className="my-booking-footer">

                        <div>

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ₹
                                {formatAmount(
                                    booking.totalAmount
                                )}
                            </strong>

                        </div>


                        {/* Cancel Button */}

                        {[
                            "pending",
                            "confirmed"
                        ].includes(
                            booking.status
                        ) && (
                            <button
                                type="button"
                                className="my-booking-cancel"
                                disabled={
                                    cancellingId ===
                                    booking._id
                                }
                                onClick={() =>
                                    cancelBooking(
                                        booking._id
                                    )
                                }
                            >
                                {cancellingId ===
                                booking._id
                                    ? "Cancelling..."
                                    : "Cancel Booking"}
                            </button>
                        )}

                    </div>

                </div>

            </article>
        );
    };

    if (loading) {
        return (
            <div className="my-bookings-page">

                <div className="my-bookings-message">

                    Loading your bookings...

                </div>

            </div>
        );
    }

    return (
        <div className="my-bookings-page">

            {/* Page Header */}

            <section className="my-bookings-header">

                <p className="my-bookings-label">
                    JOYRIDE
                </p>

                <h1>
                    My Bookings
                </h1>

                <p>
                    Manage your current and previous
                    bike rental bookings.
                </p>

            </section>


            {/* Top Actions */}

            <div className="my-bookings-top-actions">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    Back to Dashboard
                </button>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/bikes")
                    }
                >
                    Browse Bikes
                </button>

            </div>


            {/* Error */}

            {error && (
                <div className="my-bookings-error">
                    {error}
                </div>
            )}


            {/* No bookings */}

            {!error && bookings.length === 0 && (
                <section className="my-bookings-empty">

                    <h2>
                        No bookings yet
                    </h2>

                    <p>
                        You haven't booked a bike yet.
                        Find your next ride and start
                        your journey with JoyRide.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/bikes")
                        }
                    >
                        Browse Bikes
                    </button>

                </section>
            )}


            {/* Upcoming */}

            {upcomingBookings.length > 0 && (
                <section className="my-bookings-section">

                    <div className="my-bookings-section-header">

                        <h2>
                            Upcoming Bookings
                        </h2>

                        <span>
                            {upcomingBookings.length}
                        </span>

                    </div>

                    <div className="my-bookings-list">

                        {upcomingBookings.map(
                            renderBookingCard
                        )}

                    </div>

                </section>
            )}


            {/* Completed */}

            {completedBookings.length > 0 && (
                <section className="my-bookings-section">

                    <div className="my-bookings-section-header">

                        <h2>
                            Completed
                        </h2>

                        <span>
                            {completedBookings.length}
                        </span>

                    </div>

                    <div className="my-bookings-list">

                        {completedBookings.map(
                            renderBookingCard
                        )}

                    </div>

                </section>
            )}


            {/* Cancelled */}

            {cancelledBookings.length > 0 && (
                <section className="my-bookings-section">

                    <div className="my-bookings-section-header">

                        <h2>
                            Cancelled
                        </h2>

                        <span>
                            {cancelledBookings.length}
                        </span>

                    </div>

                    <div className="my-bookings-list">

                        {cancelledBookings.map(
                            renderBookingCard
                        )}

                    </div>

                </section>
            )}

        </div>
    );
}

export default MyBookings;