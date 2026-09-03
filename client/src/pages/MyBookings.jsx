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
    // Separate bookings by status and date

const now = new Date();

const upcomingBookings = bookings.filter(
    (booking) =>
        (
            booking.status === "pending" ||
            booking.status === "confirmed"
        ) &&
        new Date(booking.endDate) >= now
);

const completedBookings = bookings.filter(
    (booking) =>
        booking.status === "completed"
);

const cancelledBookings = bookings.filter(
    (booking) =>
        booking.status === "cancelled"
);

const pastBookings = bookings.filter(
    (booking) =>
        (
            booking.status === "pending" ||
            booking.status === "confirmed"
        ) &&
        new Date(booking.endDate) < now
);

    const renderBookingCard = (booking) => {
        const bike = booking.bike;

        return (
    <article
        className="my-booking-card"
        key={booking._id}
    >

        {/* BIKE IMAGE */}

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
                <div className="my-booking-image-placeholder">
                    No Image
                </div>
            )}

        </div>


        {/* BOOKING CONTENT */}

        <div className="my-booking-content">

            {/* HEADER */}

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


            {/* BOOKING INFORMATION */}

            <div className="my-booking-info">

                <div className="my-booking-info-item">

                    <div className="my-booking-info-icon">
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
                        Pickup Location
                    </span>

                    <strong>
                        {booking.pickupLocation}
                    </strong>

                </div>


                <div className="my-booking-info-item">

                    <div className="my-booking-info-icon">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 17H5V10h14v9ZM7 12h3v3H7v-3Z"
                            />
                        </svg>
                    </div>

                    <span>
                        Start
                    </span>

                    <strong>
                        {formatDate(
                            booking.startDate
                        )}
                    </strong>

                </div>


                <div className="my-booking-info-item">

                    <div className="my-booking-info-icon">
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 17H5V10h14v9ZM7 12h3v3H7v-3Z"
                            />
                        </svg>
                    </div>

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


            {/* FOOTER */}

            <div className="my-booking-footer">

                <div className="my-booking-total">

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


                {/* CANCEL BUTTON */}

                {[
                    "pending",
                    "confirmed"
                ].includes(
                    booking.status
                ) && new Date(booking.endDate) >= now &&(
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

            {/* Past */}

{pastBookings.length > 0 && (
    <section className="my-bookings-section">

        <div className="my-bookings-section-header">

            <h2>
                Past Bookings
            </h2>

            <span>
                {pastBookings.length}
            </span>

        </div>

        <div className="my-bookings-list">

            {pastBookings.map(
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