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

    // Revenue from completed bookings only
    const totalRevenue = bookings
        .filter(
            (booking) =>
                booking.status === "completed"
        )
        .reduce(
            (total, booking) =>
                total + Number(booking.totalAmount || 0),
            0
        );

    if (loading) {
        return (
            <div>
                <h1>JoyRide Admin Dashboard</h1>

                <p>
                    Loading dashboard...
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>JoyRide Admin Dashboard</h1>

            <h2>
                Welcome, {user?.name || "Admin"}
            </h2>

            {error && (
                <p>{error}</p>
            )}

            <hr />

            <h2>Bike Statistics</h2>

            <div>
                <div>
                    <h3>Total Bikes</h3>
                    <p>{totalBikes}</p>
                </div>

                <div>
                    <h3>Available Bikes</h3>
                    <p>{availableBikes}</p>
                </div>

                <div>
                    <h3>Maintenance</h3>
                    <p>{maintenanceBikes}</p>
                </div>

                <div>
                    <h3>Inactive</h3>
                    <p>{inactiveBikes}</p>
                </div>
            </div>

            <hr />

            <h2>Booking Statistics</h2>

            <div>
                <div>
                    <h3>Total Bookings</h3>
                    <p>{totalBookings}</p>
                </div>

                <div>
                    <h3>Pending</h3>
                    <p>{pendingBookings}</p>
                </div>

                <div>
                    <h3>Confirmed</h3>
                    <p>{confirmedBookings}</p>
                </div>

                <div>
                    <h3>Completed</h3>
                    <p>{completedBookings}</p>
                </div>

                <div>
                    <h3>Cancelled</h3>
                    <p>{cancelledBookings}</p>
                </div>
            </div>

            <hr />

            <h2>Revenue</h2>

            <div>
                <h3>Total Revenue</h3>

                <p>
                    ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
            </div>
        </div>
    );
}

export default AdminDashboard;