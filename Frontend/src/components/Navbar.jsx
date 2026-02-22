import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import { motion } from "framer-motion";
import { Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { useState } from "react";
import BeeLogo from "./ui/BeeLogo";
import { cn } from "../lib/utils";
import UserPremiumModal from "./UserPremiumModal";

export default function Navbar({ onOpenPremium }) {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white/80 dark:bg-deep-moss/80 backdrop-blur-xl border-b border-gray-100 dark:border-petal-leaf/20 sticky top-0 z-[50]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-petal-rose/10 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                            <BeeLogo className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-display font-black tracking-tighter">
                            <span className="text-petal-moss dark:text-white">Service</span> <span className="text-petal-rose">Bee</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => document.documentElement.classList.toggle('dark')}
                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-petal-muted/30 text-gray-500 hover:text-petal-rose transition-all"
                        >
                            <Sun className="w-5 h-5 dark:hidden" />
                            <Moon className="w-5 h-5 hidden dark:block" />
                        </button>

                        <Link to="/" className="text-sm font-bold text-gray-500 dark:text-gray-300 hover:text-petal-leaf dark:hover:text-petal-rose transition-colors">
                            Service Hub
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-100 dark:border-petal-leaf/20">
                                <div className="flex flex-col items-end">
                                    {user.role === 'user' && (
                                        user.isPremium ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full mb-1">
                                                <Sparkles size={8} fill="currentColor" /> Premium
                                            </span>
                                        ) : (
                                            <button
                                                onClick={onOpenPremium}
                                                className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 hover:text-amber-600 transition-colors mb-1 border border-amber-500/30 px-2 py-0.5 rounded-full"
                                            >
                                                Go Premium
                                            </button>
                                        )
                                    )}
                                    {user.role === 'company' && (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-petal-rose">
                                            Service Provider
                                        </span>
                                    )}
                                    <span className={cn(
                                        "text-sm font-bold text-gray-800 dark:text-gray-100",
                                        user.role === 'admin' && "uppercase tracking-tighter"
                                    )}>
                                        {user.name || user.email?.split('@')[0] || 'User'}
                                    </span>
                                </div>
                                <Button variant="ghost" onClick={logout} className="!px-4 !py-2 text-xs bg-gray-50 dark:bg-white/5 border-none dark:text-petal-rose font-bold">
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-100 dark:border-petal-leaf/20">
                                <Link to="/login">
                                    <span className="text-sm font-bold text-gray-500 hover:text-petal-leaf dark:hover:text-white transition-colors cursor-pointer">Login</span>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" className="shadow-petal-rose/20 bg-petal-rose hover:bg-petal-rose/90 text-white border-none rounded-xl">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => document.documentElement.classList.toggle('dark')}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800"
                        >
                            <Sun className="w-5 h-5 dark:hidden" />
                            <Moon className="w-5 h-5 hidden dark:block" />
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-bee-accent dark:text-white">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="md:hidden bg-white dark:bg-bee-muted border-t border-gray-100 dark:border-gray-800"
                    >
                        <div className="px-6 pt-4 pb-8 space-y-4">
                            {user ? (
                                <>
                                    <Link to="/" className="block text-lg font-bold text-petal-leaf dark:text-white py-2" onClick={() => setIsOpen(false)}>
                                        Service Hub
                                    </Link>
                                    <div className="py-4 border-t border-gray-100 dark:border-petal-leaf/20 mt-4">
                                        {user.role !== 'admin' && (
                                            <p className="text-xs font-black uppercase tracking-widest text-petal-rose mb-1">
                                                {user.role === 'company' ? 'Provider' : 'Member'}
                                            </p>
                                        )}
                                        <p className={`font-bold text-gray-800 dark:text-white mb-6 ${user.role === 'admin' ? 'uppercase tracking-tighter' : ''}`}>
                                            {user.name || (user.email && user.email.split('@')[0]) || 'Bee'}
                                        </p>
                                        <Button variant="outline" onClick={logout} className="w-full py-4 text-sm rounded-2xl border-petal-rose/30 text-petal-rose">
                                            Sign Out
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-4 pt-4 border-t border-gray-100 dark:border-petal-leaf/20">
                                    <Link to="/login" className="block w-full" onClick={() => setIsOpen(false)}>
                                        <Button variant="ghost" className="w-full py-4 rounded-2xl text-petal-leaf dark:text-white border-none">Login</Button>
                                    </Link>
                                    <Link to="/signup" className="block w-full" onClick={() => setIsOpen(false)}>
                                        <Button variant="primary" className="w-full py-4 rounded-2xl bg-petal-rose text-white border-none shadow-xl shadow-petal-rose/20">Create Account</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            }
        </nav >
    );
}

