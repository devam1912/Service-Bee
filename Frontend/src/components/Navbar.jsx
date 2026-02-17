import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import { motion } from "framer-motion";
import { Ghost, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-spooky-dark/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Ghost className="w-8 h-8 text-spooky-orange group-hover:text-spooky-purple transition-colors" />
                        </motion.div>
                        <span className="font-spooky text-2xl text-white tracking-widest group-hover:text-spooky-orange transition-colors">
                            Service Bee
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => {
                                document.documentElement.classList.toggle('dark');
                            }}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                            {/* Simple icon toggle, could be more elaborate */}
                            <span className="dark:hidden">🎃</span>
                            <span className="hidden dark:inline">👻</span>
                        </button>

                        <Link to="/global-chat" className="text-gray-600 dark:text-gray-300 hover:text-spooky-purple transition-colors font-medium">
                            Global Chat
                        </Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'company' ? "/dashboard/company" : "/dashboard"} className="text-gray-600 dark:text-gray-300 hover:text-spooky-purple transition-colors font-medium">
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Hello, <span className="text-spooky-purple dark:text-spooky-orange">{user.name}</span></span>
                                    <Button variant="outline" onClick={logout} className="!px-4 !py-1 text-sm">
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" className="!px-4 !py-1">Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" className="!px-4 !py-1">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => {
                                document.documentElement.classList.toggle('dark');
                            }}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="dark:hidden">🎃</span>
                            <span className="hidden dark:inline">👻</span>
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300 hover:text-spooky-purple">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:hidden bg-white dark:bg-spooky-card border-b border-gray-200 dark:border-gray-800"
                >
                    <div className="px-4 pt-2 pb-4 space-y-3">
                        <Link to="/global-chat" className="block text-gray-600 dark:text-gray-300 hover:text-spooky-purple px-3 py-2 rounded-md">
                            Global Chat
                        </Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'company' ? "/dashboard/company" : "/dashboard"} className="block text-gray-600 dark:text-gray-300 hover:text-spooky-purple px-3 py-2 rounded-md">
                                    Dashboard
                                </Link>
                                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                    Logged in as {user.name}
                                </div>
                                <Button variant="outline" onClick={logout} className="w-full">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block">
                                    <Button variant="ghost" className="w-full text-left">Login</Button>
                                </Link>
                                <Link to="/signup" className="block">
                                    <Button variant="primary" className="w-full">Sign Up</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
}
