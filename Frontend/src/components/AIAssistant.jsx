import { useState } from "react";
import api from "../utils/api";
import { Search, Sparkles, Send } from "lucide-react";
import { motion } from "framer-motion";
import Card from "./ui/Card";
import Input from "./ui/Input";

const AIAssistant = () => {
    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            const res = await api.post(
                "/api/ai/search",
                { prompt }
            );
            setResult(res.data.suggestion);
        } catch (err) {
            console.error(err);
            setResult("Our Hive wisdom is currently clouded. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-petal-rose/20 bg-white/50 dark:bg-petal-muted/20 backdrop-blur-sm overflow-hidden shadow-xl rounded-[32px]">
            <div className="bg-gradient-to-r from-petal-leaf to-emerald-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Hive Wisdom</h3>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">AI-Powered Insights</p>
                    </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>

            <div className="p-8">
                <form onSubmit={handleSearch} className="relative mb-6">
                    <Input
                        placeholder="Ask the hive for recommendations..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="pr-14 rounded-2xl border-gray-100 dark:border-petal-leaf/10 focus:ring-petal-rose"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-petal-rose text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-petal-rose/20 border-none"
                    >
                        {loading ? <Search className="animate-spin w-5 h-5" /> : <Send size={20} />}
                    </button>
                </form>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-petal-rose/5 border border-petal-rose/20 rounded-[24px] p-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Sparkles size={40} className="text-petal-rose" />
                        </div>
                        <p className="text-petal-leaf dark:text-gray-200 text-sm leading-relaxed font-medium relative z-10 whitespace-pre-wrap italic">
                            "{result}"
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-petal-rose/60 border-t border-petal-rose/10 pt-4">
                            <Sparkles size={12} /> Curated by Hive Wisdom
                        </div>
                    </motion.div>
                )}

                {!result && (
                    <div className="text-center py-6">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                            Ask for specific fixes, cleaning needs, or best providers in our current network
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AIAssistant;
