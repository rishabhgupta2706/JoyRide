import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function Bikes() {
    const [bikes, setBikes] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

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

                setBikes(response.data.bikes || []);
            } catch (error) {
                console.error("GET BIKES ERROR:", error);

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

    const categories = [
        "all",
        ...new Set(
            bikes
                .map((bike) => bike.category)
                .filter(Boolean)
        )
    ];

    const filteredBikes = bikes.filter((bike) => {
        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            bike.name?.toLowerCase().includes(searchText) ||
            bike.brand?.toLowerCase().includes(searchText) ||
            bike.model?.toLowerCase().includes(searchText) ||
            bike.location?.toLowerCase().includes(searchText);

        const matchesCategory =
            category === "all" ||
            bike.category === category;

        return matchesSearch && matchesCategory;
    });

    const handleViewDetails = (bike) => {
        navigate(`/bikes/${bike._id}`);
    };

    if (loading) {
        return (
            <div className="bikes-page">
                <p className="bikes-message">
                    Loading bikes...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bikes-page">
                <p className="bikes-message">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="bikes-page">

            {/* HERO */}

            <section className="bikes-hero">

                <h1>Explore Bikes</h1>

                <p>
                    Find the right bike for your next ride.
                </p>

                {/* FILTERS */}

                <div className="bike-filters">

                    <input
                        type="text"
                        placeholder="Search by bike, brand, model or location..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >
                        {categories.map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item === "all"
                                    ? "All Categories"
                                    : item}
                            </option>
                        ))}
                    </select>

                </div>

            </section>


            {/* NO RESULTS */}

            {filteredBikes.length === 0 ? (

                <div className="bikes-message">

                    <h2>No bikes found</h2>

                    <p>
                        Try changing your search or category.
                    </p>

                </div>

            ) : (

                /* BIKE GRID */

                <section className="bike-grid">

                    {filteredBikes.map((bike) => {

                        const isAvailable =
                            bike.status === "available";

                        return (
                            <div
                                className="bike-card"
                                key={bike._id}
                            >

                                {/* IMAGE */}

                                <div className="bike-image">

                                    {bike.image ? (
                                        <img
                                            src={getOptimizedImageUrl(
                                                bike.image,
                                                800
                                            )}
                                            alt={bike.name}
                                        />
                                    ) : (
                                        <div className="bike-image-placeholder">
                                            No Image
                                        </div>
                                    )}

                                </div>


                                {/* CONTENT */}

                                <div className="bike-card-content">

                                    {/* HEADER */}

                                    <div className="bike-card-header">

                                        <h2>
                                            {bike.name}
                                        </h2>

                                        <span
                                            className={
                                                isAvailable
                                                    ? "bike-status available"
                                                    : "bike-status"
                                            }
                                        >
                                            {bike.status}
                                        </span>

                                    </div>


                                    {/* BRAND / MODEL */}

                                    <p className="bike-brand">
                                        {bike.brand}{" "}
                                        {bike.model}
                                    </p>


                                    {/* INFORMATION */}

                                    <div className="bike-info">

                                        <p>
                                            Category:{" "}
                                            {bike.category}
                                        </p>

                                        <p>
                                            Location:{" "}
                                            {bike.location}
                                        </p>

                                    </div>


                                    {/* FOOTER */}

                                    <div className="bike-card-footer">

                                        <div className="bike-price">

                                            <strong>
                                                ₹
                                                {
                                                    bike.pricePerHour
                                                }
                                            </strong>

                                            <span>
                                                /hour
                                            </span>

                                        </div>


                                        <button
                                            onClick={() =>
                                                handleViewDetails(
                                                    bike
                                                )
                                            }
                                        >
                                            View Details
                                        </button>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </section>
            )}

        </div>
    );
}

export default Bikes;