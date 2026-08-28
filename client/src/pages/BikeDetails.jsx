import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function BikeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBike = async () => {
            try {
                const response = await api.get(`/bikes/${id}`);

                setBike(response.data.bike);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load bike details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBike();
    }, [id]);

    if (loading) {
        return <p>Loading bike details...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!bike) {
        return <p>Bike not found.</p>;
    }

    return (
        <div>
            <button onClick={() => navigate("/bikes")}>
                Back to Bikes
            </button>

            <h1>{bike.name}</h1>

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

            {bike.description && (
                <p>
                    Description: {bike.description}
                </p>
            )}

            {bike.image && (
                <img
                    src={getOptimizedImageUrl(bike.image, 1200)}
                    alt={bike.name}
                    width="300"
                />
            )}

            <br />

            {user?.role !== "admin" && (
                <button
                    onClick={() =>
                        navigate("/booking", {
                            state: { bike }
                        })
                    }
                >
                    Book This Bike
                </button>
            )}
        </div>
    );
}

export default BikeDetails;