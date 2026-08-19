import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminBikes() {
    const navigate = useNavigate();

    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingBikeId, setEditingBikeId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        model: "",
        category: "",
        registrationNumber: "",
        pricePerHour: "",
        location: "",
        description: "",
        image: ""
    });

    const fetchBikes = async () => {
        try {
            const response = await api.get("/bikes");

            setBikes(response.data.bikes);
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

    useEffect(() => {
        fetchBikes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            brand: "",
            model: "",
            category: "",
            registrationNumber: "",
            pricePerHour: "",
            location: "",
            description: "",
            image: ""
        });

        setEditingBikeId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {
            if (editingBikeId) {
                await api.put(
                    `/bikes/${editingBikeId}`,
                    formData
                );

                alert("Bike updated successfully.");
            } else {
                await api.post("/bikes", {
                    ...formData,
                    pricePerHour: Number(formData.pricePerHour)
                });

                alert("Bike added successfully.");
            }

            resetForm();
            await fetchBikes();
        } catch (error) {
            console.error("SAVE BIKE ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to save bike."
            );
        }
    };

    const handleEdit = (bike) => {
        setEditingBikeId(bike._id);

        setFormData({
            name: bike.name || "",
            brand: bike.brand || "",
            model: bike.model || "",
            category: bike.category || "",
            registrationNumber: bike.registrationNumber || "",
            pricePerHour: bike.pricePerHour || "",
            location: bike.location || "",
            description: bike.description || "",
            image: bike.image || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (bikeId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this bike?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/bikes/${bikeId}`);

            alert("Bike deleted successfully.");

            await fetchBikes();
        } catch (error) {
            console.error("DELETE BIKE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete bike."
            );
        }
    };

    if (loading) {
        return <h2>Loading bikes...</h2>;
    }

    return (
        <div>
            <h1>Admin Bike Management</h1>

            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>

            <hr />

            <h2>
                {editingBikeId ? "Edit Bike" : "Add New Bike"}
            </h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Bike Name</label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Brand</label>

                    <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Model</label>

                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Category</label>

                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Registration Number</label>

                    <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Price Per Hour</label>

                    <input
                        type="number"
                        name="pricePerHour"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div>
                    <label>Location</label>

                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Description</label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Image URL</label>

                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                    />
                </div>

                {error && <p>{error}</p>}

                <button type="submit">
                    {editingBikeId
                        ? "Update Bike"
                        : "Add Bike"}
                </button>

                {editingBikeId && (
                    <button
                        type="button"
                        onClick={resetForm}
                    >
                        Cancel Edit
                    </button>
                )}
            </form>

            <hr />

            <h2>All Bikes</h2>

            {bikes.length === 0 ? (
                <p>No bikes found.</p>
            ) : (
                bikes.map((bike) => (
                    <div key={bike._id}>
                        <hr />

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
                            Registration Number:{" "}
                            {bike.registrationNumber}
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
                                Description:{" "}
                                {bike.description}
                            </p>
                        )}

                        <button
                            onClick={() => handleEdit(bike)}
                        >
                            Edit
                        </button>

                        <button
                            onClick={() =>
                                handleDelete(bike._id)
                            }
                        >
                            Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default AdminBikes;