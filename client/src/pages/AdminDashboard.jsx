import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h1>JoyRide Admin Dashboard</h1>

            <h2>
                Welcome, {user?.name || "Admin"}
            </h2>
        </div>
    );
}

export default AdminDashboard;