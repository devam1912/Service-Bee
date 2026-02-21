import { useState, useEffect } from "react";
import axios from "axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Shield, Users, Briefcase, Activity, TrendingUp, X, Check, Search, DollarSign, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHome() {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab !== "overview") {
            fetchTabData(activeTab);
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get("http://localhost:9876/api/admin/stats", config);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTabData = async (tab) => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`http://localhost:9876/api/admin/${tab}`, config);
            if (tab === "users") setUsers(res.data);
            if (tab === "companies") setCompanies(res.data);
            if (tab === "requests") setRequests(res.data);
        } catch (err) {
            console.error(`Failed to fetch ${tab}`, err);
        }
    };

    const handleVerify = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:9876/api/admin/companies/${id}/verify`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchStats();
            if (activeTab === "companies") fetchTabData("companies");
        } catch (err) {
            console.error(err);
        }
    };

    const StatCard = ({ label, value, icon: Icon, color, isCurrency }) => (
        <Card className="p-8 flex items-center gap-6 bg-white dark:bg-petal-muted/20 border-none shadow-xl rounded-[32px]">
            <div className={`p-5 rounded-2xl ${color} bg-opacity-10`}>
                <Icon size={28} className={color} />
            </div>
            <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</p>
                <p className={`text-3xl font-black ${isCurrency && label === 'Profit' ? 'text-emerald-500' : 'text-gray-800 dark:text-white'}`}>
                    {isCurrency ? `₹${value}` : value}
                </p>
            </div>
        </Card>
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 py-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-100 dark:border-petal-leaf/10 pb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-petal-rose/10 p-4 rounded-[24px] shadow-lg shadow-petal-rose/10">
                        <Shield className="text-petal-rose" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-black text-gray-800 dark:text-white tracking-tight">Hive <span className="text-petal-rose italic">Guardian</span></h1>
                        <p className="text-gray-500 font-medium text-sm">Strategic Oversight Dashboard</p>
                    </div>
                </div>

                <div className="flex bg-gray-100 dark:bg-petal-muted/30 p-1.5 rounded-2xl overflow-x-auto max-w-full">
                    {["overview", "users", "companies", "requests"].map((tab) => (
                        <button
                            key={tab}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-deep-moss text-gray-800 dark:text-petal-rose shadow-md' : 'text-gray-400'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <StatCard label="Members" value={stats.users || 0} icon={Users} color="text-blue-500" />
                            <StatCard label="Bees" value={stats.companies || 0} icon={Briefcase} color="text-petal-rose" />
                            <StatCard label="Pending" value={stats.pending || 0} icon={Activity} color="text-orange-500" />
                            <StatCard label="Revenue" value={stats.revenue || 0} icon={DollarSign} color="text-indigo-500" isCurrency />
                            <StatCard label="Profit" value={stats.profit || 0} icon={TrendingUp} color="text-emerald-500" isCurrency />
                        </div>

                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Pending Verification</h2>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-petal-rose">{stats.pending || 0} Bees waiting</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {companies.filter(c => !c.isVerified).slice(0, 6).map(c => (
                                    <Card key={c._id} className="p-8 bg-white dark:bg-petal-muted/20 border-none shadow-xl rounded-[32px] group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-gray-50 dark:bg-petal-muted/30 rounded-2xl group-hover:rotate-6 transition-transform">
                                                <Briefcase className="text-gray-400" size={24} />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleVerify(c._id)} className="bg-petal-leaf text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none hover:opacity-90">Verify</Button>
                                            </div>
                                        </div>
                                        <h3 className="font-black text-xl text-gray-800 dark:text-white mb-1">{c.name}</h3>
                                        <p className="text-xs text-gray-500 font-medium mb-6 uppercase tracking-wider">{c.serviceCategory} • {c.city}</p>
                                        <div className="pt-6 border-t border-gray-100 dark:border-petal-leaf/10 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-petal-rose uppercase tracking-[0.2em]">New Applicant</span>
                                        </div>
                                    </Card>
                                ))}
                                {stats.pending === 0 && (
                                    <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-petal-muted/10 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-petal-leaf/10">
                                        <Check size={48} className="mx-auto mb-4 text-emerald-500/20" />
                                        <p className="text-gray-400 font-medium italic">Your hive is currently verified and safe.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === "users" && (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-petal-muted/20 rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-petal-leaf/10"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-deep-moss border-b border-gray-100 dark:border-petal-leaf/10">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em]">Name</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em]">Email</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em]">City</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-[0.2em]">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b border-gray-50 dark:border-petal-leaf/5 hover:bg-gray-50 dark:hover:bg-petal-muted/30 transition-colors">
                                        <td className="px-8 py-6 font-black text-gray-800 dark:text-white">{u.name}</td>
                                        <td className="px-8 py-6 text-gray-500 dark:text-gray-400 font-medium">{u.email}</td>
                                        <td className="px-8 py-6 text-petal-rose font-black text-xs uppercase">{u.city}</td>
                                        <td className="px-8 py-6 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {activeTab === "companies" && (
                    <motion.div
                        key="companies"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-petal-muted/20 rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-petal-leaf/10"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-deep-moss border-b border-gray-100 dark:border-petal-leaf/10">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Business Name</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">City</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(c => (
                                    <tr key={c._id} className="border-b border-gray-50 dark:border-petal-leaf/5 hover:bg-gray-50 dark:hover:bg-petal-muted/30 transition-colors">
                                        <td className="px-8 py-6 font-black text-gray-800 dark:text-white">{c.name}</td>
                                        <td className="px-8 py-6 text-gray-500 dark:text-gray-400 font-medium">{c.serviceCategory}</td>
                                        <td className="px-8 py-6 text-gray-800 dark:text-white font-bold text-xs uppercase">{c.city}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {c.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {!c.isVerified && <Button onClick={() => handleVerify(c._id)} className="bg-petal-leaf text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase border-none">Verify</Button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {activeTab === "requests" && (
                    <motion.div
                        key="requests"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-petal-muted/20 rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-petal-leaf/10"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-deep-moss border-b border-gray-100 dark:border-petal-leaf/10">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Service</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">User</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Provider</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Value</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r._id} className="border-b border-gray-50 dark:border-petal-leaf/5 hover:bg-gray-50 dark:hover:bg-petal-muted/30 transition-colors">
                                        <td className="px-8 py-6 font-black text-gray-800 dark:text-white">{r.serviceName}</td>
                                        <td className="px-8 py-6 text-gray-500 dark:text-gray-400 font-medium">{r.user?.name}</td>
                                        <td className="px-8 py-6 text-petal-rose font-black text-xs uppercase">{r.company?.name}</td>
                                        <td className="px-8 py-6 font-bold text-gray-800 dark:text-white">₹{r.price || 0}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
