import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminDashboard() {
    const { user } = useAuth();

    const [bikes, setBikes] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const [bikesResponse, bookingsResponse] =
                    await Promise.all([
                        api.get("/bikes", config),
                        api.get("/bookings", config)
                    ]);

                setBikes(
                    bikesResponse.data.bikes || []
                );

                setBookings(
                    bookingsResponse.data.bookings || []
                );
            } catch (error) {
                console.error(
                    "ADMIN DASHBOARD ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Bike statistics

    const totalBikes = bikes.length;

    const availableBikes = bikes.filter(
        (bike) => bike.status === "available"
    ).length;

    const maintenanceBikes = bikes.filter(
        (bike) => bike.status === "maintenance"
    ).length;

    const inactiveBikes = bikes.filter(
        (bike) => bike.status === "inactive"
    ).length;

    // Booking statistics

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        (booking) => booking.status === "pending"
    ).length;

    const confirmedBookings = bookings.filter(
        (booking) => booking.status === "confirmed"
    ).length;

    const completedBookings = bookings.filter(
        (booking) => booking.status === "completed"
    ).length;

    const cancelledBookings = bookings.filter(
        (booking) => booking.status === "cancelled"
    ).length;

    // Revenue

    const totalRevenue = bookings
        .filter(
            (booking) =>
                booking.status === "completed"
        )
        .reduce(
            (total, booking) =>
                total + Number(
                    booking.totalAmount || 0
                ),
            0
        );

    // Latest bookings

    const recentBookings = bookings.slice(0, 5);

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    if (loading) {
        return (
            <div className="admin-dashboard-page">
                <div className="admin-dashboard-loading">
                    <h2>Loading admin dashboard...</h2>
                    <p>
                        Please wait while we load your
                        dashboard data.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">

            {/* Header */}

            <section className="admin-dashboard-header">

                <div>
                    <p className="admin-dashboard-label">
                        JOYRIDE ADMIN
                    </p>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user?.name || "Admin"}
                        </strong>
                    </p>
                </div>

            </section>


            {/* Error */}

            {error && (
                <div className="admin-dashboard-error">
                    {error}
                </div>
            )}


            {/* Main Statistics */}

            <section className="admin-dashboard-section">

                <div className="admin-dashboard-section-header">
                    <h2>
                        Overview
                    </h2>

                    <p>
                        Current JoyRide platform statistics.
                    </p>
                </div>


                <div className="admin-main-stats">

                    <div className="admin-stat-card">
                        <span>
                            Total Bikes
                        </span>

                        <strong>
                            {totalBikes}
                        </strong>
                    </div>


                    <div className="admin-stat-card">
                        <span>
                            Available Bikes
                        </span>

                        <strong>
                            {availableBikes}
                        </strong>
                    </div>


                    <div className="admin-stat-card">
                        <span>
                            Total Bookings
                        </span>

                        <strong>
                            {totalBookings}
                        </strong>
                    </div>


                    <div className="admin-stat-card">
                        <span>
                            Revenue
                        </span>

                        <strong>
                            ₹
                            {totalRevenue.toLocaleString(
                                "en-IN"
                            )}
                        </strong>
                    </div>

                </div>

            </section>


            {/* Bike Statistics */}

            <section className="admin-dashboard-section">

                <div className="admin-dashboard-section-header">
                    <h2>
                        Bike Statistics
                    </h2>

                    <p>
                        Current status of your rental fleet.
                    </p>
                </div>


                <div className="admin-status-grid">

                    <div className="admin-status-card">
                        <span>
                            Available
                        </span>

                        <strong>
                            {availableBikes}
                        </strong>
                    </div>


                    <div className="admin-status-card">
                        <span>
                            Maintenance
                        </span>

                        <strong>
                            {maintenanceBikes}
                        </strong>
                    </div>


                    <div className="admin-status-card">
                        <span>
                            Inactive
                        </span>

                        <strong>
                            {inactiveBikes}
                        </strong>
                    </div>

                </div>

            </section>


            {/* Booking Statistics */}

            <section className="admin-dashboard-section">

                <div className="admin-dashboard-section-header">
                    <h2>
                        Booking Statistics
                    </h2>

                    <p>
                        Overview of customer bookings.
                    </p>
                </div>


                <div className="admin-status-grid">

                    <div className="admin-status-card">
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingBookings}
                        </strong>
                    </div>


                    <div className="admin-status-card">
                        <span>
                            Confirmed
                        </span>

                        <strong>
                            {confirmedBookings}
                        </strong>
                    </div>


                    <div className="admin-status-card">
                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedBookings}
                        </strong>
                    </div>


                    <div className="admin-status-card">
                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {cancelledBookings}
                        </strong>
                    </div>

                </div>

            </section>


            {/* Recent Bookings */}

            <section className="admin-dashboard-section">

                <div className="admin-dashboard-section-header">
                    <h2>
                        Recent Bookings
                    </h2>

                    <p>
                        Latest activity on JoyRide.
                    </p>
                </div>


                {recentBookings.length === 0 ? (

                    <div className="admin-empty">
                        <h3>
                            No bookings yet
                        </h3>

                        <p>
                            Customer bookings will appear
                            here once they are created.
                        </p>
                    </div>

                ) : (

                    <div className="admin-bookings-list">

                        {recentBookings.map((booking) => (

                            <div
                                className="admin-booking-card"
                                key={booking._id}
                            >

                                <div>
                                    <span className="admin-booking-label">
                                        CUSTOMER
                                    </span>

                                    <strong>
                                        {booking.user?.name ||
                                            "Unknown User"}
                                    </strong>
                                </div>


                                <div>
                                    <span className="admin-booking-label">
                                        BIKE
                                    </span>

                                    <strong>
                                        {booking.bike?.name ||
                                            "Unknown Bike"}
                                    </strong>
                                </div>


                                <div>
                                    <span className="admin-booking-label">
                                        DATE
                                    </span>

                                    <strong>
                                        {formatDate(
                                            booking.startDate
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span className="admin-booking-label">
                                        AMOUNT
                                    </span>

                                    <strong>
                                        ₹
                                        {Number(
                                            booking.totalAmount || 0
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span className="admin-booking-label">
                                        STATUS
                                    </span>

                                    <strong
                                        className={`admin-booking-status ${booking.status}`}
                                    >
                                        {booking.status}
                                    </strong>
                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default AdminDashboard;