import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { Sparkles, Building2, User, Shield, ArrowRight } from "lucide-react";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
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
      if (role === "user") endpoint = `/api/users/login`;
      else if (role === "company") endpoint = `/api/companies/login`;
      else endpoint = `/api/admin/login`;

      const normalizedEmail = formData.email?.toLowerCase();
      console.log("LOGIN ATTEMPT:", { email: normalizedEmail, role });
      const res = await api.post(endpoint, { ...formData, email: normalizedEmail });
      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.message?.toLowerCase().includes("otp")) {
        // Redirect to OTP verification
        navigate(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}&role=${role}`);
        return;
      }

      const token = res.data.token;
      const user = res.data.user || res.data.company || res.data.admin;
      const userData = { ...user, role: role };

      login(userData, token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
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
      setError(err.response?.data?.message || "Google Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Login was cancelled or failed.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-petal-light dark:bg-deep-moss px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-petal-rose/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-petal-leaf/5 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md z-10 border-none shadow-2xl bg-white dark:bg-petal-muted/20 p-8 rounded-[32px]">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group bg-petal-rose/10 p-4 rounded-2xl">
            <Sparkles className="w-8 h-8 text-petal-rose transition-transform group-hover:scale-110" />
          </Link>
          <h2 className="text-4xl font-display font-black text-petal-leaf dark:text-white tracking-tight">Bee Back</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Log into the hive</p>
        </div>

        {/* Role Toggles */}
        <div className="flex p-1.5 bg-gray-100 dark:bg-petal-muted/30 rounded-2xl mb-8">
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
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'admin' ? 'bg-white dark:bg-deep-moss text-petal-leaf dark:text-petal-rose shadow-md' : 'text-gray-500 hover:text-petal-leaf dark:hover:text-white'}`}
            onClick={() => setRole('admin')}
          >
            <Shield size={18} /> Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="rounded-xl border-gray-100 dark:border-petal-leaf/10"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="rounded-xl border-gray-100 dark:border-petal-leaf/10"
            />
          </div>

          <Button type="submit" className="w-full mt-6 bg-petal-leaf dark:bg-petal-rose text-white dark:text-deep-moss py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-petal-rose/10 border-none" disabled={loading}>
            {loading ? "Logging in..." : (
              <>
                Sign In <ArrowRight size={20} />
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
          New to the hive?{" "}
          <Link to="/signup" className="text-petal-leaf dark:text-petal-rose hover:underline font-bold transition-all">
            Join the Hive
          </Link>
        </p>
      </Card>
    </div>
  );
}

