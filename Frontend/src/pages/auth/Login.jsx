import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { Ghost, Building2, User, Shield } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const [role, setRole] = useState("user"); // 'user' or 'company'
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let endpoint = "";
      if (role === "user") endpoint = "http://localhost:9876/api/users/login";
      else if (role === "company") endpoint = "http://localhost:9876/api/companies/login";
      else endpoint = "http://localhost:9876/api/admin/login";

      const res = await axios.post(endpoint, formData);

      // Token structure might differ, checking response
      const token = res.data.token;
      const user = res.data.user || res.data.company || res.data.admin; // Adjust based on actual API response
      // Add role to user object for context
      const userData = { ...user, role: role };

      login(userData, token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spooky-dark px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-spooky-purple/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-spooky-orange/20 rounded-full blur-[100px]" />

      <Card className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <Ghost className="w-10 h-10 text-spooky-orange group-hover:text-spooky-purple transition-colors animate-float" />
          </Link>
          <h2 className="text-3xl font-spooky text-white tracking-wider">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Enter the hive...</p>
        </div>

        {/* Role Toggles */}
        <div className="flex p-1 bg-gray-800/50 rounded-lg mb-6">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${role === 'user' ? 'bg-spooky-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setRole('user')}
          >
            <User size={18} /> User
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${role === 'company' ? 'bg-spooky-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setRole('company')}
          >
            <Building2 size={18} /> Company
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${role === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setRole('admin')}
          >
            <Shield size={18} /> Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-spooky-purple hover:text-spooky-orange transition-colors underline">
            Join the Swarm
          </Link>
        </p>
      </Card>
    </div>
  );
}
