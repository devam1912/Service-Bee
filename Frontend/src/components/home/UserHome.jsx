import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, Sparkles, ArrowRight, Users, MapPin, Star, MessageSquare, Briefcase, Image, Upload, X } from "lucide-react";
import AIAssistant from "../../components/AIAssistant";

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
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

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
                description: `Ritual Fee for ${bookingData.serviceName}`,
                order_id: payRes.data.orderId,
                handler: async (response) => {
                    try {
                        await axios.post("http://localhost:9876/api/payments/verify", {
                            orderId: payRes.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        alert("Payment Sealed! Your buzz is now official.");
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
            alert(err.response?.data?.message || "Failed to summon the buzz.");
        } finally {
            setBookingLoading(false);
        }
    };

    const handlePayNow = async (reqId, serviceName) => {
        setBookingLoading(true);
        try {
            const token = localStorage.getItem("token");
            const payRes = await axios.post("http://localhost:9876/api/payments/create-order", { requestId: reqId }, { headers: { Authorization: `Bearer ${token}` } });

            const options = {
                key: payRes.data.keyId,
                amount: payRes.data.amount,
                currency: payRes.data.currency,
                name: "Service-Bee Payment",
                description: `Ritual Fee for ${serviceName}`,
                order_id: payRes.data.orderId,
                handler: async (response) => {
                    try {
                        await axios.post("http://localhost:9876/api/payments/verify", {
                            orderId: payRes.data.orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { headers: { Authorization: `Bearer ${token}` } });

                        alert("Payment Sealed! Your buzz is now official.");
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
            alert(err.response?.data?.message || "Failed to trigger payment.");
        } finally {
            setBookingLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c => {
        if (!c.isVerified) return false;
        const term = searchTerm.toLowerCase();
        return c.name?.toLowerCase().includes(term) || c.serviceCategory?.toLowerCase().includes(term);
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-petal-leaf/10 pb-8 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-petal-rose mb-2">
                        <MapPin size={16} />
                        <span className="text-[10px] uppercase font-black tracking-[0.2em]">{user?.city || 'Local Area'}</span>
                    </div>
                    <h2 className="text-4xl font-display font-black text-gray-800 dark:text-white tracking-tight">Bee Marketplace</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Approved providers in your hive</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-petal-muted/30 p-1.5 rounded-2xl">
                    <button
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'book' ? 'bg-white dark:bg-deep-moss text-gray-800 dark:text-petal-rose shadow-md' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('book')}
                    >
                        Marketplace
                    </button>
                    <button
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'my-requests' ? 'bg-white dark:bg-deep-moss text-gray-800 dark:text-petal-rose shadow-md' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('my-requests')}
                    >
                        My Hive
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
                                    placeholder="Search services or providers..."
                                    className="pl-14 h-16 rounded-[24px] bg-white dark:bg-petal-muted/20 border-none shadow-lg focus:ring-2 focus:ring-petal-rose transition-all placeholder:text-gray-400 text-gray-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

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
                                        <p className="text-gray-400 font-display text-xl tracking-tight">No providers found in {user?.city || 'this hive'}.</p>
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
                                            <h3 className="text-2xl font-black mb-8 text-gray-800 dark:text-white tracking-tight">Send a Buzz</h3>
                                            <form onSubmit={handleBook} className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-6">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Target Provider</p>
                                                    <p className="font-bold text-petal-leaf dark:text-petal-rose text-lg">{selectedCompany.name}</p>
                                                </div>
                                                <Input label="Job Title" placeholder="What do you need?" value={bookingData.serviceName} onChange={e => setBookingData({ ...bookingData, serviceName: e.target.value })} required className="bg-white dark:bg-transparent" />
                                                <Input label="Buzz Date" type="date" value={bookingData.bookingDate} onChange={e => setBookingData({ ...bookingData, bookingDate: e.target.value })} required min={today} className="bg-white dark:bg-transparent" />

                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Ritual Photo (Optional)</p>
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
                                                    {bookingLoading ? 'Buzzing...' : 'Confirm Buzz'}
                                                </Button>
                                            </form>
                                        </Card>

                                        {/* Reviews Section */}
                                        <Card className="p-8 bg-white dark:bg-petal-muted/40 border-none shadow-2xl rounded-[40px]">
                                            <div className="flex items-center gap-2 mb-6">
                                                <MessageSquare className="text-petal-rose" size={20} />
                                                <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Hive Reviews</h3>
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
                                                )) : <p className="text-center py-6 text-gray-400 text-sm italic">No reviews in the hive yet.</p>}
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
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Choose a service provider from the marketplace to see their reviews and send a buzz.</p>
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
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>
                            <h4 className="text-2xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">{req.serviceName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">Scheduled for {new Date(req.bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            <div className="pt-6 border-t border-gray-100 dark:border-petal-leaf/10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-petal-rose tracking-[0.2em]">
                                    {req.paymentStatus === 'paid' ? 'Ritual Paid' : 'Unpaid Summon'}
                                </span>
                                {req.paymentStatus !== 'paid' ? (
                                    <Button
                                        onClick={() => handlePayNow(req._id, req.serviceName)}
                                        className="bg-petal-rose text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none hover:opacity-90 shadow-lg shadow-petal-rose/20 transition-all active:scale-95"
                                    >
                                        Pay Now
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                        <span className="text-[10px] font-black text-gray-300 uppercase">Details</span>
                                        <ArrowRight size={18} className="text-gray-300" />
                                    </div>
                                )}
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full py-28 text-center bg-gray-50/50 dark:bg-petal-muted/10 rounded-[48px] border-2 border-dashed border-gray-100 dark:border-petal-leaf/10">
                            <Calendar className="mx-auto mb-6 text-gray-200" size={64} />
                            <p className="font-display text-2xl font-black text-gray-400 tracking-tight">Your hive is quiet.</p>
                            <Button variant="ghost" className="mt-6 text-petal-rose font-black uppercase tracking-widest text-xs" onClick={() => setActiveTab('book')}>Start Buzzing</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
