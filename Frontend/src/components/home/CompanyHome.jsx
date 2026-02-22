import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Clock, PlayCircle, CheckCircle, Package, User, Calendar, Users, Activity, Briefcase, Plus, Bell, ChevronRight, Star, ShieldCheck, Zap, Globe, Sparkles, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CompanyHome() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        accepted: 0,
        completed: 0,
        rejected: 0,
        revenue: 0,
        reach: 0,
        success: 0
    });
    const [error, setError] = useState(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hive access token found. Please re-login.");

            const [reqRes, profRes] = await Promise.all([
                axios.get("http://localhost:9876/api/requests/company", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:9876/api/companies/profile", { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const reqData = reqRes.data.requests || [];
            const companyProfile = profRes.data.company;

            setRequests(reqData);
            setProfile(companyProfile);

            const newStats = {
                pending: 0,
                accepted: 0,
                completed: 0,
                rejected: 0,
                revenue: 0,
                reach: 0,
                success: 0
            };

            const uniqueUsers = new Set();
            reqData.forEach(req => {
                uniqueUsers.add(req.user?._id);
                if (req.status === 'pending') newStats.pending++;
                else if (req.status === 'accepted') newStats.accepted++;
                else if (req.status === 'completed') {
                    newStats.completed++;
                    newStats.revenue += (req.amount || 0);
                }
                else if (req.status === 'rejected') newStats.rejected++;
            });

            newStats.reach = uniqueUsers.size;
            const totalFinished = newStats.completed + newStats.rejected;
            newStats.success = totalFinished > 0 ? ((newStats.completed / totalFinished) * 100).toFixed(1) : 100;

            setStats(newStats);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to establish connection to the hive.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (plan) => {
        if (!profile?.isVerified) {
            alert("Ritual Interrupted: Your hive must be verified by the Guardian (Admin) before you can ascend to Premium status.");
            return;
        }

        const confirmUpgrade = window.confirm(
            "⚠️ Refund Notice: Once the ritual is initiated and payment is processed, refunds are not possible if you decide to change or cancel the plan later. Do you wish to proceed with the ascension?"
        );

        if (!confirmUpgrade) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:9876/api/payments/premium/create-order", { plan }, { headers: { Authorization: `Bearer ${token}` } });
            // ... options ...
            const options = {
                key: res.data.keyId,
                amount: res.data.amount,
                currency: res.data.currency,
                name: "Service-Bee Premium",
                description: `Upgrade to ${plan} priority status`,
                order_id: res.data.orderId,
                handler: async (response) => {
                    try {
                        await axios.post("http://localhost:9876/api/payments/premium/verify", {
                            orderId: res.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        alert("Upgrade Ceremony Successful! You are now a Premium Bee.");
                        setShowPremiumModal(false);
                        fetchAllData();
                    } catch (err) {
                        alert("Verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: profile?.name,
                    email: profile?.email
                },
                theme: {
                    color: "#FF8E9C"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("[PREMIUM ERROR]", err);
            const msg = err.response?.data?.message || err.message || "Failed to initiate premium ritual.";
            alert(`Ritual Interrupted: ${msg}`);
        }
    };

    const toggleActiveStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch("http://localhost:9876/api/companies/toggle-active", {}, { headers: { Authorization: `Bearer ${token}` } });
            setProfile(prev => ({ ...prev, isActive: res.data.isActive }));
            alert(res.data.message);
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const updateStatus = async (requestId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:9876/api/requests/${requestId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update ritual status.");
        }
    };

    if (loading) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-8">
                <div className="relative">
                    <motion.div
                        className="w-24 h-24 border-4 border-petal-rose/10 border-t-petal-rose rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="text-petal-rose" size={40} />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-900 dark:text-white font-black uppercase tracking-[0.4em] text-sm mb-2">Syncing Hive</p>
                    <p className="text-petal-rose font-bold text-xs animate-pulse italic">Connecting to provider network...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-16 animate-fade-in py-12">
            {/* Premium Header */}
            <header className="relative overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-3xl p-12 rounded-[50px] border border-white/20 dark:border-white/5 shadow-2xl">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                                profile?.isPremium ? "bg-amber-400/20 text-amber-500 border-amber-500/20" : "bg-petal-rose/20 text-petal-rose border-petal-rose/20")}>
                                {profile?.isPremium ? "Premium Provider" : "Official Provider"}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">•</span>
                            <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Activity size={12} className="text-petal-leaf" /> System Optimal
                            </span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-display font-black text-petal-moss dark:text-white tracking-tighter leading-tight mb-4">
                            Greeting, <br />
                            <span className="text-petal-rose italic">{profile?.name || user?.name || 'Provider'} Hub</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-300 font-medium text-lg max-w-xl">
                            Oversee your professional hive operations and ritual queue in real-time.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <button
                            onClick={toggleActiveStatus}
                            className={cn("px-8 py-5 rounded-[28px] shadow-2xl flex items-center gap-3 transition-all hover:scale-105",
                                profile?.isActive
                                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                    : "bg-gray-500 text-white shadow-gray-500/20 grayscale")}
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-tight">Status</p>
                                <p className="text-xl font-black">{profile?.isActive ? "Active" : "Inactive"}</p>
                            </div>
                        </button>

                        {!profile?.isPremium && (
                            <button
                                onClick={() => setShowPremiumModal(true)}
                                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-5 rounded-[28px] shadow-2xl shadow-amber-500/20 flex items-center gap-3 transition-transform hover:scale-105"
                            >
                                <Zap size={20} fill="currentColor" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-tight">Priority Mode</p>
                                    <p className="text-xl font-black">Go Premium</p>
                                </div>
                            </button>
                        )}

                        <div className="relative group bg-petal-rose text-white px-8 py-5 rounded-[28px] shadow-2xl shadow-petal-rose/30 flex flex-col min-w-[180px] transition-transform hover:scale-105">
                            <div className="absolute top-[-10px] right-[-10px] bg-white text-petal-rose w-8 h-8 rounded-full flex items-center justify-center font-black animate-bounce shadow-lg border-2 border-petal-rose">
                                {stats.pending}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">New Summons</span>
                            <span className="text-2xl font-black">Requests</span>
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-petal-rose/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            </header>

            {/* Premium Upgrade Modal */}
            <AnimatePresence>
                {showPremiumModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowPremiumModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="w-full max-w-5xl bg-white dark:bg-[#0f1115] rounded-[48px] p-8 md:p-14 shadow-[0_0_100px_rgba(245,158,11,0.15)] border border-amber-500/20 relative overflow-hidden z-10 max-h-[95vh] overflow-y-auto custom-scrollbar"
                        >
                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="absolute top-8 right-8 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 p-3 rounded-full transition-all z-20"
                            >
                                <X size={28} />
                            </button>

                            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            <div className="text-center mb-14 relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="bg-gradient-to-br from-amber-400 to-orange-500 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30"
                                >
                                    <Sparkles className="text-white" size={48} fill="currentColor" />
                                </motion.div>
                                <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
                                    Ascend to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 italic">Premium Bee</span>
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                                    Summon the highest tier of priority and dominate the local hive with exclusive features and top-tier visibility.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
                                <PricingCard
                                    title="Monthly Ritual"
                                    price="₹2,000"
                                    period="per month"
                                    features={["Priority Search Listing", "Premium Badge", "24/7 Hive Support"]}
                                    onClick={() => handleSubscribe('monthly')}
                                />
                                <PricingCard
                                    title="Semi-Annual Ritual"
                                    price="₹10,000"
                                    period="per 6 months"
                                    popular
                                    features={["All Monthly Features", "Save ₹2,000", "Analytics Dashboard"]}
                                    onClick={() => handleSubscribe('semi-annual')}
                                />
                                <PricingCard
                                    title="Annual Ritual"
                                    price="₹20,000"
                                    period="per year"
                                    features={["All Semi-Annual Features", "Save ₹4,000", "Official Partner Status"]}
                                    onClick={() => handleSubscribe('yearly')}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={Users} label="Client Reach" value={stats.reach} color="petal-leaf" trend="Total Users" />
                <StatCard icon={Activity} label="Job Success" value={`${stats.success}%`} color="petal-moss" trend="Finished Jobs" />
                <StatCard icon={Briefcase} label="Honey Harvest" value={`₹${stats.revenue}`} color="petal-rose" trend="Lifetime Earnings" />
                <StatCard icon={Bell} label="Active Queue" value={requests.length} color="petal-leaf" trend="Total Summons" />
            </div>

            {/* Main Queue Section */}
            <div className="space-y-8 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <h3 className="text-3xl md:text-4xl font-black text-petal-moss dark:text-white tracking-tighter flex items-center gap-4">
                        <div className="bg-petal-leaf/10 p-4 rounded-[24px]"><Package className="text-petal-leaf" size={32} /></div>
                        Active Operational Queue
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {requests.length > 0 ? requests.map((req, idx) => (
                            <motion.div key={req._id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                                <Card className="p-8 h-full flex flex-col bg-white/60 dark:bg-white/5 hover:border-petal-rose/40 transition-all duration-500">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5">
                                            <Calendar className="text-petal-rose" size={28} />
                                        </div>
                                        <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                                            {req.status}
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-2xl font-black text-petal-moss dark:text-white mb-3 tracking-tight">{req.serviceName}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-4 flex items-center gap-2">
                                            <User className="text-petal-leaf" size={16} /> {req.user?.name}
                                        </p>
                                        <p className="text-xs font-black text-petal-rose uppercase tracking-widest bg-petal-rose/10 px-4 py-1.5 rounded-xl w-fit">Fee: ₹{req.amount || 0}</p>
                                    </div>
                                    <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
                                        {req.status === 'pending' && (
                                            <Button onClick={() => updateStatus(req._id, 'accepted')} className="w-full bg-petal-leaf text-white h-14 rounded-2xl font-black">Accept Ritual</Button>
                                        )}
                                        {req.status === 'accepted' && (
                                            <Button onClick={() => updateStatus(req._id, 'completed')} className="w-full bg-petal-rose text-white h-14 rounded-2xl font-black">Complete Job</Button>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center opacity-50 italic">No job spirits detected in the queue.</div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

const PricingCard = ({ title, price, period, features, onClick, popular }) => (
    <div className={cn("p-10 rounded-[48px] border-2 transition-all duration-500 flex flex-col group relative overflow-hidden",
        popular
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-gray-900 border-amber-300 shadow-[0_20px_50px_rgba(245,158,11,0.3)] scale-105 z-10"
            : "bg-white dark:bg-[#1a1c21] border-gray-100 dark:border-white/5 text-gray-900 dark:text-white hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10")}>

        {popular && (
            <>
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">
                    Most Summoned
                </div>
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none" />
            </>
        )}

        <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">{title}</h3>
        <p className={cn("text-xs font-bold mb-8 opacity-70 uppercase tracking-[0.2em]", popular ? "text-gray-900" : "text-gray-500 dark:text-gray-400")}>{period}</p>

        <div className="flex items-baseline gap-1 mb-10">
            <span className="text-5xl font-black tracking-tighter">{price}</span>
            <span className="text-sm font-bold opacity-60">/ ritual</span>
        </div>

        <div className="space-y-5 mb-12 flex-grow">
            {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 text-sm font-bold group/feat">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover/feat:scale-110",
                        popular ? "bg-gray-900/10" : "bg-amber-500/10")}>
                        <CheckCircle size={14} className={popular ? "text-gray-900" : "text-amber-500"} />
                    </div>
                    <span className="opacity-90">{f}</span>
                </div>
            ))}
        </div>

        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn("w-full h-16 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] border-none shadow-xl transition-all",
                popular
                    ? "bg-gray-900 text-white hover:bg-black shadow-gray-900/20"
                    : "bg-amber-400 text-gray-900 hover:bg-amber-500 shadow-amber-500/20")}
        >
            Upgrade Now
        </motion.button>
    </div>
);

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <Card className="p-10 flex flex-col bg-white/60 dark:bg-bee-muted/20 backdrop-blur-xl border border-white/20 dark:border-white/5 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl">
        <div className={cn("p-5 rounded-2xl w-fit mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
            color === 'petal-rose' ? 'bg-petal-rose/10 text-petal-rose' :
                color === 'petal-moss' ? 'bg-petal-moss/10 text-petal-moss dark:text-white' :
                    'bg-petal-leaf/10 text-petal-leaf'
        )}>
            <Icon size={28} />
        </div>
        <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.4em] mb-3">{label}</p>
        <div className="flex items-baseline gap-3">
            <p className="text-4xl font-black text-petal-moss dark:text-white leading-none tracking-tighter">{value}</p>
            {trend && <span className="text-[11px] font-bold text-petal-rose italic opacity-80">{trend}</span>}
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    </Card>
);
