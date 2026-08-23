import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link
                    to={user.role === "admin" ? "/admin" : "/dashboard"}
                >
                    JoyRide
                </Link>
            </div>

            <div className="navbar-links">
                <Link to="/bikes">
                    Bikes
                </Link>

                <Link to="/ai-recommendation">
                     AI Recommendations
                </Link>

                <Link to="/bookings">
                    My Bookings
                </Link>

                {user.role === "admin" && (
                    <>
                        <Link to="/admin/bikes">
                            Manage Bikes
                        </Link>

                        <Link to="/admin/bookings">
                            Manage Bookings
                        </Link>
                    </>
                )}

                <span className="navbar-user">
                    {user.name}
                </span>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;