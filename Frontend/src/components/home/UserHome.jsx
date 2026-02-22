import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, Sparkles, ArrowRight, Users, MapPin, Star, MessageSquare, Briefcase, Image, Upload, X, MessageCircle, Banknote, ChevronRight, Zap, Mic } from "lucide-react";
import AIAssistant from "../../components/AIAssistant";
import { cn } from "../../lib/utils";

export default function UserHome() {
    const { user } = useAuth();
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
    const [newMessage, setNewMessage] = useState("");
    const [bookingError, setBookingError] = useState(null);
    const today = new Date().toLocaleDateString('en-CA');

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice search is not supported in your browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
        };
        recognition.start();
    };

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

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const cityQuery = user?.city ? `?city=${user.city}` : '';
            const [companiesRes, requestsRes] = await Promise.all([
                axios.get(`http://localhost:9876/api/companies${cityQuery}`, config),
                axios.get("http://localhost:9876/api/requests", config)
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
            const res = await axios.get(`http://localhost:9876/api/reviews/company/${companyId}`);
            setReviews(res.data || []);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
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
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("companyId", selectedCompany._id);
            formData.append("serviceName", bookingData.serviceName);
            formData.append("bookingDate", bookingData.bookingDate);
            formData.append("userNote", bookingData.userNote);

            if (selectedFile) {
                formData.append("attachments", selectedFile);
            }

            const reqRes = await axios.post("http://localhost:9876/api/requests", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            const requestId = reqRes.data.request._id;

            // Trigger Razorpay Payment
            const payRes = await axios.post("http://localhost:9876/api/payments/create-order", { requestId }, { headers: { Authorization: `Bearer ${token}` } });

            const options = {
                key: payRes.data.keyId,
                amount: payRes.data.amount,
                currency: payRes.data.currency,
                name: "Service-Bee Payment",
                description: `Service Fee for ${bookingData.serviceName}`,
                order_id: payRes.data.orderId,
                handler: async (response) => {
                    try {
                        await axios.post("http://localhost:9876/api/payments/verify", {
                            orderId: payRes.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { Authorization: `Bearer ${token}` } });

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
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:9876/api/payments/create-order", { requestId }, { headers: { Authorization: `Bearer ${token}` } });

            const options = {
                key: res.data.keyId,
                amount: res.data.amount,
                currency: res.data.currency,
                name: "Service-Bee Payment",
                description: `Service Fee for ${serviceName}`,
                order_id: res.data.orderId,
                handler: async (response) => {
                    try {
                        await axios.post("http://localhost:9876/api/payments/verify", {
                            orderId: res.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { Authorization: `Bearer ${token}` } });

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
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || activeChatRequest?.status === 'completed') return;
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:9876/api/requests/${activeChatRequest._id}/messages`, { text: newMessage }, { headers: { Authorization: `Bearer ${token}` } });
            setNewMessage("");
            // In a real app, socket would update this, but for now let's hope it feels snappy
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send message.");
        }
    };


    const filteredCompanies = companies.filter(c => {
        if (!c.isVerified) return false;
        const term = searchTerm.toLowerCase();
        return c.name?.toLowerCase().includes(term) || c.serviceCategory?.toLowerCase().includes(term);
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
                <div className="space-y-12">
                    <AIAssistant />
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
                                <button
                                    onClick={handleVoiceSearch}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-petal-rose transition-colors"
                                    type="button"
                                >
                                    <Mic size={20} />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 ml-4 font-bold italic">(AI will get the relatable service from your search)</p>

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
                                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-6">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Target Provider</p>
                                                    <p className="font-bold text-petal-leaf dark:text-petal-rose text-lg">{selectedCompany.name}</p>
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
                            <h4 className="text-2xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">{req.serviceName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">Scheduled for {new Date(req.bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
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
                                    <Button variant="ghost" onClick={() => { setActiveChatRequest(req); setShowChatModal(true); }} className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border-none hover:bg-petal-rose/10 transition-colors">
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
                                    {req.paymentStatus === 'paid' && (
                                        <Button onClick={() => openChat(req)} variant="ghost" className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-none">
                                            <MessageCircle size={18} className="text-petal-rose" />
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
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="w-full max-w-lg bg-white dark:bg-[#15171b] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 relative z-10 flex flex-col h-[70vh]">
                            <div className="p-8 bg-petal-rose text-white flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Provider Chat</p>
                                    <h3 className="text-xl font-black">{activeChatRequest?.company?.name || 'Service Provider'}</h3>
                                </div>
                                <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar space-y-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-200/50 dark:border-amber-500/20 text-center">
                                    <p className="text-xs font-bold text-amber-600 uppercase mb-1 tracking-widest">Service Details</p>
                                    <p className="text-sm font-black text-gray-800 dark:text-white italic">"{activeChatRequest?.serviceName}"</p>
                                    {activeChatRequest?.negotiationStatus === 'price_offered' && (
                                        <div className="mt-3 p-3 bg-emerald-500 text-white rounded-xl">
                                            <p className="text-[10px] font-black uppercase">Special Offer Received!</p>
                                            <p className="text-lg font-black">₹{activeChatRequest.amount}</p>
                                            <p className="text-[9px] opacity-80 mt-1">Accept by paying in "My Bookings"</p>
                                        </div>
                                    )}
                                </div>

                                {activeChatRequest?.status === 'completed' && (
                                    <div className="p-6 bg-petal-rose/10 rounded-2xl border border-petal-rose/20 text-center">
                                        <p className="text-sm font-bold text-petal-rose italic">"The service has concluded. Use the review section below to share your experience with the community."</p>
                                    </div>
                                )}

                                <p className="text-center py-10 text-gray-400 text-sm italic">Chat connection established. (System Online)</p>
                            </div>

                            <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-transparent">
                                {activeChatRequest?.status !== 'completed' ? (
                                    <div className="flex gap-3">
                                        <input
                                            placeholder="Type a message..."
                                            className="flex-grow bg-white dark:bg-white/5 border-none rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-petal-rose"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                        />
                                        <Button onClick={sendMessage} className="w-14 h-14 bg-petal-rose text-white rounded-2xl flex items-center justify-center border-none shadow-lg shadow-petal-rose/20">
                                            <ChevronRight size={24} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Button variant="ghost" className="text-petal-rose font-black uppercase tracking-widest text-xs" onClick={() => setShowChatModal(false)}>Close Provider Chat</Button>
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
        </div>
    );
}
