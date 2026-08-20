import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div>
            <h1>JoyRide Admin Dashboard</h1>

            <h2>Welcome, {user?.name || "Admin"}</h2>

            <div>
                <button onClick={() => navigate("/admin/bikes")}>
                    Manage Bikes
                </button>

                <button onClick={() => navigate("/admin/bookings")}>
                    Manage Bookings
                </button>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;