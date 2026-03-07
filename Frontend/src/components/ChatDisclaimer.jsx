import { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";
import { ShieldCheck, FileText, Check } from "lucide-react";

export default function ChatDisclaimer() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkTerms = async () => {
            try {
                const res = await api.get("/api/terms/status");

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
            await api.post("/api/terms/accept", {});
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bee-accent/80 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="bg-white dark:bg-bee-muted border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-2xl max-w-lg w-full p-10 relative overflow-hidden"
                    >
                        {/* Bee background effects */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-bee-yellow to-transparent opacity-50"></div>
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-bee-yellow/5 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <div className="mx-auto w-20 h-20 bg-bee-yellow/10 rounded-[28px] flex items-center justify-center mb-8 border border-bee-yellow/20">
                                <ShieldCheck className="text-bee-yellow w-10 h-10" />
                            </div>

                            <h2 className="text-3xl font-display font-black text-bee-accent dark:text-white mb-3 tracking-tight">Community Standards</h2>
                            <p className="text-gray-500 font-medium mb-8">Please review our guidelines to ensure a safe and productive environment for all members.</p>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[32px] p-8 mb-10 text-left border border-gray-100 dark:border-gray-800">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-bee-yellow mb-4">The Hive Covenant</h4>
                                <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-4 font-medium">
                                    <li className="flex gap-3">
                                        <Check size={16} className="text-bee-yellow flex-shrink-0 mt-0.5" />
                                        <span>Maintain professional and respectful conduct at all times.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <Check size={16} className="text-bee-yellow flex-shrink-0 mt-0.5" />
                                        <span>Protect your privacy and the privacy of other members.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <Check size={16} className="text-bee-yellow flex-shrink-0 mt-0.5" />
                                        <span>Use the platform only for legitimate service-related communication.</span>
                                    </li>
                                </ul>
                            </div>

                            <Button
                                onClick={handleAccept}
                                variant="primary"
                                className="w-full justify-center !py-5 rounded-2xl shadow-bee-yellow/20 text-lg group"
                            >
                                <Check className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />
                                Accept and Continue
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

