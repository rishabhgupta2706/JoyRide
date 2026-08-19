import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div>
            <h1>JoyRide Dashboard</h1>

            <p>
                Welcome, {user?.name || "User"}
            </p>

            <div>
                <button onClick={() => navigate("/bikes")}>
                    Browse Bikes
                </button>

                <button onClick={() => navigate("/bookings")}>
                    My Bookings
                </button>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;