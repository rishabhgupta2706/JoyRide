import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getOptimizedImageUrl } from "../utils/cloudinary";

function AdminBikes() {
    const navigate = useNavigate();

    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingBikeId, setEditingBikeId] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        model: "",
        category: "",
        registrationNumber: "",
        pricePerHour: "",
        location: "",
        description: "",
        image: "",
        status: "available"
    });

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setImageFile(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            setImageFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            setImageFile(null);
            return;
        }

        setError("");
        setImageFile(file);
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
            image: "",
            status: "available"
        });

        setImageFile(null);
        setEditingBikeId(null);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
        const token = localStorage.getItem("token");

        const data = new FormData();

        data.append("name", formData.name);
        data.append("brand", formData.brand);
        data.append("model", formData.model);
        data.append("category", formData.category);

        data.append(
            "registrationNumber",
            formData.registrationNumber
        );

        data.append(
            "pricePerHour",
            Number(formData.pricePerHour)
        );

        data.append("location", formData.location);
        data.append("description", formData.description);
        data.append("status", formData.status);

        // Only send an image when a new image is selected
        if (imageFile) {
            data.append("image", imageFile);
        }

        if (editingBikeId) {
            await api.put(
                `/bikes/${editingBikeId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Bike updated successfully.");
        } else {
            await api.post(
                "/bikes",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

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
            image: bike.image || "",
            status: bike.status || "available"
        });

        setImageFile(null);

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
            const token = localStorage.getItem("token");

            await api.delete(`/bikes/${bikeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

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
        return (
            <div className="admin-bikes-page">
                <div className="admin-bikes-message">
                    Loading bikes...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-bikes-page">

            {/* HEADER */}

            <section className="admin-bikes-header">
                <div>
                    <p className="admin-bikes-label">
                        JOYRIDE ADMIN
                    </p>

                    <h1>Manage Bikes</h1>

                    <p>
                        Add, update, and manage your rental fleet.
                    </p>
                </div>

                <button
                    className="admin-back-button"
                    onClick={() => navigate("/admin")}
                >
                    Back to Dashboard
                </button>
            </section>


            {/* ERROR */}

            {error && (
                <div className="admin-bikes-error">
                    {error}
                </div>
            )}


            {/* ADD / EDIT FORM */}

            <section className="admin-bike-form-section">

                <div className="admin-section-heading">
                    <div>
                        <p className="admin-bikes-label">
                            {editingBikeId
                                ? "UPDATE FLEET"
                                : "NEW FLEET ITEM"}
                        </p>

                        <h2>
                            {editingBikeId
                                ? "Edit Bike"
                                : "Add New Bike"}
                        </h2>
                    </div>
                </div>


                <form
                    className="admin-bike-form"
                    onSubmit={handleSubmit}
                >

                    <div className="admin-form-grid">

                        <div className="admin-form-group">
                            <label>Bike Name</label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Classic 350"
                                required
                            />
                        </div>


                        <div className="admin-form-group">
                            <label>Brand</label>

                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Royal Enfield"
                                required
                            />
                        </div>


                        <div className="admin-form-group">
                            <label>Model</label>

                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="2025"
                                required
                            />
                        </div>


                        <div className="admin-form-group">
                            <label>Category</label>

                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Cruiser"
                                required
                            />
                        </div>


                        <div className="admin-form-group">
                            <label>Registration Number</label>

                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder="DL01AB1234"
                                required
                            />
                        </div>


                        <div className="admin-form-group">
                            <label>Price Per Hour</label>

                            <input
                                type="number"
                                name="pricePerHour"
                                value={formData.pricePerHour}
                                onChange={handleChange}
                                placeholder="250"
                                min="0"
                                required
                            />
                        </div>


                        <div className="admin-form-group">
                            <label>Location</label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Delhi"
                                required
                            />
                        </div>


                        <div className="admin-form-group">
                            <label>Bike Status</label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="available">
                                    Available
                                </option>

                                <option value="maintenance">
                                    Maintenance
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>


                        {/* IMAGE UPLOAD */}

                        <div className="admin-form-group admin-form-full">
                            <label>Bike Image</label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            {imageFile && (
                                <p>
                                    Selected image:{" "}
                                    <strong>
                                        {imageFile.name}
                                    </strong>
                                </p>
                            )}

                            {editingBikeId &&
                                formData.image &&
                                !imageFile && (
                                    <p>
                                        Existing image will be kept.
                                    </p>
                                )}
                        </div>


                        <div className="admin-form-group admin-form-full">
                            <label>Description</label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter bike description..."
                                rows="4"
                            />
                        </div>

                    </div>


                    <div className="admin-form-actions">

                        <button
                            type="submit"
                            className="admin-primary-button"
                        >
                            {editingBikeId
                                ? "Update Bike"
                                : "Add Bike"}
                        </button>

                        {editingBikeId && (
                            <button
                                type="button"
                                className="admin-secondary-button"
                                onClick={resetForm}
                            >
                                Cancel Edit
                            </button>
                        )}

                    </div>

                </form>

            </section>


            {/* ALL BIKES */}

            <section className="admin-all-bikes-section">

                <div className="admin-section-heading">
                    <div>
                        <p className="admin-bikes-label">
                            FLEET OVERVIEW
                        </p>

                        <h2>All Bikes</h2>

                        <p>
                            {bikes.length} bike
                            {bikes.length !== 1 ? "s" : ""} in your fleet.
                        </p>
                    </div>
                </div>


                {bikes.length === 0 ? (

                    <div className="admin-empty-state">
                        <h3>No bikes found</h3>

                        <p>
                            Add your first bike using the form above.
                        </p>
                    </div>

                ) : (

                    <div className="admin-bike-grid">

                        {bikes.map((bike) => (

                            <div
                                className="admin-bike-card"
                                key={bike._id}
                            >

                                <div className="admin-bike-image">

                                    {bike.image ? (
                                        <img
                                            src={getOptimizedImageUrl(bike.image, 800)}
                                            alt={bike.name}
                                        />
                                    ) : (
                                        <span>
                                            No Image
                                        </span>
                                    )}

                                </div>


                                <div className="admin-bike-content">

                                    <div className="admin-bike-card-header">

                                        <div>
                                            <h3>
                                                {bike.name}
                                            </h3>

                                            <p>
                                                {bike.brand}
                                            </p>
                                        </div>

                                        <span
                                            className={`admin-bike-status ${bike.status}`}
                                        >
                                            {bike.status}
                                        </span>

                                    </div>


                                    <div className="admin-bike-details">

                                        <div>
                                            <span>MODEL</span>
                                            <strong>
                                                {bike.model}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>CATEGORY</span>
                                            <strong>
                                                {bike.category}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>LOCATION</span>
                                            <strong>
                                                {bike.location}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>PRICE</span>
                                            <strong>
                                                ₹{bike.pricePerHour}/hr
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="admin-bike-registration">
                                        Registration:
                                        <strong>
                                            {bike.registrationNumber}
                                        </strong>
                                    </div>


                                    {bike.description && (
                                        <p className="admin-bike-description">
                                            {bike.description}
                                        </p>
                                    )}


                                    <div className="admin-bike-actions">

                                        <button
                                            className="admin-edit-button"
                                            onClick={() =>
                                                handleEdit(bike)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="admin-delete-button"
                                            onClick={() =>
                                                handleDelete(bike._id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default AdminBikes;