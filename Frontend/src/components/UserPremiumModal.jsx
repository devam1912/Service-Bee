import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function UserPremiumModal({ isOpen, onClose }) {
    const { user } = useAuth();

    const handleUserSubscribe = async (plan) => {
        try {
            const res = await api.post("/api/payments/user/premium/create-order", { plan });

            const options = {
                key: res.data.keyId,
                amount: res.data.amount,
                currency: res.data.currency,
                name: "Service-Bee Premium",
                description: `Priority ${plan} Access`,
                order_id: res.data.orderId,
                handler: async (response) => {
                    try {
                        await api.post("/api/payments/user/premium/verify", {
                            orderId: res.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        alert("Premium Upgrade Successful! You now have Priority Access.");
                        onClose();
                        const updatedUser = { ...user, isPremium: true };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        window.location.reload();
                    } catch (err) {
                        alert("Upgrade failed. Please contact support.");
                    }
                },
                theme: { color: "#F59E0B" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to initiate upgrade.";
            alert(`Upgrade Initiation Failed: ${errorMsg}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl pointer-events-auto"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-[#08090a] rounded-[32px] md:rounded-[48px] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

                        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar relative">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full z-50"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-10">
                                <span className="px-4 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-amber-500/20 inline-flex items-center gap-2 mb-4">
                                    <Zap size={10} className="fill-amber-500" /> Premium
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                                    Priority <span className="text-amber-500 italic">Access</span>
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto font-medium text-sm leading-relaxed">
                                    Skip the waiting periods. Instant service bookings enabled.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <PlanCard
                                    title="Monthly"
                                    price="500"
                                    period="mo"
                                    features={["Same-Day Booking", "24h Payment Window"]}
                                    onClick={() => handleUserSubscribe('monthly')}
                                />
                                <PlanCard
                                    title="Seasonal"
                                    price="2500"
                                    period="6 mo"
                                    features={["Priority Support", "24h Payment Window", "Protection from Rejections"]}
                                    onClick={() => handleUserSubscribe('semi-annual')}
                                    popular
                                />
                                <PlanCard
                                    title="Annual"
                                    price="4000"
                                    period="year"
                                    features={["Elite VIP Status", "Max Rejection Support"]}
                                    onClick={() => handleUserSubscribe('yearly')}
                                />
                            </div>

                            <p className="text-center mt-8 text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Secure Encryption by Razorpay</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

const PlanCard = ({ title, price, period, features, onClick, popular }) => (
    <div className={cn("p-6 rounded-[24px] border-2 transition-all duration-300 flex flex-col group relative overflow-hidden",
        popular
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-gray-900 border-amber-300 shadow-lg"
            : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-900 dark:text-white")}>

        <h3 className="text-lg font-black mb-1 tracking-tight uppercase">{title}</h3>
        <p className="text-[9px] font-bold mb-6 opacity-60 uppercase tracking-widest">{period}</p>

        <div className="flex items-baseline gap-1 mb-6">
            <span className="text-3xl font-black tracking-tighter">₹{price}</span>
        </div>

        <div className="space-y-3 mb-8 flex-grow">
            {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] font-bold">
                    <CheckCircle size={12} className={popular ? "text-gray-900" : "text-amber-500"} />
                    <span className="opacity-80 leading-tight">{f}</span>
                </div>
            ))}
        </div>

        <button
            onClick={onClick}
            className={cn("w-full py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all transform active:scale-95 shadow-md",
                popular
                    ? "bg-gray-900 text-white"
                    : "bg-white dark:bg-amber-500 text-gray-900")}
        >
            Upgrade Now
        </button>
    </div>
);
