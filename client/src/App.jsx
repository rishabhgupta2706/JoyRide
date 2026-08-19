import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bikes from "./pages/Bikes";
import BikeDetails from "./pages/BikeDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import AdminBikes from "./pages/AdminBikes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/bikes" element={<Bikes />} />

                <Route path="/bikes/:id" element={<BikeDetails />} />

                <Route path="/booking" element={<Booking />} />

                <Route path="/bookings" element={<MyBookings />} />

                <Route path="/admin/bookings" element={<AdminBookings />} />

                <Route path="/admin/bikes" element={<AdminBikes />} />

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;