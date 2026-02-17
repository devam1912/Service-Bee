import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { motion } from "framer-motion";
import { Calendar, Search, Ghost } from "lucide-react";

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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [companiesRes, requestsRes] = await Promise.all([
                axios.get("http://localhost:9876/api/companies", config),
                axios.get("http://localhost:9876/api/requests", config)
            ]); // Assuming there's a GET /api/requests for user to see their own requests

            console.log("Companies API Response:", companiesRes.data);
            console.log("Requests API Response:", requestsRes.data);

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

            await axios.post("http://localhost:9876/api/requests", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("Service requested successfully! The spiders remain calm... for now.");
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
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h2 className="text-3xl font-spooky text-white">My Crypt</h2>
                <div className="flex gap-4">
                    <Button variant={activeTab === 'book' ? 'primary' : 'ghost'} onClick={() => setActiveTab('book')}>
                        Book Service
                    </Button>
                    <Button variant={activeTab === 'my-requests' ? 'primary' : 'ghost'} onClick={() => setActiveTab('my-requests')}>
                        My Requests
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-spooky-purple animate-pulse">Summoning data form the abyss...</div>
            ) : activeTab === "book" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Company List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search for service providers..."
                                className="w-full bg-spooky-card border border-gray-700 rounded-lg py-3 pl-10 text-white focus:border-spooky-purple focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredCompanies.map(company => (
                                <Card
                                    key={company._id}
                                    className={`cursor-pointer transition-all ${selectedCompany?._id === company._id ? 'border-spooky-purple ring-1 ring-spooky-purple bg-spooky-purple/10' : ''}`}
                                    onClick={() => setSelectedCompany(company)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{company.name}</h3>
                                            <p className="text-spooky-orange text-sm">{company.serviceCategory}</p>
                                            <p className="text-gray-400 text-xs mt-1">{company.city}</p>
                                        </div>
                                        {company.isVerified && <span className="bg-spooky-green/20 text-spooky-green text-xs px-2 py-1 rounded-full">Verified</span>}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {company.services?.slice(0, 3).map((s, i) => (
                                            <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{s}</span>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div>
                        <Card className="sticky top-24">
                            <h3 className="text-xl font-spooky mb-4">Summon Service</h3>
                            {!selectedCompany ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Ghost className="mx-auto mb-2 opacity-50" />
                                    <p>Select a provider from the list to proceed...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleBook} className="space-y-4">
                                    <div className="bg-spooky-purple/10 p-3 rounded-lg border border-spooky-purple/30 mb-4">
                                        <p className="text-sm text-gray-300">Summoning: <span className="text-white font-bold">{selectedCompany.name}</span></p>
                                    </div>

                                    <Input
                                        label="Service Name"
                                        name="serviceName"
                                        placeholder="What do you need?"
                                        value={bookingData.serviceName}
                                        onChange={(e) => setBookingData({ ...bookingData, serviceName: e.target.value })}
                                        required
                                    />

                                    <Input
                                        label="Date"
                                        type="date"
                                        name="bookingDate"
                                        value={bookingData.bookingDate}
                                        onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                                        required
                                    />

                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-400 text-sm font-medium ml-1">Notes</label>
                                        <textarea
                                            className="px-4 py-2 rounded-lg bg-spooky-card border border-gray-700 text-gray-200 focus:outline-none focus:border-spooky-purple focus:ring-1 focus:ring-spooky-purple transition-all duration-300 placeholder-gray-600 min-h-[100px]"
                                            placeholder="Any special hexes or instructions?"
                                            value={bookingData.userNote}
                                            onChange={(e) => setBookingData({ ...bookingData, userNote: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-400 text-sm font-medium ml-1">Photo Evidence (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-spooky-purple file:text-white hover:file:bg-spooky-purple/80"
                                            onChange={(e) => setBookingData({ ...bookingData, file: e.target.files[0] })}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={bookingLoading}>
                                        {bookingLoading ? "Casting Spell..." : "Book Now"}
                                    </Button>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <p className="font-spooky text-2xl">No open rituals found.</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <Card key={req._id}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white text-lg">{req.serviceName}</h4>
                                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold 
                                ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                            req.status === 'accepted' ? 'bg-blue-500/20 text-blue-500' :
                                                req.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                    'bg-red-500/20 text-red-500'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">Provider: <span className="text-spooky-purple">{req.company?.name || "Unknown"}</span></p>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <Calendar size={14} />
                                    {new Date(req.bookingDate).toLocaleDateString()}
                                </div>

                                {req.userNote && (
                                    <p className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded mt-2">
                                        "{req.userNote}"
                                    </p>
                                )}

                                {req.attachments?.length > 0 && (
                                    <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                        {req.attachments.map((att, idx) => (
                                            <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={att.url}
                                                    alt="Evidence"
                                                    className="w-16 h-16 object-cover rounded border border-gray-700 hover:border-spooky-purple transition-colors"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
