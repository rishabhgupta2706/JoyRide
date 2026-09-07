import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            if (!name.trim() || !email.trim() || !phone.trim() || !password) {
                setError("All fields are required.");
                setLoading(false);
                return;
            }

            await api.post("/users/register", {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password
            });

            navigate("/login");

        } catch (error) {
            console.error("REGISTER ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <p className="auth-brand">
                    JOYRIDE
                </p>

                <h1>
                    Create Account
                </h1>

                <p className="auth-subtitle">
                    Create your account and start your ride.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="auth-form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Phone Number</label>

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                </p>

            </div>
        </div>
    );
}

export default Register;