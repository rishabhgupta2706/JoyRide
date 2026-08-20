import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h1>JoyRide Dashboard</h1>

            <p>
                Welcome, {user?.name || "User"}
            </p>
        </div>
    );
}

export default Dashboard;