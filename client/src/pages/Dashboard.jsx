import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [bikes, setBikes] = useState([]);

    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingBikes, setLoadingBikes] = useState(true);

    const [bookingError, setBookingError] = useState("");
    const [bikeError, setBikeError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem("token");

            try {
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

        fetchDashboardData();
    }, []);

    useEffect(() => {
        const fetchBikes = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await api.get(
                    "/bikes",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const availableBikes =
                    (response.data.bikes || [])
                        .filter(
                            (bike) =>
                                bike.status === "available"
                        )
                        .slice(0, 6);

                setBikes(availableBikes);
            } catch (error) {
                console.error(
                    "DASHBOARD BIKES ERROR:",
                    error
                );

                setBikeError(
                    error.response?.data?.message ||
                    "Failed to load bikes."
                );
            } finally {
                setLoadingBikes(false);
            }
        };

        fetchBikes();
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

            {/* =================================================
                HERO
            ================================================= */}

            <section className="dashboard-marketplace-hero">

                <div className="dashboard-hero-overlay">

                    <div className="dashboard-hero-content">

                        <p className="dashboard-label">
                            JOYRIDE BIKE RENTALS
                        </p>

                        <h1>
                            Your next ride
                            <br />
                            starts here.
                        </h1>

                        <p className="dashboard-subtitle">
                            Rent the right bike for your
                            commute, weekend escape,
                            or long-distance adventure.
                        </p>

                        <div className="dashboard-actions">

                            <button
                                className="dashboard-primary-button"
                                onClick={() =>
                                    navigate("/bikes")
                                }
                            >
                                Explore Bikes
                            </button>

                            <button
                                className="dashboard-secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/ai-recommendation"
                                    )
                                }
                            >
                                Find With AI
                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                QUICK SEARCH
            ================================================= */}

            <section className="dashboard-search-section">

                <div className="dashboard-search-box">

                    <div className="dashboard-search-content">

                        <span>
                            Find your ride
                        </span>

                        <h2>
                            Where do you want to ride?
                        </h2>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/bikes")
                        }
                    >
                        Browse Bikes
                    </button>

                </div>

            </section>


            {/* =================================================
                POPULAR BIKES
            ================================================= */}

            <section className="dashboard-section">

                <div className="dashboard-section-header">

                    <div>
                        <p className="dashboard-section-label">
                            OUR FLEET
                        </p>

                        <h2>
                            Popular Bikes
                        </h2>

                        <p>
                            Choose from bikes ready for
                            your next ride.
                        </p>
                    </div>

                    <button
                        className="dashboard-section-link"
                        onClick={() =>
                            navigate("/bikes")
                        }
                    >
                        View All Bikes →
                    </button>

                </div>


                {loadingBikes && (
                    <div className="dashboard-message">
                        Loading bikes...
                    </div>
                )}


                {!loadingBikes &&
                    bikeError && (
                        <div className="dashboard-message dashboard-error">
                            {bikeError}
                        </div>
                    )}


                {!loadingBikes &&
                    !bikeError &&
                    bikes.length > 0 && (

                        <div className="dashboard-bike-grid">

                            {bikes.map((bike) => (

                                <article
                                    className="dashboard-bike-card"
                                    key={bike._id}
                                >

                                    <div className="dashboard-bike-image">

                                        {bike.image ? (
                                            <img
                                                src={getOptimizedImageUrl(
                                                    bike.image,
                                                    800
                                                )}
                                                alt={bike.name}
                                            />
                                        ) : (
                                            <div>
                                                No Image
                                            </div>
                                        )}

                                    </div>


                                    <div className="dashboard-bike-content">

                                        <p className="dashboard-bike-category">
                                            {bike.category}
                                        </p>

                                        <h3>
                                            {bike.name}
                                        </h3>

                                        <p className="dashboard-bike-model">
                                            {bike.brand}{" "}
                                            {bike.model}
                                        </p>


                                        <div className="dashboard-bike-bottom">

                                            <div>
                                                <strong>
                                                    ₹
                                                    {
                                                        bike.pricePerHour
                                                    }
                                                </strong>

                                                <span>
                                                    / hour
                                                </span>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/bikes/${bike._id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </div>

                                    </div>

                                </article>

                            ))}

                        </div>
                    )}


                {!loadingBikes &&
                    !bikeError &&
                    bikes.length === 0 && (
                        <div className="dashboard-empty">
                            <h3>
                                No bikes available
                            </h3>

                            <p>
                                Check back soon for
                                available rides.
                            </p>
                        </div>
                    )}

            </section>


            {/* =================================================
                AI FINDER
            ================================================= */}

            <section className="dashboard-ai-section">

                <div className="dashboard-ai-content">

                    <p className="dashboard-section-label">
                        JOYRIDE AI
                    </p>

                    <h2>
                        Not sure which bike
                        <br />
                        is right for you?
                    </h2>

                    <p>
                        Tell us where you're going,
                        your budget, and how you want
                        to ride. Our AI will find the
                        best available bikes for you.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/ai-recommendation"
                            )
                        }
                    >
                        Find My Perfect Bike →
                    </button>

                </div>

                <div className="dashboard-ai-visual">

                    <div className="dashboard-ai-card">

                        <span>
                            AI BIKE FINDER
                        </span>

                        <p>
                            "Comfortable bike for
                            a long trip under
                            ₹100/hour"
                        </p>

                        <strong>
                            3 bikes found
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                RENTAL ACTIVITY
            ================================================= */}

            <section className="dashboard-section dashboard-activity">

                <div className="dashboard-section-header">

                    <div>
                        <p className="dashboard-section-label">
                            YOUR JOYRIDE
                        </p>

                        <h2>
                            Rental Activity
                        </h2>

                        <p>
                            Keep track of your rides
                            and bookings.
                        </p>
                    </div>

                    <button
                        className="dashboard-section-link"
                        onClick={() =>
                            navigate("/bookings")
                        }
                    >
                        View All Bookings →
                    </button>

                </div>


                {loadingBookings && (
                    <div className="dashboard-message">
                        Loading your bookings...
                    </div>
                )}


                {!loadingBookings &&
                    bookingError && (
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
                                            {
                                                latestBooking.bike?.brand ||
                                                ""
                                            }{" "}
                                            {
                                                latestBooking.bike?.model ||
                                                ""
                                            }
                                        </p>

                                    </div>


                                    <div className="dashboard-booking-info">

                                        <span>
                                            Status
                                        </span>

                                        <strong
                                            className={`booking-status ${latestBooking.status}`}
                                        >
                                            {
                                                latestBooking.status
                                            }
                                        </strong>

                                    </div>


                                    <div className="dashboard-booking-info">

                                        <span>
                                            Pickup
                                        </span>

                                        <strong>
                                            {
                                                latestBooking.pickupLocation
                                            }
                                        </strong>

                                    </div>


                                    <div className="dashboard-booking-info">

                                        <span>
                                            Amount
                                        </span>

                                        <strong>
                                            ₹
                                            {
                                                latestBooking.totalAmount
                                            }
                                        </strong>

                                    </div>


                                    <button
                                        className="dashboard-view-bookings"
                                        onClick={() =>
                                            navigate(
                                                "/bookings"
                                            )
                                        }
                                    >
                                        View Booking
                                    </button>

                                </div>

                            )}


                            {!latestBooking && (

                                <div className="dashboard-empty">

                                    <p className="dashboard-section-label">
                                        READY TO RIDE?
                                    </p>

                                    <h3>
                                        Your next adventure
                                        starts with a bike.
                                    </h3>

                                    <p>
                                        Browse our fleet and
                                        book your first ride.
                                    </p>

                                    <button
                                        className="dashboard-primary-button"
                                        onClick={() =>
                                            navigate(
                                                "/bikes"
                                            )
                                        }
                                    >
                                        Find a Bike
                                    </button>

                                </div>

                            )}

                        </>
                    )}

            </section>


            {/* =================================================
                WHY JOYRIDE
            ================================================= */}

            <section className="dashboard-section dashboard-how">

                <div className="dashboard-section-header">

                    <div>
                        <p className="dashboard-section-label">
                            WHY JOYRIDE
                        </p>

                        <h2>
                            Everything you need
                            to ride freely.
                        </h2>
                    </div>

                </div>


                <div className="dashboard-steps">

                    <div className="dashboard-step">

                        <div className="dashboard-step-number">
                            01
                        </div>

                        <h3>
                            Choose Your Bike
                        </h3>

                        <p>
                            Explore a range of bikes
                            suited for every type of ride.
                        </p>

                    </div>


                    <div className="dashboard-step">

                        <div className="dashboard-step-number">
                            02
                        </div>

                        <h3>
                            Book in Minutes
                        </h3>

                        <p>
                            Pick your time, location,
                            and confirm your booking.
                        </p>

                    </div>


                    <div className="dashboard-step">

                        <div className="dashboard-step-number">
                            03
                        </div>

                        <h3>
                            Ride Your Way
                        </h3>

                        <p>
                            Pick up your bike and
                            enjoy the journey.
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;