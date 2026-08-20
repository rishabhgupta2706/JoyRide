import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Bikes() {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                const token = localStorage.getItem("token");

const response = await api.get("/bikes", {
    headers: {
        Authorization: `Bearer ${token}`
    }
});
                setBikes(response.data.bikes);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load bikes."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBikes();
    }, []);

    if (loading) {
        return <p>Loading bikes...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>Available Bikes</h1>

            {bikes.length === 0 ? (
                <p>No bikes available.</p>
            ) : (
                <div>
                    {bikes.map((bike) => (
                        <div key={bike._id}>
                            <h2>{bike.name}</h2>

                            <p>
                                Brand: {bike.brand}
                            </p>

                            <p>
                                Model: {bike.model}
                            </p>

                            <p>
                                Category: {bike.category}
                            </p>

                            <p>
                                Price: ₹{bike.pricePerHour}/hour
                            </p>

                            <p>
                                Location: {bike.location}
                            </p>

                            <p>
                                Status: {bike.status}
                            </p>

                            <button
                                onClick={() => navigate(`/bikes/${bike._id}`)}
                            >
                                View Details
                            </button>

                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Bikes;