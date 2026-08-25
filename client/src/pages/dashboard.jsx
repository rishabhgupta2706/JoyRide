import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await api.get(
                    "/bookings/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setBookings(
                    response.data.bookings || []
                );

            } catch (error) {
                console.error(
                    "DASHBOARD BOOKINGS ERROR:",
                    error
                );

                setBookingError(
                    error.response?.data?.message ||
                    "Failed to load your bookings."
                );

            } finally {
                setLoadingBookings(false);
            }
        };

        fetchMyBookings();
    }, []);

    const activeBookings = bookings.filter(
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

    const latestBooking = bookings[0];

    return (
        <div className="dashboard-page">

            {/* Hero Section */}

            <section className="dashboard-hero">

                <div className="dashboard-hero-content">

                    <p className="dashboard-label">
                        WELCOME TO JOYRIDE
                    </p>

                    <h1>
                        Welcome back,{" "}
                        <span>
                            {user?.name || "Rider"}
                        </span>
                    </h1>

                    <p className="dashboard-subtitle">
                        Find the perfect bike, book your ride,
                        and start your journey.
                    </p>

                    <div className="dashboard-actions">

                        <button
                            className="dashboard-primary-button"
                            onClick={() =>
                                navigate("/bikes")
                            }
                        >
                            Browse Bikes
                        </button>

                        <button
                            className="dashboard-secondary-button"
                            onClick={() =>
                                navigate("/ai-recommendation")
                            }
                        >
                            Get AI Recommendation
                        </button>

                    </div>

                </div>

            </section>


            {/* Quick Actions */}

            <section className="dashboard-section">

                <div className="dashboard-section-header">

                    <h2>
                        Quick Actions
                    </h2>

                    <p>
                        Everything you need for your next ride.
                    </p>

                </div>


                <div className="dashboard-card-grid">

                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate("/bikes")
                        }
                    >

                        <div className="dashboard-card-icon">
                            B
                        </div>

                        <h3>
                            Browse Bikes
                        </h3>

                        <p>
                            Explore available bikes and
                            find one that fits your needs.
                        </p>

                        <span>
                            Explore Bikes →
                        </span>

                    </div>


                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate(
                                "/ai-recommendation"
                            )
                        }
                    >

                        <div className="dashboard-card-icon">
                            AI
                        </div>

                        <h3>
                            AI Recommendation
                        </h3>

                        <p>
                            Tell JoyRide what you need and
                            let AI find the right bike for you.
                        </p>

                        <span>
                            Find My Bike →
                        </span>

                    </div>


                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate("/bookings")
                        }
                    >

                        <div className="dashboard-card-icon">
                            R
                        </div>

                        <h3>
                            My Bookings
                        </h3>

                        <p>
                            View your current and previous
                            bike rental bookings.
                        </p>

                        <span>
                            View Bookings →
                        </span>

                    </div>

                </div>

            </section>


            {/* Rental Activity */}

            <section className="dashboard-section dashboard-activity">

                <div className="dashboard-section-header">

                    <h2>
                        Your Rental Activity
                    </h2>

                    <p>
                        A quick overview of your JoyRide bookings.
                    </p>

                </div>


                {loadingBookings && (
                    <div className="dashboard-message">
                        Loading your bookings...
                    </div>
                )}


                {!loadingBookings && bookingError && (
                    <div className="dashboard-message dashboard-error">
                        {bookingError}
                    </div>
                )}


                {!loadingBookings &&
                    !bookingError && (
                        <>
                            <div className="dashboard-stats">

                                <div className="dashboard-stat-card">

                                    <span>
                                        Total Bookings
                                    </span>

                                    <strong>
                                        {bookings.length}
                                    </strong>

                                </div>


                                <div className="dashboard-stat-card">

                                    <span>
                                        Active
                                    </span>

                                    <strong>
                                        {activeBookings.length}
                                    </strong>

                                </div>


                                <div className="dashboard-stat-card">

                                    <span>
                                        Completed
                                    </span>

                                    <strong>
                                        {completedBookings.length}
                                    </strong>

                                </div>


                                <div className="dashboard-stat-card">

                                    <span>
                                        Cancelled
                                    </span>

                                    <strong>
                                        {cancelledBookings.length}
                                    </strong>

                                </div>

                            </div>


                            {latestBooking && (
                                <div className="dashboard-latest-booking">

                                    <div>

                                        <p className="dashboard-booking-label">
                                            LATEST BOOKING
                                        </p>

                                        <h3>
                                            {latestBooking.bike?.name ||
                                                "Bike"}
                                        </h3>

                                        <p>
                                            {latestBooking.bike?.brand ||
                                                ""}
                                            {" "}
                                            {latestBooking.bike?.model ||
                                                ""}
                                        </p>

                                    </div>


                                    <div className="dashboard-booking-info">

                                        <span>
                                            Status
                                        </span>

                                        <strong
                                            className={`booking-status ${latestBooking.status}`}
                                        >
                                            {latestBooking.status}
                                        </strong>

                                    </div>


                                    <div className="dashboard-booking-info">

                                        <span>
                                            Pickup
                                        </span>

                                        <strong>
                                            {latestBooking.pickupLocation}
                                        </strong>

                                    </div>


                                    <div className="dashboard-booking-info">

                                        <span>
                                            Amount
                                        </span>

                                        <strong>
                                            ₹{latestBooking.totalAmount}
                                        </strong>

                                    </div>


                                    <button
                                        className="dashboard-view-bookings"
                                        onClick={() =>
                                            navigate("/bookings")
                                        }
                                    >
                                        View My Bookings
                                    </button>

                                </div>
                            )}


                            {!latestBooking && (
                                <div className="dashboard-empty">

                                    <h3>
                                        No bookings yet
                                    </h3>

                                    <p>
                                        Your next ride is waiting for you.
                                    </p>

                                    <button
                                        className="dashboard-primary-button"
                                        onClick={() =>
                                            navigate("/bikes")
                                        }
                                    >
                                        Find a Bike
                                    </button>

                                </div>
                            )}

                        </>
                    )}

            </section>


            {/* How JoyRide Works */}

            <section className="dashboard-section dashboard-how">

                <div className="dashboard-section-header">

                    <h2>
                        How JoyRide Works
                    </h2>

                    <p>
                        Getting your next ride is simple.
                    </p>

                </div>


                <div className="dashboard-steps">

                    <div className="dashboard-step">

                        <div className="dashboard-step-number">
                            01
                        </div>

                        <h3>
                            Find Your Bike
                        </h3>

                        <p>
                            Browse our available bikes or
                            use AI to find the right one.
                        </p>

                    </div>


                    <div className="dashboard-step">

                        <div className="dashboard-step-number">
                            02
                        </div>

                        <h3>
                            Choose Your Time
                        </h3>

                        <p>
                            Select your pickup and return
                            time and check availability.
                        </p>

                    </div>


                    <div className="dashboard-step">

                        <div className="dashboard-step-number">
                            03
                        </div>

                        <h3>
                            Book & Ride
                        </h3>

                        <p>
                            Confirm your booking and enjoy
                            your ride with JoyRide.
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;