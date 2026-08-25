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

    const isAdmin = user.role === "admin";

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <Link
                    className="navbar-brand"
                    to={isAdmin ? "/admin" : "/dashboard"}
                >
                    JoyRide
                </Link>

                <div className="navbar-links">

                    {!isAdmin && (
                        <>
                            <Link to="/dashboard">
                                Home
                            </Link>

                            <Link to="/bikes">
                                Bikes
                            </Link>

                            <Link to="/ai-recommendation">
                                AI Recommendations
                            </Link>

                            <Link to="/bookings">
                                My Bookings
                            </Link>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <Link to="/admin">
                                Dashboard
                            </Link>

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

                    <button
                        className="navbar-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>
            </div>
        </nav>
    );
}

export default Navbar;