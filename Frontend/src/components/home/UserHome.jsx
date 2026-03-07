import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import api from "../../utils/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, Sparkles, ArrowRight, Users, MapPin, Star, MessageSquare, Briefcase, Image, Upload, X, MessageCircle, Banknote, ChevronRight, Zap, Activity, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

const CATEGORIES = [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Pest Control",
    "Appliance Repair",
    "Beauty & Spa",
    "Gardening",
    "Home Security",
    "Packing & Moving",
    "AC Service"
];

export default function UserHome() {
    const { user } = useAuth();
    const socket = useSocket();
    const [activeTab, setActiveTab] = useState("book");
    const [companies, setCompanies] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [bookingData, setBookingData] = useState({ serviceName: "", bookingDate: "", userNote: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [activeChatRequest, setActiveChatRequest] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All Services");
    const [newMessage, setNewMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [bookingError, setBookingError] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewingRequest, setReviewingRequest] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const today = new Date().toLocaleDateString('en-CA');



    // Calculate minimum allowed date for standard users (today + 2 days)
    const stdMinDate = new Date();
    stdMinDate.setDate(stdMinDate.getDate() + 2);
    const stdMinDateStr = stdMinDate.toLocaleDateString('en-CA');

    useEffect(() => {
        fetchData();
    }, [user?.city]);

    useEffect(() => {
        if (selectedCompany) {
            fetchReviews(selectedCompany._id);
        }
    }, [selectedCompany]);

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

    const fetchData = async () => {
        try {
            const cityQuery = user?.city ? `?city=${user.city}` : '';
            const [companiesRes, requestsRes] = await Promise.all([
                api.get(`/api/companies${cityQuery}`),
                api.get("/api/requests")
            ]);
            setCompanies(companiesRes.data.companies || []);
            setRequests(requestsRes.data.requests || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (companyId) => {
        try {
            const res = await api.get(`/api/reviews/company/${companyId}`);
            setReviews(res.data || []);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!selectedCompany) return;
        setBookingLoading(true);
        const data = new FormData();
        data.append("companyId", selectedCompany._id);
        data.append("serviceName", bookingData.serviceName);
        data.append("bookingDate", bookingData.bookingDate);
        data.append("userNote", bookingData.userNote || "");
        data.append("isCustom", bookingData.isCustom || false);

        if (selectedFile) {
            data.append("attachments", selectedFile);
        }

        try {
            const reqRes = await api.post("/api/requests", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            const requestId = reqRes.data.request._id;

            // Immediately switch to requests tab so they see it's saved
            setActiveTab("my-requests");
            setBookingData({ serviceName: "", bookingDate: "", userNote: "" });
            setSelectedFile(null);
            setPreviewUrl(null);
            setSelectedCompany(null);
            fetchData();

            // Trigger Razorpay Payment
            const payRes = await api.post("/api/payments/create-order", { requestId });

            const options = {
                key: payRes.data.keyId,
                amount: payRes.data.amount,
                currency: payRes.data.currency,
                name: "Service-Bee Payment",
                description: `Service Fee for ${bookingData.serviceName}`,
                order_id: payRes.data.orderId,
                handler: async (response) => {
                    try {
                        await api.post("/api/payments/verify", {
                            orderId: payRes.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        alert("Payment Confirmed! Your booking is now official.");
                        setActiveTab("my-requests");
                        setBookingData({ serviceName: "", bookingDate: "", userNote: "" });
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setSelectedCompany(null);
                        fetchData();
                    } catch (err) {
                        alert("Verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email
                },
                theme: {
                    color: "#FF8E9C"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Booking Error:", err);
            const msg = err.response?.data?.message || "Failed to process booking.";
            setBookingError(msg);
        } finally {
            setBookingLoading(false);
        }
    };

    const handlePayNow = async (requestId, serviceName) => {
        try {
            const res = await api.post("/api/payments/create-order", { requestId });

            const options = {
                key: res.data.keyId,
                amount: res.data.amount,
                currency: res.data.currency,
                name: "Service-Bee Payment",
                description: `Service Fee for ${serviceName}`,
                order_id: res.data.orderId,
                handler: async (response) => {
                    try {
                        await api.post("/api/payments/verify", {
                            orderId: res.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        alert("Payment Confirmed! Your booking is now official.");
                        fetchData();
                    } catch (err) {
                        alert("Verification failed. Please contact support.");
                    }
                },
                theme: { color: "#FF8E9C" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert("Failed to initiate payment.");
        }
    };

    const openChat = (req) => {
        setActiveChatRequest(req);
        setShowChatModal(true);
        fetchMessages(req._id);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || activeChatRequest?.status === 'completed' || activeChatRequest?.status === 'rejected') return;
        try {
            await api.post(`/api/requests/${activeChatRequest._id}/messages`, { text: newMessage });
            setNewMessage("");
            // In a real app, socket would update this, but for now let's hope it feels snappy
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send message.");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewingRequest) return;
        setReviewLoading(true);
        try {
            await api.post("/api/reviews", {
                requestId: reviewingRequest._id,
                rating,
                comment
            });

            alert("Thank you for your review!");
            setReviewModalOpen(false);
            setReviewingRequest(null);
            setRating(5);
            setComment("");
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setReviewLoading(false);
        }
    };


    const filteredCompanies = companies.filter(c => {
        if (!c.isVerified) return false;

        const term = searchTerm.toLowerCase().trim();

        // If there's a search term, prioritize name match across all categories
        if (term) {
            return c.name?.toLowerCase().includes(term);
        }

        // Otherwise, filter by selected category
        const categoryMatch = selectedCategory === "All Services" || c.serviceCategory === selectedCategory;
        return categoryMatch;
    });

    return (
        <div className="space-y-16 max-w-7xl mx-auto px-4 py-12 relative overflow-visible">
            {/* Ambient Background Magic */}
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[120%] h-[600px] bg-gradient-to-b from-amber-500/5 via-petal-rose/5 to-transparent pointer-events-none blur-[120px] -z-10" />

            <header className="flex flex-col lg:flex-row justify-between items-end border-b border-gray-100 dark:border-white/5 pb-12 gap-10 relative">
                <div className="relative group max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-petal-rose mb-6"
                    >
                        <div className="p-2.5 bg-petal-rose/10 rounded-2xl shadow-inner">
                            <MapPin size={20} className="animate-bounce" />
                        </div>
                        <span className="text-[12px] uppercase font-black tracking-[0.5em]">{user?.city || 'Local Area'} Service Network</span>
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-display font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9] mb-8">
                        Service <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-gradient-x italic">Marketplace</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-sm">
                            <Sparkles size={14} className="text-amber-500" />
                            <p className="text-gray-600 dark:text-gray-300 text-[11px] font-black uppercase tracking-widest">
                                {filteredCompanies.length} Verified Providers
                            </p>
                        </div>
                        {!user?.isPremium && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 group/promo cursor-help">
                                <Zap size={14} className="text-amber-500" />
                                <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest transition-colors">
                                    Standard delay active
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-2.5 rounded-[40px] border border-white/20 shadow-2xl">
                    <button
                        className={`px-12 py-5 rounded-[32px] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-95 ${activeTab === 'book' ? 'bg-white dark:bg-petal-rose text-gray-900 dark:text-white shadow-[0_15px_30px_rgba(255,142,156,0.3)]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        onClick={() => setActiveTab('book')}
                    >
                        Marketplace
                    </button>
                    <button
                        className={`px-12 py-5 rounded-[32px] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-95 ${activeTab === 'my-requests' ? 'bg-white dark:bg-petal-rose text-gray-900 dark:text-white shadow-[0_15px_30px_rgba(255,142,156,0.3)]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        onClick={() => setActiveTab('my-requests')}
                    >
                        My Bookings
                    </button>
                </div>
            </header>

            {activeTab === "book" ? (
                <div className="space-y-10">
                    {/* Category Selector replaces AI */}
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[48px] border border-white/20 shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-petal-rose/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-petal-rose/10" />

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-petal-rose text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-petal-rose/20">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-petal-rose mb-1">Service Discovery</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Find what you need.</h3>
                                </div>
                            </div>

                            <div className="w-full md:w-72 relative group/cat">
                                <select
                                    className="w-full h-16 rounded-2xl bg-white dark:bg-[#1a1c21] border border-gray-100 dark:border-white/10 px-8 font-black text-xs uppercase tracking-widest text-gray-800 dark:text-white appearance-none focus:ring-4 focus:ring-petal-rose/20 transition-all cursor-pointer shadow-xl"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="All Services">All Specialities</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-petal-rose rotate-90 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -track-y-1/2 text-gray-400 group-focus-within:text-petal-rose transition-colors" size={20} style={{ transform: 'translateY(-50%)' }} />
                                <Input
                                    placeholder="Search the service you want"
                                    className="pl-14 pr-14 h-16 rounded-[24px] bg-white dark:bg-petal-muted/20 border-none shadow-lg focus:ring-2 focus:ring-petal-rose transition-all placeholder:text-gray-400 text-gray-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 ml-4 font-bold italic">(Search for specific providers or niche skills in {selectedCategory})</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredCompanies.length > 0 ? filteredCompanies.map(company => (
                                    <Card
                                        key={company._id}
                                        className={`p-8 cursor-pointer transition-all duration-300 border-none group ${selectedCompany?._id === company._id ? 'bg-petal-rose text-white shadow-2xl scale-[1.02]' : 'bg-white dark:bg-petal-muted/20 hover:bg-gray-50 dark:hover:bg-petal-muted/30 shadow-xl'}`}
                                        onClick={() => setSelectedCompany(company)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${selectedCompany?._id === company._id ? 'bg-white/20' : 'bg-petal-leaf/10'}`}>
                                                <Briefcase size={22} className={selectedCompany?._id === company._id ? 'text-white' : 'text-petal-leaf'} />
                                            </div>
                                            <div className="flex items-center gap-1 bg-petal-rose/10 px-2 py-1 rounded-full border border-petal-rose/20">
                                                <Star size={12} className="text-petal-rose fill-petal-rose" />
                                                <span className={`text-[10px] font-black ${selectedCompany?._id === company._id ? 'text-white' : 'text-petal-rose'}`}>{company.rating || 'New'}</span>
                                            </div>
                                        </div>
                                        <h3 className={`text-xl font-black mb-1 ${selectedCompany?._id === company._id ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{company.name}</h3>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${selectedCompany?._id === company._id ? 'text-white/80' : 'text-petal-rose'}`}>{company.serviceCategory}</p>
                                    </Card>
                                )) : (
                                    <div className="col-span-full py-20 text-center">
                                        <Sparkles className="mx-auto mb-4 text-gray-200" size={48} />
                                        <p className="text-gray-400 font-display text-xl tracking-tight">No providers found in {user?.city || 'this area'}.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence mode="wait">
                                {selectedCompany ? (
                                    <motion.div
                                        key={selectedCompany._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <Card className="p-8 bg-white dark:bg-petal-muted/40 border-none shadow-2xl rounded-[40px]">
                                            <h3 className="text-2xl font-black mb-8 text-gray-800 dark:text-white tracking-tight">Request Service</h3>
                                            <form onSubmit={handleBook} className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-6 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Target Provider</p>
                                                        <p className="font-bold text-petal-leaf dark:text-petal-rose text-lg">{selectedCompany.name}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Rating</p>
                                                        <div className="flex items-center gap-1.5 bg-petal-rose/10 px-3 py-1 rounded-full border border-petal-rose/20">
                                                            <Star size={14} className="text-petal-rose fill-petal-rose" />
                                                            <span className="text-xs font-black text-petal-rose">{selectedCompany.rating || 'New'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Select Professional Service</p>
                                                        <div className="relative group/sel">
                                                            <select
                                                                className="w-full h-14 rounded-2xl bg-white dark:bg-[#1a1c21] border border-gray-100 dark:border-white/10 px-4 font-bold text-sm text-gray-800 dark:text-white appearance-none focus:ring-2 focus:ring-petal-rose/20 transition-all cursor-pointer shadow-sm"
                                                                value={bookingData.serviceName}
                                                                onChange={e => {
                                                                    const isCustom = e.target.value === "Custom Work";
                                                                    setBookingData({ ...bookingData, serviceName: e.target.value, isCustom });
                                                                }}
                                                                required
                                                            >
                                                                <option value="" className="text-gray-400">-- Select a Service --</option>
                                                                {selectedCompany.serviceCatalog?.map((s, i) => (
                                                                    <option key={i} value={s.name} className="text-gray-800 dark:text-white bg-white dark:bg-[#1a1c21]">{s.name} (₹{s.price})</option>
                                                                ))}
                                                                <option value="Custom Work" className="text-gray-800 dark:text-white bg-white dark:bg-[#1a1c21]">Other - Custom Service (Negotiable)</option>
                                                            </select>
                                                            <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/sel:text-petal-rose transition-colors rotate-90 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    {bookingData.isCustom && (
                                                        <Input label="Describe Your Custom Need" placeholder="What specific service do you require?" value={bookingData.userNote} onChange={e => setBookingData({ ...bookingData, userNote: e.target.value })} required className="bg-white dark:bg-transparent" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <Input
                                                        label="Service Date"
                                                        type="date"
                                                        value={bookingData.bookingDate}
                                                        onChange={e => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                                                        required
                                                        min={user?.isPremium ? today : stdMinDateStr}
                                                        className="bg-white dark:bg-transparent"
                                                    />
                                                    {!user?.isPremium && (
                                                        <p className="text-[9px] text-amber-600 font-bold italic ml-2 mt-1">Standard bookings require 48h prep. Go Premium for same-day!</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Service Photo (Optional)</p>
                                                    <div className="relative group/upload">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-white/5 transition-all group-hover/upload:border-petal-rose/50 group-hover/upload:bg-petal-rose/5">
                                                            {previewUrl ? (
                                                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedFile(null);
                                                                            setPreviewUrl(null);
                                                                        }}
                                                                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-colors z-20"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="p-3 bg-white dark:bg-white/5 rounded-xl shadow-sm">
                                                                        <Upload className="text-gray-400" size={24} />
                                                                    </div>
                                                                    <p className="text-xs font-bold text-gray-400">Tap to upload proof/reference</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button type="submit" disabled={bookingLoading} className="w-full bg-gray-800 dark:bg-petal-rose text-white h-16 rounded-[24px] font-black text-lg border-none hover:opacity-90 transition-all shadow-xl shadow-petal-rose/20 mt-4">
                                                    {bookingLoading ? 'Processing...' : 'Confirm Request'}
                                                </Button>
                                            </form>
                                        </Card>

                                        {/* Reviews Section */}
                                        <Card className="p-8 bg-white dark:bg-petal-muted/40 border-none shadow-2xl rounded-[40px]">
                                            <div className="flex items-center gap-2 mb-6">
                                                <MessageSquare className="text-petal-rose" size={20} />
                                                <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Customer Reviews</h3>
                                            </div>
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {reviews.length > 0 ? reviews.map(rev => (
                                                    <div key={rev._id} className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-black text-gray-500 uppercase">{rev.user?.name || 'Anonymous'}</span>
                                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-petal-rose/10 rounded-full">
                                                                <Star size={10} className="text-petal-rose fill-petal-rose" />
                                                                <span className="text-[10px] font-black text-petal-rose">{rev.rating}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 italic font-medium">"{rev.comment}"</p>
                                                    </div>
                                                )) : <p className="text-center py-6 text-gray-400 text-sm italic">No reviews yet.</p>}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center py-24 px-8 text-center bg-gray-50/50 dark:bg-petal-muted/10 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-petal-leaf/10"
                                    >
                                        <div className="bg-white dark:bg-petal-muted/30 p-6 rounded-3xl shadow-xl mb-6">
                                            <Sparkles className="text-petal-rose" size={48} />
                                        </div>
                                        <h4 className="text-xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">Select a Bee</h4>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Choose a service provider from the marketplace to see their reviews and book a service.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {requests.length > 0 ? requests.map(req => (
                        <Card key={req._id} className="p-8 bg-white dark:bg-petal-muted/20 border-none shadow-xl hover:shadow-2xl transition-all rounded-[40px] group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-petal-rose/10 rounded-2xl group-hover:rotate-6 transition-transform">
                                    <Calendar className="text-petal-rose" size={24} />
                                </div>
                                <div className="flex gap-2">
                                    {req.isUrgent && (
                                        <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1.5 shadow-sm">
                                            <Zap size={10} fill="currentColor" className="animate-pulse" /> Urgent
                                        </span>
                                    )}
                                    {req.isArranged && (
                                        <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
                                            <Sparkles size={10} fill="currentColor" /> Arranged
                                        </span>
                                    )}
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {req.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{req.serviceName}</h4>
                                <div className="flex items-center gap-1 bg-petal-rose/10 px-2 py-0.5 rounded-full border border-petal-rose/20">
                                    <Star size={10} className="text-petal-rose fill-petal-rose" />
                                    <span className="text-[10px] font-black text-petal-rose">{req.company?.rating || 'New'}</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase text-petal-rose mb-1 tracking-widest">{req.company?.name || 'Unknown Provider'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">Scheduled for {new Date(req.bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>

                            {req.paymentStatus !== 'paid' && req.status === 'pending' && (
                                <div className="mb-4 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity size={14} className="text-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-amber-600 uppercase">Payment Window</span>
                                    </div>
                                    <span className="text-[10px] font-black text-amber-600">
                                        {(req.expiresAt && !isNaN(new Date(req.expiresAt))) ?
                                            `${Math.max(0, Math.ceil((new Date(req.expiresAt) - new Date()) / (1000 * 60)))} mins left` :
                                            'Expires soon'}
                                    </span>
                                </div>
                            )}
                            <div className="pt-6 border-t border-gray-100 dark:border-petal-leaf/10 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-petal-rose tracking-[0.2em]">
                                        {req.paymentStatus === 'paid' ? 'Service Paid' :
                                            req.isCustom && req.negotiationStatus !== 'price_offered' ? 'Negotiation Pending' :
                                                'Unpaid Booking'}
                                    </span>
                                    {req.amount > 0 && req.paymentStatus !== 'paid' && (
                                        <p className="text-[9px] font-bold text-gray-400 mt-1 italic">Total inc. 5% Fee: ₹{Math.round(req.amount * 1.05)}</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => openChat(req)} className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border-none hover:bg-petal-rose/10 transition-colors">
                                        <MessageCircle className="text-petal-rose" size={24} />
                                    </Button>
                                    {req.amount > 0 && req.paymentStatus !== 'paid' && req.status !== 'rejected' && (
                                        <Button
                                            onClick={() => handlePayNow(req._id, req.serviceName)}
                                            className="bg-petal-rose text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none hover:opacity-90 shadow-lg shadow-petal-rose/20 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Banknote size={14} /> Pay Now
                                        </Button>
                                    )}
                                    {req.status === 'completed' && !req.isReviewed && (
                                        <Button
                                            onClick={() => {
                                                setReviewingRequest(req);
                                                setReviewModalOpen(true);
                                            }}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Star size={14} /> Rate & Review
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full py-28 text-center bg-gray-50/50 dark:bg-petal-muted/10 rounded-[48px] border-2 border-dashed border-gray-100 dark:border-petal-leaf/10">
                            <Calendar className="mx-auto mb-6 text-gray-200" size={64} />
                            <p className="font-display text-2xl font-black text-gray-400 tracking-tight">Your queue is empty.</p>
                            <Button variant="ghost" className="mt-6 text-petal-rose font-black uppercase tracking-widest text-xs" onClick={() => setActiveTab('book')}>Book a Service</Button>
                        </div>
                    )}
                </div>
            )}
            {/* Negotiation Chat Modal */}
            <AnimatePresence>
                {showChatModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowChatModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-white dark:bg-[#1a1c21] rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 relative z-10 flex flex-col h-[650px] max-h-[90vh]">

                            {/* Header */}
                            <div className="p-8 bg-white/50 dark:bg-white/5 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 flex justify-between items-center relative overflow-hidden shrink-0">
                                <div className="absolute top-0 left-0 w-1 h-full bg-petal-rose" />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Consulting: <span className="text-petal-rose">{activeChatRequest?.serviceName}</span></p>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeChatRequest?.company?.name || 'Service Provider'}</h3>
                                </div>
                                <button onClick={() => setShowChatModal(false)} className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-petal-rose/10 text-gray-400 hover:text-petal-rose rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Messages Area */}
                            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar space-y-6">
                                {activeChatRequest?.negotiationStatus === 'price_offered' && (
                                    <div className="p-6 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20 text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50" />
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest">Special Hive Offer</p>
                                        <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 italic">₹{activeChatRequest.amount}</p>
                                        <p className="text-[9px] font-bold text-emerald-600/60 mt-2 uppercase tracking-widest">Accept by paying in your bookings hub</p>
                                    </div>
                                )}

                                {activeChatRequest?.status === 'completed' && (
                                    <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-center">
                                        <p className="text-sm font-bold text-emerald-600 italic">"The service is complete. Thank you for using ServiceBee!"</p>
                                    </div>
                                )}

                                {activeChatRequest?.status === 'rejected' && (
                                    <div className="p-6 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-center">
                                        <p className="text-sm font-bold text-rose-500 italic">"This request was not accepted."</p>
                                    </div>
                                )}

                                <div className="space-y-4 pb-4">
                                    {chatMessages.length > 0 ? chatMessages.map((msg, idx) => {
                                        const isMe = msg.senderType === "User";
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-4 rounded-[28px] shadow-sm ${isMe ? 'bg-petal-rose text-white rounded-tr-none' : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white rounded-tl-none'}`}>
                                                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                                    <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-40 ${isMe ? 'text-white' : 'text-gray-500'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="py-12 text-center space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-50">
                                                <MessageCircle className="text-gray-400" size={32} />
                                            </div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Start the buzz...</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Footer / Input */}
                            <div className="p-8 bg-white/50 dark:bg-[#1a1c21] backdrop-blur-2xl border-t border-gray-100 dark:border-white/10 shrink-0">
                                {(activeChatRequest?.status !== 'completed' && activeChatRequest?.status !== 'rejected') ? (
                                    <div className="relative group">
                                        <input
                                            placeholder="Type your message..."
                                            className="w-full h-16 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[28px] pl-8 pr-20 text-sm font-medium text-gray-800 dark:text-white focus:ring-4 focus:ring-petal-rose/10 transition-all outline-none"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            className="absolute right-2 top-2 w-12 h-12 bg-petal-rose text-white rounded-[20px] flex items-center justify-center hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-petal-rose/20 group-hover:shadow-petal-rose/40"
                                        >
                                            <ArrowRight size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center group">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 group-hover:text-petal-rose transition-colors">Conversation Archived</p>
                                        <Button variant="ghost" className="w-full h-14 bg-gray-100 dark:bg-white/5 text-gray-500 font-black uppercase tracking-widest text-xs rounded-[20px] border-none" onClick={() => setShowChatModal(false)}>Back to Hub</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Error Modal */}
            <AnimatePresence>
                {bookingError && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setBookingError(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm bg-white dark:bg-[#1a1c21] rounded-[32px] p-8 shadow-2xl border border-white/10 relative z-10 text-center">
                            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                                <X size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Service Unavailable</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 leading-relaxed italic">
                                {bookingError}
                            </p>
                            <Button onClick={() => setBookingError(null)} className="w-full bg-gray-900 dark:bg-petal-rose text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-none shadow-xl">
                                Try Another Date
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Review Modal */}
            <AnimatePresence>
                {reviewModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setReviewModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-white dark:bg-[#1a1c21] rounded-[48px] p-10 shadow-2xl border border-white/10 relative z-10">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight text-center">Honey Review</h3>
                            <p className="text-gray-500 text-center text-sm font-medium mb-8">How was your experience with <span className="text-petal-rose">{reviewingRequest?.company?.name}</span>?</p>

                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setRating(num)}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${rating >= num ? 'bg-petal-rose text-white shadow-lg shadow-petal-rose/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}
                                        >
                                            <Star size={24} fill={rating >= num ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Your Buzz (Comments)</label>
                                    <textarea
                                        className="w-full rounded-3xl bg-gray-50 dark:bg-white/5 border-none p-6 text-sm font-medium focus:ring-2 focus:ring-petal-rose min-h-[120px] resize-none"
                                        placeholder="Tell the hive about the service..."
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" disabled={reviewLoading} className="w-full bg-petal-rose text-white h-16 rounded-[24px] font-black text-lg border-none hover:opacity-90 transition-all shadow-xl shadow-petal-rose/30 mt-4">
                                    {reviewLoading ? 'Sharing...' : 'Submit Review'}
                                </Button>
                                <button type="button" onClick={() => setReviewModalOpen(false)} className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 hover:text-gray-600 transition-colors">Discard</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
