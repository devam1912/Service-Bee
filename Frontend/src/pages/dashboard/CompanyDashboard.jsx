import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Calendar, User, Clock, CheckCircle, XCircle, PlayCircle } from "lucide-react";

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
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:9876/api/requests/company", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.requests || [];
            setRequests(data);

            // Calculate stats
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
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:9876/api/requests/${requestId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update UI optimistically or refetch
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-gray-800 pb-4">
                <h2 className="text-3xl font-spooky text-white">Lair Management</h2>
                <p className="text-gray-400">Manage your swarm's tasks...</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-white">{stats.pending}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
                        <PlayCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">In Progress</p>
                        <p className="text-2xl font-bold text-white">{stats.accepted}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Completed</p>
                        <p className="text-2xl font-bold text-white">{stats.completed}</p>
                    </div>
                </Card>
            </div>

            <div>
                <h3 className="text-xl font-spooky mb-4 text-white">Incoming Briefs</h3>
                {loading ? (
                    <div className="text-center text-spooky-purple animate-pulse">Consulting the oracle...</div>
                ) : requests.length === 0 ? (
                    <div className="bg-spooky-card rounded-xl p-10 text-center border border-gray-800">
                        <p className="text-gray-500">No requests yet. The silence is deafening.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {requests.map(req => (
                            <Card key={req._id}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-white text-lg">{req.serviceName}</h4>
                                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold 
                                        ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    req.status === 'accepted' ? 'bg-blue-500/20 text-blue-500' :
                                                        req.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                            'bg-red-500/20 text-red-500'}`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <User size={14} />
                                                <span>{req.user?.name || "Unknown User"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                <span>{new Date(req.bookingDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {req.userNote && (
                                            <div className="bg-gray-900/50 p-3 rounded text-sm text-gray-300 max-w-2xl">
                                                <span className="text-gray-500 text-xs block mb-1">User Note:</span>
                                                "{req.userNote}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    className="bg-green-600 hover:bg-green-700 border-green-600 shadow-none !py-1"
                                                    onClick={() => updateStatus(req._id, 'accepted')}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-red-500 text-red-500 hover:bg-red-500 !py-1"
                                                    onClick={() => updateStatus(req._id, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}

                                        {req.status === 'accepted' && (
                                            <Button
                                                variant="primary"
                                                className="!py-1"
                                                onClick={() => updateStatus(req._id, 'completed')}
                                            >
                                                Mark Completed
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
