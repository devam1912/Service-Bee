import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { Sparkles, Building2, User, ArrowRight } from "lucide-react";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    city: "",
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
        ? `/api/users/register`
        : `/api/companies/register`;

      const payload = { ...formData, email: formData.email?.toLowerCase() };

      if (role === 'company') {
        if (!payload.services) payload.services = [];
        if (!payload.workingDays) payload.workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      }

      await api.post(endpoint, payload);
      navigate(`/verify-otp?email=${encodeURIComponent(payload.email)}&role=${role}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/users/google-auth", {
        token: credentialResponse.credential
      });

      const token = res.data.token;
      const user = res.data.user;

      login(user, token);
    } catch (err) {
      setError(err.response?.data?.message || "Google Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Signup was cancelled or failed.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-petal-light dark:bg-deep-moss px-4 py-20 relative overflow-hidden">
      {/* Decorative floral elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-petal-rose/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-petal-leaf/5 rounded-full blur-[120px]" />

      <Card className="w-full max-w-2xl z-10 border-none shadow-2xl bg-white dark:bg-petal-muted/20 p-10 rounded-[40px]">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group bg-petal-rose/10 p-4 rounded-2xl">
            <Sparkles className="w-8 h-8 text-petal-rose transition-transform group-hover:scale-110" />
          </Link>
          <h2 className="text-4xl font-display font-black text-petal-leaf dark:text-white tracking-tight">Join the Hive</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Start your buzzing journey today</p>
        </div>

        {/* Role Toggles */}
        <div className="flex p-1.5 bg-gray-100 dark:bg-petal-muted/30 rounded-2xl mb-10 max-w-md mx-auto">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'user' ? 'bg-white dark:bg-deep-moss text-petal-leaf dark:text-petal-rose shadow-md' : 'text-gray-500 hover:text-petal-leaf dark:hover:text-white'}`}
            onClick={() => setRole('user')}
          >
            <User size={18} /> User
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'company' ? 'bg-white dark:bg-deep-moss text-petal-leaf dark:text-petal-rose shadow-md' : 'text-gray-500 hover:text-petal-leaf dark:hover:text-white'}`}
            onClick={() => setRole('company')}
          >
            <Building2 size={18} /> Company
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name / Company Name" name="name" value={formData.name} onChange={handleChange} required className="rounded-xl border-gray-100 dark:border-petal-leaf/10" />
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required className="rounded-xl border-gray-100 dark:border-petal-leaf/10" />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required className="rounded-xl border-gray-100 dark:border-petal-leaf/10" />
            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required className="rounded-xl border-gray-100 dark:border-petal-leaf/10" />
            <Input label="City" name="city" value={formData.city} onChange={handleChange} required className="rounded-xl border-gray-100 dark:border-petal-leaf/10" />

            {role === 'company' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider ml-1 px-1">Service Category</label>
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-petal-muted/30 border border-gray-100 dark:border-petal-leaf/10 text-petal-leaf dark:text-white focus:outline-none focus:border-petal-rose focus:ring-1 focus:ring-petal-rose transition-all placeholder-gray-400 text-sm h-[52px]"
                >
                  <option value="">-- Select Category --</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Painting">Painting</option>
                  <option value="Pest Control">Pest Control</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Beauty & Spa">Beauty & Spa</option>
                  <option value="Gardening">Gardening</option>
                  <option value="Home Security">Home Security</option>
                  <option value="Packing & Moving">Packing & Moving</option>
                  <option value="AC Service">AC Service</option>
                </select>
              </div>
            )}
          </div>

          <Input label="Full Address" name="address" value={formData.address} onChange={handleChange} required className="w-full rounded-xl border-gray-100 dark:border-petal-leaf/10" />

          {role === 'company' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider ml-1 px-1">Service Specialization & Field</label>
              <textarea
                name="description"
                className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-petal-muted/30 border border-gray-100 dark:border-petal-leaf/10 text-petal-leaf dark:text-white focus:outline-none focus:border-petal-rose focus:ring-1 focus:ring-petal-rose transition-all placeholder-gray-400 text-sm min-h-[100px]"
                placeholder="Describe your specific field of expertise and the types of services you provide..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          )}

          <Button type="submit" className="w-full mt-8 bg-petal-leaf dark:bg-petal-rose text-white dark:text-deep-moss py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-petal-rose/10 border-none" disabled={loading}>
            {loading ? "Registering..." : (
              <>
                Register Now <ArrowRight size={20} />
              </>
            )}
          </Button>
        </form>

        {role === "user" && (
          <div className="mt-6 flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-gray-200 dark:bg-petal-leaf/10" />
              <span className="text-xs font-bold text-gray-400">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-petal-leaf/10" />
            </div>

            <div className="w-full flex justify-center mt-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10 font-medium">
          Already part of the hive?{" "}
          <Link to="/login" className="text-petal-leaf dark:text-petal-rose hover:underline font-bold transition-all">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}

