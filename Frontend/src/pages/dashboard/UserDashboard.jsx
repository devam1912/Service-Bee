import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { motion } from "framer-motion";
import { Calendar, Search, Sparkles } from "lucide-react";
import AIAssistant from "../../components/AIAssistant";

export default function UserDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("book"); // 'book' or 'my-requests'
    const [companies, setCompanies] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Booking Form State
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [bookingData, setBookingData] = useState({
        serviceName: "",
        bookingDate: "",
        userNote: ""
    });
    const [bookingLoading, setBookingLoading] = useState(false);

    // Get today's date in YYYY-MM-DD format for validation
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [companiesRes, requestsRes] = await Promise.all([
                api.get(`/api/companies${user?.city ? `?city=${user.city}` : ''}`),
                api.get("/api/requests")
            ]);

            const companiesData = companiesRes.data.companies || [];
            const requestsData = requestsRes.data.requests || [];

            setCompanies(Array.isArray(companiesData) ? companiesData : []);
            setRequests(Array.isArray(requestsData) ? requestsData : []);
        } catch (err) {
            console.error("Error fetching data", err);
            setCompanies([]);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!selectedCompany) return;

        // Final date validation check before submission
        if (bookingData.bookingDate < today) {
            alert("Please select a current or future date.");
            return;
        }

        setBookingLoading(true);

        try {
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("companyId", selectedCompany._id);
            formData.append("serviceName", bookingData.serviceName);
            formData.append("bookingDate", bookingData.bookingDate);
            formData.append("userNote", bookingData.userNote);
            if (bookingData.file) {
                formData.append("attachments", bookingData.file);
            }

            await api.post("/api/requests", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("Service requested successfully! A provider will fly by soon.");
            setActiveTab("my-requests");
            setBookingData({ serviceName: "", bookingDate: "", userNote: "" });
            setSelectedCompany(null);
            fetchData(); // Refresh requests
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed.");
        } finally {
            setBookingLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c => {
        const term = searchTerm.toLowerCase();
        return (
            c.name?.toLowerCase().includes(term) ||
            c.serviceCategory?.toLowerCase().includes(term) ||
            c.services?.some(s => s.toLowerCase().includes(term))
        );
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-petal-leaf/10 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-display font-black text-petal-leaf dark:text-white tracking-tight">Service Bee Hive</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Manage your services and track your network</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-petal-muted/30 p-1.5 rounded-2xl">
                    <button
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'book' ? 'bg-white dark:bg-deep-moss text-petal-leaf dark:text-petal-rose shadow-md' : 'text-gray-500 hover:text-petal-leaf dark:hover:text-white'}`}
                        onClick={() => setActiveTab('book')}
                    >
                        Find Bees
                    </button>
                    <button
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'my-requests' ? 'bg-white dark:bg-deep-moss text-petal-leaf dark:text-petal-rose shadow-md' : 'text-gray-500 hover:text-petal-leaf dark:hover:text-white'}`}
                        onClick={() => setActiveTab('my-requests')}
                    >
                        My Hive
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-petal-rose animate-pulse">
                    <Sparkles className="mb-4" size={48} />
                    <p className="font-black uppercase tracking-widest text-[10px]">Connecting to the hive...</p>
                </div>
            ) : activeTab === "book" ? (
                <div className="space-y-12">
                    {/* AI Wisdom Section */}
                    <div className="max-w-4xl mx-auto">
                        <AIAssistant />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Provider List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-petal-rose transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search for providers, experts, or categories..."
                                    className="w-full bg-white dark:bg-petal-muted/20 border border-gray-100 dark:border-petal-leaf/10 rounded-2xl py-4 pl-12 pr-4 text-petal-leaf dark:text-white focus:border-petal-rose focus:ring-1 focus:ring-petal-rose focus:outline-none transition-all shadow-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredCompanies.map(company => (
                                    <Card
                                        key={company._id}
                                        className={`cursor-pointer transition-all border-none shadow-sm hover:shadow-xl rounded-[32px] p-6 ${selectedCompany?._id === company._id ? 'ring-2 ring-petal-rose bg-petal-rose/5' : 'bg-white dark:bg-petal-muted/20'}`}
                                        onClick={() => setSelectedCompany(company)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-black text-lg text-petal-leaf dark:text-white tracking-tight">{company.name}</h3>
                                                <p className="text-petal-rose text-[10px] font-black uppercase tracking-[0.2em] mt-1">{company.serviceCategory}</p>
                                                <p className="text-gray-400 text-xs mt-3 flex items-center gap-1.5 font-bold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-petal-leaf/30" /> {company.city}
                                                </p>
                                            </div>
                                            {company.isVerified && <span className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100/50">Vetted</span>}
                                        </div>
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {company.services?.slice(0, 3).map((s, i) => (
                                                <span key={i} className="text-[10px] bg-gray-50 dark:bg-petal-muted/30 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-lg font-bold uppercase tracking-tighter">{s}</span>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Booking Form */}
                        <div className="relative">
                            <Card className="sticky top-24 border-none shadow-2xl bg-white dark:bg-petal-muted/40 p-8 rounded-[40px] backdrop-blur-md">
                                <h3 className="text-2xl font-display font-black mb-8 text-petal-leaf dark:text-white tracking-tight">Send a Buzz</h3>
                                {!selectedCompany ? (
                                    <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-100 dark:border-petal-leaf/10 rounded-[32px]">
                                        <Sparkles className="mx-auto mb-4 opacity-10" size={48} />
                                        <p className="text-xs font-bold uppercase tracking-widest">Select a bee to buzz</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleBook} className="space-y-6">
                                        <div className="bg-petal-rose/10 p-5 rounded-[24px] border border-petal-rose/20 mb-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                                                <Sparkles size={40} className="text-petal-rose" />
                                            </div>
                                            <p className="text-[9px] text-petal-rose font-black uppercase tracking-[0.3em] mb-1">Bee of choice</p>
                                            <p className="text-petal-leaf dark:text-white font-black text-lg">{selectedCompany.name}</p>
                                        </div>

                                        <div className="space-y-5">
                                            <Input
                                                label="Service Requested"
                                                name="serviceName"
                                                placeholder="e.g., Deep Cleaning, AC Repair"
                                                value={bookingData.serviceName}
                                                onChange={(e) => setBookingData({ ...bookingData, serviceName: e.target.value })}
                                                required
                                                className="rounded-xl border-gray-100 dark:border-petal-leaf/10 py-4"
                                            />

                                            <Input
                                                label="Buzz Date"
                                                type="date"
                                                name="bookingDate"
                                                min={today}
                                                value={bookingData.bookingDate}
                                                onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                                                required
                                                className="rounded-xl border-gray-100 dark:border-petal-leaf/10 py-4"
                                            />

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider ml-1 px-1">Buzz Notes</label>
                                                <textarea
                                                    className="px-5 py-4 rounded-[24px] bg-gray-50 dark:bg-petal-muted/30 border border-gray-100 dark:border-petal-leaf/10 text-petal-leaf dark:text-white focus:outline-none focus:border-petal-rose focus:ring-1 focus:ring-petal-rose transition-all placeholder-gray-400 text-sm min-h-[140px] font-medium"
                                                    placeholder="Add your hive notes..."
                                                    value={bookingData.userNote}
                                                    onChange={(e) => setBookingData({ ...bookingData, userNote: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider ml-1 px-1">Visual Evidence</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="text-[10px] text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-petal-rose file:text-white hover:file:bg-petal-leaf transition-all cursor-pointer font-bold"
                                                    onChange={(e) => setBookingData({ ...bookingData, file: e.target.files[0] })}
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-petal-leaf dark:bg-petal-rose text-white dark:text-deep-moss font-black py-5 rounded-[24px] shadow-2xl shadow-petal-rose/20 border-none mt-6 group overflow-hidden relative" disabled={bookingLoading}>
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {bookingLoading ? "Buzzing..." : "Confirm Buzz"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </Button>
                                    </form>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {requests.length === 0 ? (
                        <div className="col-span-full text-center py-28 bg-gray-50/50 dark:bg-petal-muted/10 rounded-[48px] border-2 border-dashed border-gray-100 dark:border-petal-leaf/10">
                            <Calendar className="mx-auto mb-6 text-gray-200" size={64} />
                            <p className="font-display text-2xl font-black text-gray-400 tracking-tight">Your hive is quiet</p>
                            <Button variant="ghost" className="mt-6 text-petal-rose font-black uppercase tracking-widest text-xs" onClick={() => setActiveTab('book')}>Start Buzzing</Button>
                        </div>
                    ) : (
                        requests.map(req => (
                            <Card key={req._id} className="border-none shadow-sm hover:shadow-2xl transition-all bg-white dark:bg-petal-muted/20 p-7 rounded-[40px] overflow-hidden group">
                                <div className="flex justify-between items-start mb-6">
                                    <h4 className="font-black text-xl text-petal-leaf dark:text-white leading-tight tracking-tight group-hover:text-petal-rose transition-colors">{req.serviceName}</h4>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                                    ${req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            req.status === 'accepted' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                req.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-petal-leaf/10 p-2 rounded-xl">
                                            <Users size={16} className="text-petal-leaf" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Provider</p>
                                            <p className="text-sm font-bold text-petal-leaf dark:text-white">{req.company?.name || "Assigning..."}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="bg-petal-rose/10 p-2 rounded-xl">
                                            <Calendar size={16} className="text-petal-rose" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Scheduled Date</p>
                                            <p className="text-sm font-bold text-petal-leaf dark:text-white">{new Date(req.bookingDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                        </div>
                                    </div>

                                    {req.userNote && (
                                        <div className="bg-gray-50 dark:bg-petal-muted/30 p-4 rounded-2xl relative mt-4">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <Sparkles size={16} className="text-petal-rose" />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">
                                                "{req.userNote}"
                                            </p>
                                        </div>
                                    )}

                                    {req.attachments?.length > 0 && (
                                        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                            {req.attachments.map((att, idx) => (
                                                <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                                    <img
                                                        src={att.url}
                                                        alt="Attachment"
                                                        className="w-16 h-16 object-cover rounded-2xl border-2 border-transparent hover:border-petal-rose transition-all shadow-sm"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
