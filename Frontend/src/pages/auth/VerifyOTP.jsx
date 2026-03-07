import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import api from "../../utils/api";
import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";

export default function VerifyOTP() {
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get("email");
    const role = searchParams.get("role") || "user";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!email) {
            navigate("/signup");
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const endpoint = role === "user"
                ? `/api/users/verify-otp`
                : `/api/companies/verify-otp`;

            const res = await api.post(endpoint, { email, otp });

            setMessage("Verification successful! Welcoming to the hive...");
            const token = res.data.token;
            const userData = res.data.user || res.data.company;

            setTimeout(() => {
                login({ ...userData, role }, token);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed. Please check your OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError("");
        setMessage("");
        try {
            const endpoint = role === "user"
                ? `/api/users/resend-otp`
                : `/api/companies/resend-otp`;

            await api.post(endpoint, { email });
            setMessage("A new OTP has been sent to your email.");
        } catch (err) {
            // If they just signed up, they can try logging in to get a new OTP
            setError("Could not resend OTP. If the problem persists, please try logging in.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bee-light dark:bg-bee-dark px-4 py-20 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-bee-yellow/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />

            <Card className="w-full max-w-md z-10 border-none shadow-2xl bg-white dark:bg-bee-muted p-10 rounded-[40px]">
                <div className="text-center mb-10">
                    <div className="mx-auto w-20 h-20 bg-bee-yellow/10 rounded-[28px] flex items-center justify-center mb-8 border border-bee-yellow/20">
                        <ShieldCheck className="text-bee-yellow w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-display font-black text-bee-accent dark:text-white mb-2 tracking-tight">Verify Identity</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm px-4">
                        We've sent a 6-digit code to <br /><span className="text-bee-accent dark:text-white font-bold">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-2xl text-xs font-bold text-center"
                        >
                            {message}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Verification Code"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="text-center"
                            inputClassName="text-center text-2xl tracking-[0.5em] font-display font-bold"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-bee-accent dark:bg-bee-yellow text-white dark:text-bee-accent py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-bee-yellow/10 text-lg group"
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? "Verifying..." : (
                            <>
                                Verify Now <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-10 text-center space-y-4">
                    <p className="text-sm text-gray-500 font-medium">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="inline-flex items-center gap-2 text-bee-accent dark:text-bee-yellow font-bold hover:underline transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={resendLoading ? "animate-spin" : ""} />
                        {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>

                    <div className="pt-4">
                        <Link to="/signup" className="text-gray-400 hover:text-bee-accent dark:hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                            Back to Signup
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}
