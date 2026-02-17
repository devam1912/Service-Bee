import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";
import { Skull, Scroll } from "lucide-react";

export default function ChatDisclaimer() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkTerms = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get("http://localhost:9876/api/terms/status", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.data.termsAccepted) {
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Error checking terms:", err);
            }
        };
        checkTerms();
    }, []);

    const handleAccept = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:9876/api/terms/accept", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.setItem("chat_disclaimer_accepted", "true");
            setIsOpen(false);
        } catch (err) {
            console.error("Error accepting terms:", err);
            alert("Failed to accept terms. Please try again.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-gray-900 border border-spooky-purple rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.3)] max-w-md w-full p-6 relative overflow-hidden"
                    >
                        {/* Spooky background effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-spooky-purple to-transparent opacity-50"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-spooky-purple/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-spooky-orange/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700 shadow-inner">
                                <Scroll className="text-spooky-orange w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-spooky text-white mb-2">Soul Contract</h2>

                            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left border border-gray-700">
                                <p className="text-gray-300 text-sm mb-3">
                                    By entering this spirited realm, you agree to the following covenant:
                                </p>
                                <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
                                    <li>Respect all entities, living or otherwise.</li>
                                    <li>Refrain from vulgar, hateful, or harmonious speech.</li>
                                    <li>Do not spam or flood the connection.</li>
                                </ul>
                                <p className="text-xs text-gray-500 mt-4 italic">
                                    Violation of these terms may result in banishment to the void.
                                </p>
                            </div>

                            <Button
                                onClick={handleAccept}
                                variant="primary"
                                className="w-full justify-center group"
                            >
                                <Skull className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                                I Bind My Soul to These Terms
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
