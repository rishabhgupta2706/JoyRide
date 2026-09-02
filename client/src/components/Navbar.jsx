import { NavLink, Link, useNavigate } from "react-router-dom";
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
                    <img
                        src="/logo.png"
                        alt="JoyRide"
                    />
                </Link>

                <div className="navbar-links">

                    {!isAdmin && (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                Home
                            </NavLink>

                            <NavLink
                                to="/bikes"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                Bikes
                            </NavLink>

                            <NavLink
                                to="/ai-recommendation"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                AI Recommendations
                            </NavLink>

                            <NavLink
                                to="/bookings"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                My Bookings
                            </NavLink>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/admin"
                                end
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                Dashboard
                            </NavLink>

                            <NavLink
                                to="/admin/bikes"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                Manage Bikes
                            </NavLink>

                            <NavLink
                                to="/admin/bookings"
                                className={({ isActive }) =>
                                    isActive ? "active" : ""
                                }
                            >
                                Manage Bookings
                            </NavLink>
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