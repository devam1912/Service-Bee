import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { Ghost, Building2, User } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [step, setStep] = useState(1); // For multi-step company form if needed, currently 1
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    city: "",
    // Company specific
    serviceCategory: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = role === "user"
        ? "http://localhost:9876/api/users/register"
        : "http://localhost:9876/api/companies/register";

      // Basic payload construction
      const payload = { ...formData };

      // Default values for required backend fields if missing in basic form
      if (role === 'company') {
        if (!payload.services) payload.services = [];
        if (!payload.workingDays) payload.workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      }

      await axios.post(endpoint, payload);

      // On success, redirect to login
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spooky-dark px-4 py-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-spooky-green/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-spooky-purple/10 rounded-full blur-[100px]" />

      <Card className="w-full max-w-2xl z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <Ghost className="w-10 h-10 text-spooky-green group-hover:text-spooky-purple transition-colors animate-float" />
          </Link>
          <h2 className="text-3xl font-spooky text-white tracking-wider">Join Service Bee</h2>
          <p className="text-gray-400 mt-2">Become part of the hive...</p>
        </div>

        {/* Role Toggles */}
        <div className="flex p-1 bg-gray-800/50 rounded-lg mb-6 max-w-md mx-auto">
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name / Company Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required />
            <Input label="City" name="city" value={formData.city} onChange={handleChange} required />

            {role === 'company' && (
              <>
                <Input label="Service Category" name="serviceCategory" placeholder="e.g. Plumbing, Cleaning" value={formData.serviceCategory} onChange={handleChange} required />
              </>
            )}
          </div>

          <Input label="Address" name="address" value={formData.address} onChange={handleChange} required className="w-full" />

          {role === 'company' && (
            <Input label="Description" name="description" placeholder="Describe your services..." value={formData.description} onChange={handleChange} className="w-full" />
          )}

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-spooky-purple hover:text-spooky-orange transition-colors underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}
