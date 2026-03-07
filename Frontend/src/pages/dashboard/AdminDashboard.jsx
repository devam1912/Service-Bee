import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { motion } from "framer-motion";
import { Shield, Activity, Briefcase, TrendingUp, X, Users } from "lucide-react";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allCompanies, setAllCompanies] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null); // For detail modals
    const [activeTab, setActiveTab] = useState("pending"); // Default view

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, companiesRes, usersRes, requestsRes] = await Promise.all([
                api.get("/api/admin/stats"),
                api.get("/api/admin/companies"),
                api.get("/api/admin/users"),
                api.get("/api/admin/requests")
            ]);

            const s = statsRes.data;
            setStats([
                { label: "Hive Members", value: s.users, icon: Users, color: "text-blue-500" },
                { label: "Active Bees", value: s.companies, icon: Briefcase, color: "text-petal-rose" },
                { label: "Pending Buzz", value: s.pending, icon: Activity, color: "text-orange-500" },
                { label: "Hive Profit", value: `₹${s.profit}`, icon: TrendingUp, color: "text-petal-leaf" },
            ]);

            setAllCompanies(companiesRes.data || []);
            setAllUsers(usersRes.data || []);
            setAllRequests(requestsRes.data || []);

            // Filter for unverified companies only
            const pending = (companiesRes.data || []).filter(c => !c.isVerified);
            setPendingCompanies(pending);
        } catch (err) {
            console.error("Error fetching admin data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, action) => {
        try {
            if (action === 'verify') {
                await api.patch(`/api/admin/companies/${id}/verify`);
            } else {
                // For 'defer', we could just delete or flag it. For now, let's just log.
                console.log("Company deferred:", id);
            }
            fetchDashboardData(); // Refresh
        } catch (err) {
            console.error("Action failed", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-petal-light dark:bg-deep-moss">
            <div className="flex flex-col items-center gap-4">
                <Activity className="w-12 h-12 text-petal-rose animate-pulse" />
                <p className="text-petal-leaf dark:text-petal-rose font-bold animate-pulse">Hive Control Center Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-petal-light dark:bg-deep-moss p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-petal-rose/10 p-2.5 rounded-2xl">
                                <Shield className="text-petal-rose" size={28} />
                            </div>
                            <h1 className="text-4xl font-display font-black text-petal-leaf dark:text-white tracking-tight">
                                Hive <span className="text-petal-rose">Guardian</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">Administrative oversight for the Service Bee hive</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 bg-white dark:bg-petal-muted/30 p-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-petal-leaf/10"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-petal-rose flex items-center justify-center text-white text-xl font-black shadow-lg shadow-petal-rose/20">
                            {user?.email?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <div>
                            <p className="text-[10px] text-petal-rose font-black uppercase tracking-[0.2em]">Master Guardian</p>
                            <p className="text-sm font-bold dark:text-white">{user?.email}</p>
                        </div>
                    </motion.div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-petal-muted/20 p-6 rounded-[32px]">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-[20px] bg-gray-50 dark:bg-petal-muted/40 ${stat.color}`}>
                                    <stat.icon size={26} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-black dark:text-white tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {["pending", "companies", "users", "requests"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap
                                ${activeTab === tab
                                    ? "bg-petal-leaf text-white shadow-lg shadow-petal-leaf/20"
                                    : "bg-white dark:bg-petal-muted/20 text-gray-500 dark:hover:text-white"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <section>
                    {activeTab === "pending" && (
                        <>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-display font-black dark:text-white tracking-tight">Pending Approval</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">New providers awaiting verification</p>
                                </div>
                                <span className="bg-petal-rose/10 text-petal-rose text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-petal-rose/20">
                                    {pendingCompanies.length} Requiring Attention
                                </span>
                            </div>

                            {pendingCompanies.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center p-20 border-dashed border-2 border-gray-100 dark:border-petal-leaf/20 bg-transparent">
                                    <Briefcase className="w-16 h-16 text-petal-leaf/20 mb-4" />
                                    <p className="text-gray-400 font-bold">The hive is currently stable. No pending buzz.</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {pendingCompanies.map((company) => (
                                        <Card key={company._id} className="border-gray-100 dark:border-petal-leaf/10 bg-white dark:bg-petal-muted/20 rounded-[32px] p-8 shadow-sm">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-xl font-black dark:text-white mb-1">{company.name}</h3>
                                                    <p className="text-gray-500 text-sm font-medium">{company.email}</p>
                                                    <div className="flex gap-2 mt-4">
                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-petal-leaf/10 text-petal-leaf px-3 py-1 rounded-full">
                                                            {company.serviceCategory}
                                                        </span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-petal-muted/40 text-gray-500 dark:text-gray-300 px-3 py-1 rounded-full">
                                                            {company.city}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button onClick={() => setSelectedItem({ type: 'company', ...company })} variant="outline" className="rounded-xl border-gray-100 text-[10px] uppercase font-black tracking-widest">Details</Button>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button onClick={() => handleVerify(company._id, 'defer')} className="flex-1 bg-red-50 text-red-500 border-none rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest">Defer</Button>
                                                <Button onClick={() => handleVerify(company._id, 'verify')} className="flex-1 bg-petal-leaf text-white border-none rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest">Verify Provider</Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "companies" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allCompanies.map((company) => (
                                <Card key={company._id} onClick={() => setSelectedItem({ type: 'company', ...company })} className="cursor-pointer border-none bg-white dark:bg-petal-muted/20 rounded-[32px] p-6 hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${company.isVerified ? 'bg-petal-leaf/10 text-petal-leaf' : 'bg-orange-100 text-orange-500'}`}>
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black dark:text-white tracking-tight">{company.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{company.isVerified ? 'Verified Bee' : 'Pending Approval'}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allUsers.map((u) => (
                                <Card key={u._id} onClick={() => setSelectedItem({ type: 'user', ...u })} className="cursor-pointer border-none bg-white dark:bg-petal-muted/20 rounded-[32px] p-6 hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black dark:text-white tracking-tight">{u.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "requests" && (
                        <div className="space-y-4">
                            {allRequests.map((req) => (
                                <Card key={req._id} onClick={() => setSelectedItem({ type: 'request', ...req })} className="cursor-pointer border-none bg-white dark:bg-petal-muted/20 rounded-[32px] p-6 hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-petal-rose/10 text-petal-rose flex items-center justify-center">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black dark:text-white tracking-tight">{req.title}</h3>
                                            <p className="text-xs text-gray-400 font-medium">User: {req.user?.name} | Provider: {req.company?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                            req.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                                                'bg-orange-100 text-orange-600'
                                            }`}>
                                            {req.status}
                                        </span>
                                        <p className="font-black dark:text-white">₹{req.price || '0'}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deep-moss/80 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-petal-muted/10 border border-petal-leaf/10 w-full max-w-2xl rounded-[40px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-petal-muted/40 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-petal-rose mb-2 block">{selectedItem.type} Details</span>
                            <h2 className="text-4xl font-display font-black dark:text-white tracking-tight">
                                {selectedItem.name || selectedItem.title}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-medium">
                            {selectedItem.type === 'company' && (
                                <>
                                    <DetailItem label="Email" value={selectedItem.email} />
                                    <DetailItem label="City" value={selectedItem.city} />
                                    <DetailItem label="Category" value={selectedItem.serviceCategory} />
                                    <DetailItem label="Status" value={selectedItem.isVerified ? 'Verified' : 'Pending'} />
                                    <DetailItem label="Price" value={`₹${selectedItem.price || '500'}`} />
                                    <DetailItem label="Description" value={selectedItem.description} full />
                                </>
                            )}
                            {selectedItem.type === 'user' && (
                                <>
                                    <DetailItem label="Email" value={selectedItem.email} />
                                    <DetailItem label="City" value={selectedItem.city} />
                                    <DetailItem label="Member Since" value={new Date(selectedItem.createdAt).toLocaleDateString()} />
                                </>
                            )}
                            {selectedItem.type === 'request' && (
                                <>
                                    <DetailItem label="Status" value={selectedItem.status} />
                                    <DetailItem label="Price" value={`₹${selectedItem.price}`} />
                                    <DetailItem label="User" value={selectedItem.user?.name} />
                                    <DetailItem label="Provider" value={selectedItem.company?.name} />
                                    <DetailItem label="Note" value={selectedItem.note} full />
                                    {selectedItem.attachment && (
                                        <div className="col-span-2 mt-4">
                                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-2">Attachment</p>
                                            <img src={selectedItem.attachment} alt="Attachment" className="w-full rounded-2xl border border-gray-100 dark:border-petal-leaf/10" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

const DetailItem = ({ label, value, full }) => (
    <div className={`${full ? 'md:col-span-2' : ''}`}>
        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</p>
        <p className="dark:text-white bg-gray-50 dark:bg-petal-muted/30 p-4 rounded-xl font-bold">{value || 'N/A'}</p>
    </div>
);

