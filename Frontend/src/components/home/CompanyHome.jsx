import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Clock, PlayCircle, CheckCircle, Package, User, Calendar, Users, Activity, Briefcase } from "lucide-react";

export default function CompanyHome() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0 });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:9876/api/requests/company", {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (requestId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:9876/api/requests/${requestId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            fetchRequests();
        } catch (err) {
            alert("Failed.");
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 py-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 dark:border-petal-leaf/10 pb-8">
                <div>
                    <h1 className="text-4xl font-display font-black text-gray-800 dark:text-white tracking-tight">Company <span className="text-petal-rose italic">Hive</span></h1>
                    <p className="text-gray-500 font-medium text-sm">Operation & Growth Oversight</p>
                </div>
                <div className="bg-petal-rose/10 px-4 py-2 rounded-full border border-petal-rose/20">
                    <span className="text-[10px] font-black uppercase text-petal-rose tracking-widest">{user?.city} Bee</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Users} label="Total Clients" value="124" />
                <StatCard icon={Activity} label="Efficiency" value="98%" />
                <StatCard icon={Briefcase} label="Honey Profit" value="₹12.4k" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard color="amber" icon={Clock} label="Incoming Buzz" value={stats.pending} />
                <StatusCard color="petal" icon={PlayCircle} label="Active Jobs" value={stats.accepted} />
                <StatusCard color="emerald" icon={CheckCircle} label="Completed" value={stats.completed} />
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="bg-petal-leaf/10 p-2 rounded-xl"><Package className="text-petal-leaf" size={24} /></div>
                    Active Hive Jobs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.length > 0 ? requests.map(req => (
                        <Card key={req._id} className="p-8 bg-white dark:bg-petal-muted/20 border-none shadow-xl rounded-[32px] hover:shadow-2xl transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-gray-50 dark:bg-petal-muted/30 rounded-2xl group-hover:rotate-6 transition-transform">
                                    <Calendar className="text-gray-400" size={24} />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>
                            <h4 className="text-xl font-black text-gray-800 dark:text-white mb-2">{req.serviceName}</h4>
                            <p className="text-sm text-gray-500 font-medium mb-8">Client: {req.user?.name || 'Hive Member'}</p>

                            <div className="flex gap-2">
                                {req.status === 'pending' && <Button onClick={() => updateStatus(req._id, 'accepted')} className="w-full bg-petal-leaf text-white h-12 rounded-2xl font-black uppercase text-xs">Accept Buzz</Button>}
                                {req.status === 'accepted' && <Button onClick={() => updateStatus(req._id, 'completed')} className="w-full bg-petal-rose text-white h-12 rounded-2xl font-black uppercase text-xs">Finish Job</Button>}
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-petal-muted/10 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-petal-leaf/10">
                            <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400 font-medium italic">No active jobs in your hive queue.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ icon: Icon, label, value }) => (
    <Card className="p-8 flex items-center gap-6 bg-white dark:bg-petal-muted/20 border-none shadow-xl rounded-[32px]">
        <div className="p-4 bg-gray-50 dark:bg-petal-muted/30 rounded-2xl"><Icon size={24} className="text-petal-leaf" /></div>
        <div>
            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{value}</p>
        </div>
    </Card>
);

const StatusCard = ({ color, icon: Icon, label, value }) => (
    <Card className={`p-8 bg-white dark:bg-petal-muted/20 border-none shadow-xl rounded-[32px] border-l-8 ${color === 'amber' ? 'border-amber-400' :
            color === 'petal' ? 'border-petal-rose' :
                'border-emerald-400'
        }`}>
        <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${color === 'amber' ? 'bg-amber-100 text-amber-600' :
                    color === 'petal' ? 'bg-petal-rose/10 text-petal-rose' :
                        'bg-emerald-100 text-emerald-600'
                }`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">{label}</p>
                <p className="text-4xl font-black text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
    </Card>
);
