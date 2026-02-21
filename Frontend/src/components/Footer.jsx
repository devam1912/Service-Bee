import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-bee-dark border-t border-gray-100 dark:border-gray-800 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <Link to="/" className="flex items-center gap-3 justify-center">
                    <div className="flex items-center gap-2 group">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <Sparkles className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-display font-black text-white tracking-tighter">
                            Service <span className="text-petal-rose">Bee</span>
                        </span>
                    </div>
                </Link>
                <p className="mt-6 text-white/60 font-medium leading-relaxed max-w-sm mx-auto">
                    Building the most efficient hive for professional services in your local community.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-6">
                    © {new Date().getFullYear()} ServicePetal Technologies. All rights reserved. <br />
                    <span className="text-xs text-petal-rose mt-2 block font-bold uppercase tracking-widest">Premium Service Network</span>
                </p>
            </div>
        </footer>
    );
}
