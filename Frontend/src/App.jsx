import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyOTP from "./pages/auth/VerifyOTP";
import Home from "./pages/Home";
import UserDashboard from "./pages/dashboard/UserDashboard";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["user", "company", "admin"]} />}>
        </Route>

        {/* Dashboard Routes (Redirecting to dynamic Home Hub) */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/dashboard" element={<Navigate to="/" />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
          <Route path="/dashboard/company" element={<Navigate to="/" />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard/admin" element={<Navigate to="/" />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

