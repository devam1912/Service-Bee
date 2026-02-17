import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import GlobalChat from "./pages/GlobalChat";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/Home";
import UserDashboard from "./pages/dashboard/UserDashboard";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["user", "company", "admin"]} />}>
            <Route path="/global-chat" element={<GlobalChat />} />
          </Route>

          {/* User Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* Company Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
            <Route path="/dashboard/company" element={<CompanyDashboard />} />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

