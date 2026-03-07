import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Calendar, User, Clock, CheckCircle, XCircle, PlayCircle, BarChart3, Package } from "lucide-react";

export default function CompanyDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0 });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get("/api/requests/company");
            const data = res.data.requests || [];
            setRequests(data);

            const newStats = { pending: 0, accepted: 0, completed: 0 };
            data.forEach(req => {
                if (req.status === 'pending') newStats.pending++;
                else if (req.status === 'accepted') newStats.accepted++;
                else if (req.status === 'completed') newStats.completed++;
            });
            setStats(newStats);

        } catch (err) {
            console.error("Error fetching requests", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (requestId, newStatus) => {
        try {
            await api.patch(`/api/requests/${requestId}/status`,
                { status: newStatus }
            );
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status.");
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-petal-leaf dark:text-white tracking-tighter">
                        Company <span className="text-petal-rose italic">Hive</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your service growth</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard icon={Users} label="Total Clients" value="124" />
                <StatCard icon={Activity} label="Efficiency" value="98%" />
                <StatCard icon={Briefcase} label="Hive Revenue" value="₹12.4k" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-6 p-8 border-none bg-amber-50 dark:bg-amber-900/10 shadow-sm border-l-4 border-l-amber-400 rounded-[40px]">
                    <div className="p-4 bg-white dark:bg-deep-moss rounded-2xl text-amber-500 shadow-sm">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Incoming</p>
                        <p className="text-4xl font-display font-black text-petal-leaf dark:text-white">{stats.pending}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 p-8 border-none bg-petal-rose/5 dark:bg-petal-rose/10 shadow-sm border-l-4 border-l-petal-rose rounded-[40px]">
                    <div className="p-4 bg-white dark:bg-deep-moss rounded-2xl text-petal-rose shadow-sm">
                        <PlayCircle size={28} />
                    </div>
                    <div>
                        <p className="text-petal-rose dark:text-petal-rose/80 text-[10px] font-black uppercase tracking-widest mb-1">In Progress</p>
                        <p className="text-4xl font-display font-black text-petal-leaf dark:text-white">{stats.accepted}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 p-8 border-none bg-emerald-50 dark:bg-emerald-900/10 shadow-sm border-l-4 border-l-emerald-400 rounded-[40px]">
                    <div className="p-4 bg-white dark:bg-deep-moss rounded-2xl text-emerald-500 shadow-sm">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
                        <p className="text-4xl font-display font-black text-petal-leaf dark:text-white">{stats.completed}</p>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-petal-leaf/10 pb-4">
                    <Package className="text-petal-leaf" size={24} />
                    <h3 className="text-2xl font-display font-black text-petal-leaf dark:text-white tracking-tight">Active Assignments</h3>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-100 dark:bg-petal-muted/20 rounded-[40px] animate-pulse" />
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-petal-muted/10 rounded-[48px] p-20 text-center border-2 border-dashed border-gray-100 dark:border-petal-leaf/10">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400 font-display text-xl px-4 tracking-tight">The hive is quiet. New buzzes will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(req => (
                            <Card key={req._id} className="group p-0 border-none bg-white dark:bg-petal-muted/20 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col rounded-[40px]">
                                <div className="p-8 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-petal-rose/10 px-3 py-1 rounded-full border border-petal-rose/20">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-petal-rose">Fresh Growth</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest
                                            ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                req.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                    req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-rose-100 text-rose-700'}`}>
                                            {req.status}
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-display font-black text-petal-leaf dark:text-white mb-4 leading-tight tracking-tight">{req.serviceName}</h4>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                            <div className="bg-petal-leaf/10 p-2 rounded-xl">
                                                <User size={14} className="text-petal-leaf" />
                                            </div>
                                            <span>{req.user?.name || "Hive Member"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                            <div className="bg-petal-rose/10 p-2 rounded-xl">
                                                <Calendar size={14} className="text-petal-rose" />
                                            </div>
                                            <span>{new Date(req.bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                        </div>
                                    </div>

                                    {req.userNote && (
                                        <div className="bg-gray-50 dark:bg-petal-muted/30 p-5 rounded-3xl text-sm text-gray-500 italic relative">
                                            <div className="absolute top-0 left-6 -translate-y-1/2 bg-white dark:bg-petal-muted px-3 rounded-full border border-petal-lead/10">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-petal-leaf">Notes</span>
                                            </div>
                                            "{req.userNote}"
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-petal-muted/40 border-t border-gray-100 dark:border-petal-leaf/5 flex gap-3">
                                    {req.status === 'pending' && (
                                        <>
                                            <Button
                                                variant="primary"
                                                className="flex-1 !py-3.5 bg-petal-leaf border-none text-white hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                                onClick={() => updateStatus(req._id, 'accepted')}
                                            >
                                                Cultivate
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="flex-1 !py-3.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                                onClick={() => updateStatus(req._id, 'rejected')}
                                            >
                                                Prune
                                            </Button>
                                        </>
                                    )}

                                    {req.status === 'accepted' && (
                                        <Button
                                            variant="primary"
                                            className="w-full !py-4 bg-petal-rose hover:bg-petal-rose/90 border-none text-white shadow-2xl shadow-petal-rose/20 rounded-2xl font-black uppercase tracking-widest text-xs"
                                            onClick={() => updateStatus(req._id, 'completed')}
                                        >
                                            Complete Job
                                        </Button>
                                    )}

                                    {req.status === 'completed' && (
                                        <div className="w-full text-center py-4 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                            Successfully Delivered
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

