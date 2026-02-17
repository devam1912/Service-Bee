import { useState, useEffect } from "react";
import axios from "axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Check, X, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
    const [companies, setCompanies] = useState([]);
    const { user } = useAuth();

    // Dummy companies for visual if no API yet
    const [dummyCompanies] = useState([
        { _id: "1", name: "Spooky Cleaners", email: "clean@spooky.com", isVerified: false },
        { _id: "2", name: "Haunted Plumbers", email: "pipes@doom.com", isVerified: true },
    ]);

    useEffect(() => {
        // Fetch companies - needing a route for this
        // For now we will mock it or use an existing route if available
        const fetchCompanies = async () => {
            try {
                // Assuming there is an endpoint to get all companies for admin
                // If not, we might need to create one, but for now let's see if we can render
            } catch (err) {
                console.error(err);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-spooky-dark p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-spooky text-white mb-2 flex items-center gap-3">
                            <Shield className="text-spooky-purple" /> Overlord Dashboard
                        </h1>
                        <p className="text-gray-400">Manage the hive and banish the unworthy...</p>
                    </div>
                    <div className="text-right">
                        <p className="text-spooky-orange text-sm font-bold">LOGGED IN AS</p>
                        <p className="text-white text-xl">{user?.email}</p>
                    </div>
                </header>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">Pending Verifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Using dummy data for now as placeholders until we confirm API */}
                        {dummyCompanies.map((company) => (
                            <Card key={company._id} className="hover:border-spooky-purple transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{company.name}</h3>
                                        <p className="text-gray-400 text-sm">{company.email}</p>
                                    </div>
                                    {company.isVerified ? (
                                        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs border border-green-500/20">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs border border-yellow-500/20">
                                            Pending
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <Button variant="outline" className="flex-1 text-red-400 border-red-400/20 hover:bg-red-500/10">
                                        <X size={16} className="mr-2" /> Reject
                                    </Button>
                                    <Button className="flex-1 bg-spooky-purple hover:bg-spooky-purple/80">
                                        <Check size={16} className="mr-2" /> Verify
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
