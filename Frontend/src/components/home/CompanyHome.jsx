import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import api from "../../utils/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Clock, PlayCircle, CheckCircle, Package, User, Calendar, Users, Activity, Briefcase, Plus, Bell, ChevronRight, Star, ShieldCheck, Zap, Globe, Sparkles, X, MessageCircle, Banknote, Edit3, Trash2, MapPin, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../../components/ui/Input";

export default function CompanyHome() {
    const { user } = useAuth();
    const socket = useSocket();
    const [requests, setRequests] = useState([]);
    const [profile, setProfile] = useState(null);
    const messagesEndRef = useRef(null);
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
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [activeChatRequest, setActiveChatRequest] = useState(null);
    const [newService, setNewService] = useState({ name: "", price: "", description: "" });
    const [offerAmount, setOfferAmount] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [holidayDate, setHolidayDate] = useState("");

    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    useEffect(() => {
        if (socket && showChatModal && activeChatRequest) {
            socket.emit("join:request", { requestId: activeChatRequest._id });

            const handleNewMessage = (msg) => {
                if (msg.request === activeChatRequest._id) {
                    setChatMessages(prev => [...prev, msg]);
                    setTimeout(scrollToBottom, 100);
                }
            };

            socket.on("new_private_message", handleNewMessage);

            return () => {
                socket.off("new_private_message", handleNewMessage);
            };
        }
    }, [socket, showChatModal, activeChatRequest]);

    useEffect(() => {
        if (showChatModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showChatModal]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [reqRes, profRes] = await Promise.all([
                api.get("/api/requests/company"),
                api.get("/api/companies/profile")
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
            setError(err.response?.data?.message || err.message || "Failed to establish connection to the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (plan) => {
        if (!profile?.isVerified) {
            alert("Process Interrupted: Your account must be verified by the Admin before you can upgrade to Premium status.");
            return;
        }

        const confirmUpgrade = window.confirm(
            "⚠️ Refund Notice: Once the process is initiated and payment is processed, refunds are not possible if you decide to change or cancel the plan later. Do you wish to proceed with the upgrade?"
        );

        if (!confirmUpgrade) return;

        try {
            const res = await api.post("/api/payments/premium/create-order", { plan });

            const options = {
                key: res.data.keyId,
                amount: res.data.amount,
                currency: res.data.currency,
                name: "Service-Bee Premium",
                description: `Upgrade to ${plan} priority status`,
                order_id: res.data.orderId,
                handler: async (response) => {
                    try {
                        await api.post("/api/payments/premium/verify", {
                            orderId: res.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        alert("Upgrade Successful! You are now a Premium Bee.");
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
                    color: "#F59E0B"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("[PREMIUM ERROR]", err);
            const msg = err.response?.data?.message || err.message || "Failed to initiate premium upgrade.";
            alert(`Process Interrupted: ${msg}`);
        }
    };

    const toggleActiveStatus = async () => {
        try {
            const res = await api.patch("/api/companies/toggle-active", {});
            setProfile(prev => ({ ...prev, isActive: res.data.isActive }));
            alert(res.data.message);
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const updateStatus = async (requestId, newStatus) => {
        try {
            await api.patch(`/api/requests/${requestId}/status`, { status: newStatus });
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status.");
        }
    };

    const handleUpdateCatalog = async () => {
        try {
            await api.put("/api/companies/catalog", { catalog: profile.serviceCatalog });
            alert("Service catalog updated successfully!");
            setShowCatalogModal(false);
        } catch (err) {
            alert("Failed to update catalog.");
        }
    };

    const handleAddService = () => {
        if (!newService.name || !newService.price) return;
        setProfile(prev => ({
            ...prev,
            serviceCatalog: [...(prev.serviceCatalog || []), { ...newService, price: Number(newService.price) }]
        }));
        setNewService({ name: "", price: "", description: "" });
        setShowCatalogModal(false);
    };

    const handleRemoveService = (idx) => {
        const updated = [...profile.serviceCatalog];
        updated.splice(idx, 1);
        setProfile(prev => ({ ...prev, serviceCatalog: updated }));
    };

    const handleOfferPrice = async (requestId) => {
        const price = offerAmount[requestId];
        if (!price) return;
        try {
            await api.post(`/api/requests/${requestId}/offer-price`, { price: Number(price) });
            alert("Price offer sent!");
            fetchAllData();
        } catch (err) {
            alert("Failed to send price offer.");
        }
    };

    const openChat = async (req) => {
        setActiveChatRequest(req);
        setShowChatModal(true);
        fetchMessages(req._id);
    };

    const fetchMessages = async (requestId) => {
        try {
            const res = await api.get(`/api/requests/${requestId}/messages`);
            setChatMessages(res.data || []);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleAddHoliday = async () => {
        if (!holidayDate) return;
        if (profile?.unavailableDates?.includes(holidayDate)) {
            alert("This day is already marked as a holiday.");
            return;
        }
        try {
            const newDates = [...(profile?.unavailableDates || []), holidayDate];
            await api.put("/api/companies/holidays", { dates: newDates });
            setHolidayDate("");
            fetchAllData();
        } catch (err) {
            alert("Failed to mark holiday.");
        }
    };

    const handleRemoveHoliday = async (dateToRemove) => {
        try {
            const newDates = profile.unavailableDates.filter(d => d !== dateToRemove);
            await api.put("/api/companies/holidays", { dates: newDates });
            fetchAllData();
        } catch (err) {
            alert("Failed to restore workday.");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || activeChatRequest?.status === 'completed' || activeChatRequest?.status === 'rejected') return;
        try {
            await api.post(`/api/requests/${activeChatRequest._id}/messages`, { text: newMessage });
            setNewMessage("");
        } catch (err) {
            alert("Failed to send message.");
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
                    <p className="text-gray-900 dark:text-white font-black uppercase tracking-[0.4em] text-sm mb-2">Syncing Panel</p>
                    <p className="text-petal-rose font-bold text-xs animate-pulse italic">Connecting to provider network...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08090a] p-8 md:p-12 lg:p-20">
            {profile?.isVerified === false && (
                <div className="mb-12 p-8 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-center gap-6 animate-pulse">
                    <ShieldCheck className="text-amber-500 shrink-0" size={32} />
                    <div>
                        <p className="text-amber-600 font-black uppercase tracking-widest text-xs mb-1">Verification Required</p>
                        <p className="text-gray-900 dark:text-gray-100 font-bold">Your profile is currently under review by our team.</p>
                    </div>
                </div>
            )}

            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 relative">
                <div className="relative z-10">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="p-2.5 bg-petal-rose/10 rounded-2xl shadow-inner">
                            <MapPin size={20} className="animate-bounce text-petal-rose" />
                        </div>
                        <span className="text-[12px] uppercase font-black tracking-[0.5em] text-gray-500 dark:text-gray-400">{user?.city || 'Local Area'} Service Network</span>
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-6 italic">
                        {profile?.name || 'Service'} <span className="text-petal-rose">Hub</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="px-6 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-gray-500 dark:text-gray-400">
                            {user?.city} District
                        </span>
                        {profile?.isPremium && (
                            <span className="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                                Premium Provider
                            </span>
                        )}
                        <button
                            onClick={toggleActiveStatus}
                            className={cn("px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                profile?.isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-rose-500 text-white shadow-lg shadow-rose-500/20")}
                        >
                            {profile?.isActive ? "Accepting Jobs" : "Offline"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap gap-4 relative z-10 w-full lg:w-auto">
                    <Button onClick={() => setShowCatalogModal(true)} className="flex-1 lg:flex-none bg-white dark:bg-white/5 text-petal-moss dark:text-white border border-gray-100 dark:border-white/10 shadow-xl hover:bg-gray-50 dark:hover:bg-white/10 h-16 px-8 rounded-[24px] font-black group transition-all">
                        <Edit3 className="group-hover:rotate-12 transition-transform text-petal-rose mr-2" size={18} /> Manage Catalog
                    </Button>
                    <Button onClick={() => setShowHolidayModal(true)} className="flex-1 lg:flex-none bg-white dark:bg-white/5 text-petal-moss dark:text-white border border-gray-100 dark:border-white/10 shadow-xl hover:bg-gray-50 dark:hover:bg-white/10 h-16 px-8 rounded-[24px] font-black group transition-all">
                        <Calendar className="mr-2 text-amber-500" size={18} /> Store Holidays
                    </Button>
                    {!profile?.isPremium && (
                        <Button onClick={() => setShowPremiumModal(true)} className="w-full lg:w-auto bg-amber-400 text-gray-900 border-none shadow-xl shadow-amber-500/20 h-16 px-8 rounded-[24px] font-black group overflow-hidden relative">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Zap size={18} fill="currentColor" className="animate-pulse" /> Go Premium
                            </span>
                        </Button>
                    )}
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <StatCard icon={Users} label="Client Reach" value={stats.reach} color="petal-leaf" trend="Total Users" />
                <StatCard icon={Activity} label="Service Success" value={`${stats.success}%`} color="petal-moss" trend="Finished Jobs" />
                <StatCard icon={Briefcase} label="Earnings" value={`₹${stats.revenue}`} color="petal-rose" trend="Lifetime Earnings" />
                <StatCard icon={Bell} label="Active Queue" value={requests.length} color="petal-leaf" trend="Total Requests" />
            </div>

            {/* Main Queue Section */}
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4">
                        <div className="bg-petal-leaf/10 p-3 rounded-2xl"><Package className="text-petal-leaf" size={24} /></div>
                        Operational Queue
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {requests.length > 0 ? requests.map((req) => (
                            <motion.div key={req._id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                                <Card className="p-8 h-full flex flex-col bg-white/60 dark:bg-white/5 hover:border-petal-rose/40 transition-all duration-500 relative group">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/5">
                                            <Calendar className="text-petal-rose" size={20} />
                                        </div>
                                        <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                req.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                    req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-rose-100 text-rose-700')}>
                                            {req.status}
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{req.serviceName}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold mb-4 flex items-center gap-2">
                                            <User className="text-petal-leaf" size={14} /> {req.user?.name}
                                        </p>

                                        {req.isCustom ? (
                                            <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-500/20 mb-4">
                                                <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Custom Price Negotiation</p>
                                                {req.negotiationStatus === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Amount (₹)"
                                                            className="w-full bg-white dark:bg-black/20 rounded-xl px-3 text-sm font-bold border-none"
                                                            value={offerAmount[req._id] || ""}
                                                            onChange={(e) => setOfferAmount({ ...offerAmount, [req._id]: e.target.value })}
                                                        />
                                                        <Button onClick={() => handleOfferPrice(req._id)} className="h-10 px-4 bg-emerald-500 text-white rounded-xl text-[10px] font-black">OFFER</Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-emerald-500 font-bold text-sm">Offer Sent: ₹{req.amount}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs font-black text-petal-rose uppercase tracking-widest bg-petal-rose/10 px-4 py-1.5 rounded-xl w-fit">Fee: ₹{req.amount || 0}</p>
                                        )}

                                        <p className="text-[11px] text-gray-400 mt-4 italic">"{req.userNote || 'No booking note...'}"</p>
                                    </div>

                                    <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5 flex gap-3">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button onClick={() => updateStatus(req._id, 'accepted')} className="flex-1 bg-petal-leaf text-white h-14 rounded-2xl font-black">Accept</Button>
                                                <Button onClick={() => updateStatus(req._id, 'rejected')} variant="ghost" className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center border-none">
                                                    <X className="text-rose-500" size={24} />
                                                </Button>
                                            </>
                                        )}
                                        {req.status === 'accepted' && (
                                            <Button onClick={() => updateStatus(req._id, 'completed')} className="flex-1 bg-petal-rose text-white h-14 rounded-2xl font-black">Complete</Button>
                                        )}
                                        <Button variant="ghost" onClick={() => openChat(req)} className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border-none hover:bg-petal-rose/10 transition-colors">
                                            <MessageCircle className="text-petal-rose" size={24} />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center opacity-50 italic">No active jobs in the queue.</div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Catalog Modal */}
            <AnimatePresence>
                {showCatalogModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCatalogModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white dark:bg-[#0f1115] rounded-[48px] p-8 md:p-12 shadow-2xl border border-white/10 relative z-10 max-h-[85vh] overflow-y-auto">
                            <button onClick={() => setShowCatalogModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                            <h2 className="text-3xl font-black mb-8 text-gray-900 dark:text-white tracking-tight italic">Service Catalog</h2>

                            <div className="space-y-6 mb-10 bg-gray-50 dark:bg-white/5 p-6 rounded-[32px]">
                                <p className="text-[10px] font-black uppercase text-petal-rose tracking-[0.2em] mb-4">Add New Service</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="Service Name" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
                                    <Input placeholder="Price (₹)" type="number" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} />
                                </div>
                                <Input placeholder="Brief Description" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
                                <Button onClick={handleAddService} className="w-full bg-petal-rose text-white h-14 rounded-2xl font-black">Add to Catalog</Button>
                            </div>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {profile?.serviceCatalog?.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 group">
                                        <div>
                                            <p className="font-black text-gray-800 dark:text-white">{s.name}</p>
                                            <p className="text-xs font-bold text-petal-rose">₹{s.price}</p>
                                        </div>
                                        <button onClick={() => handleRemoveService(i)} className="p-3 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={handleUpdateCatalog} className="w-full bg-emerald-500 text-white h-16 rounded-[24px] font-black text-lg mt-10 shadow-xl shadow-emerald-500/20 uppercase tracking-widest">Save Catalog</Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Holiday Modal */}
            <AnimatePresence>
                {showHolidayModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHolidayModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg bg-white dark:bg-[#0f1115] rounded-[48px] p-8 md:p-12 shadow-2xl border border-white/10 relative z-10">
                            <h2 className="text-3xl font-black mb-8 text-gray-900 dark:text-white tracking-tight italic">Store Holidays</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Mark dates when you are unavailable</p>

                            <div className="space-y-6 mb-10 bg-gray-50 dark:bg-white/5 p-6 rounded-[32px]">
                                <Input type="date" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} min={new Date().toLocaleDateString('en-CA')} />
                                <Button onClick={handleAddHoliday} className="w-full bg-petal-leaf text-white h-14 rounded-2xl font-black italic">Mark Date</Button>
                            </div>

                            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {profile?.unavailableDates?.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                                        <p className="font-bold text-gray-800 dark:text-gray-300">{new Date(d).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                                        <button onClick={() => handleRemoveHoliday(d)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={() => setShowHolidayModal(false)} className="w-full bg-gray-900 text-white h-16 rounded-[24px] font-black text-lg mt-10 shadow-xl uppercase tracking-widest">Close</Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Premium Modal */}
            <AnimatePresence>
                {showPremiumModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPremiumModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-5xl bg-white dark:bg-[#0f1115] rounded-[48px] p-8 md:p-14 shadow-2xl border border-white/10 relative z-10 max-h-[95vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setShowPremiumModal(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>

                            <div className="text-center mb-16">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-amber-400 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-400/20">
                                    <Sparkles className="text-white" size={48} fill="currentColor" />
                                </motion.div>
                                <h2 className="text-5xl font-black mb-4">Go <span className="text-amber-500">Premium</span></h2>
                                <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">Unlock advanced features and top visibility in the local network.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <PricingCard title="Monthly Plan" price="₹2,000" period="per month" features={["Priority Listing", "Premium Badge", "24/7 Support"]} onClick={() => handleSubscribe('monthly')} />
                                <PricingCard title="6-Month Plan" price="₹10,000" period="per 6 months" popular features={["All Monthly Features", "Save ₹2,000", "Analytics"]} onClick={() => handleSubscribe('semi-annual')} />
                                <PricingCard title="Annual Plan" price="₹20,000" period="per year" features={["All 6-Month Features", "Save ₹4,000", "Official Partner"]} onClick={() => handleSubscribe('yearly')} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {showChatModal && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowChatModal(false)} />
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="w-full max-w-lg bg-white dark:bg-[#15171b] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 relative z-10 flex flex-col h-[600px] max-h-[85vh]">
                            <div className="p-8 bg-petal-rose text-white flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">User Chat</p>
                                    <h3 className="text-xl font-black text-white">{activeChatRequest?.user?.name}</h3>
                                </div>
                                <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar space-y-4 bg-gray-50/30 dark:bg-transparent">
                                {activeChatRequest?.status === 'completed' && (
                                    <div className="p-6 bg-petal-rose/10 rounded-2xl border border-petal-rose/20 text-center">
                                        <p className="text-sm font-bold text-petal-rose italic">"The service has concluded. The channel is now read-only."</p>
                                    </div>
                                )}

                                {activeChatRequest?.status === 'rejected' && (
                                    <div className="p-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-center">
                                        <p className="text-sm font-bold text-rose-500 italic">"This request was rejected. The conversation is closed."</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {chatMessages.length > 0 ? chatMessages.map((msg, idx) => {
                                        const isMe = msg.senderType === "Company";
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm ${isMe ? 'bg-petal-rose text-white rounded-tr-none' : 'bg-white dark:bg-white/5 text-gray-800 dark:text-white rounded-tl-none border border-gray-100 dark:border-white/5'}`}>
                                                    <p className="text-sm font-medium">{msg.text}</p>
                                                    <p className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-white' : 'text-gray-500'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-center py-10 text-gray-400 text-sm italic">No messages yet. Start the conversation!</p>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-100 dark:border-white/5">
                                {(activeChatRequest?.status !== 'completed' && activeChatRequest?.status !== 'rejected') ? (
                                    <div className="flex gap-3">
                                        <input
                                            placeholder="Type a message..."
                                            className="flex-grow bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 h-16 rounded-2xl px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-petal-rose/20 transition-all dark:text-white"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        />
                                        <button onClick={sendMessage} className="w-16 h-16 bg-petal-rose text-white rounded-2xl flex items-center justify-center shadow-lg shadow-petal-rose/20 hover:scale-105 transition-all">
                                            <ArrowRight size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Button variant="ghost" className="text-petal-rose font-black uppercase tracking-widest text-xs" onClick={() => setShowChatModal(false)}>Close Chat</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const PricingCard = ({ title, price, period, features, onClick, popular }) => (
    <div className={cn("p-10 rounded-[48px] border-2 transition-all duration-500 flex flex-col group relative overflow-hidden",
        popular
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-gray-900 border-amber-300 shadow-2xl scale-105 z-10"
            : "bg-white dark:bg-[#1a1c21] border-gray-100 dark:border-white/5 text-gray-900 dark:text-white hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10")}>

        {popular && (
            <div className="absolute top-0 right-10 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">
                Best Value
            </div>
        )}

        <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">{title}</h3>
        <p className={cn("text-xs font-bold mb-8 opacity-70 uppercase tracking-[0.2em]", popular ? "text-gray-900" : "text-gray-500 dark:text-gray-400")}>{period}</p>

        <div className="flex items-baseline gap-1 mb-10">
            <span className="text-5xl font-black tracking-tighter">{price}</span>
            <span className="text-sm font-bold opacity-60">/ plan</span>
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
    <Card className="p-10 flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/5 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl">
        <div className={cn("p-5 rounded-2xl w-fit mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
            color === 'petal-rose' ? 'bg-petal-rose/10 text-petal-rose' :
                color === 'petal-moss' ? 'bg-petal-moss/10 text-petal-moss dark:text-white' :
                    'bg-petal-leaf/10 text-petal-leaf'
        )}>
            <Icon size={28} />
        </div>
        <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.4em] mb-3">{label}</p>
        <div className="flex items-baseline gap-3">
            <p className="text-4xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">{value}</p>
            {trend && <span className="text-[11px] font-bold text-petal-rose italic opacity-80">{trend}</span>}
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    </Card>
);
