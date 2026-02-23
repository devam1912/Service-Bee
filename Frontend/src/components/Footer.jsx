import { Link } from "react-router-dom";
import BeeLogo from "./ui/BeeLogo";
import { cn } from "../lib/utils";

export default function Footer() {
    return (
        <footer className="bg-white/50 dark:bg-glass-dark backdrop-blur-xl border-t border-gray-100 dark:border-petal-leaf/10 py-16 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <Link to="/" className="flex items-center gap-3 justify-center mb-8">
                    <div className="flex items-center gap-3 group">
                        <div className="bg-petal-rose/10 p-2.5 rounded-2xl">
                            <BeeLogo className="w-8 h-8" />
                        </div>
                        <span className="text-3xl font-display font-black tracking-tighter">
                            <span className="text-petal-moss dark:text-white">Service</span> <span className="text-petal-rose">Bee</span>
                        </span>
                    </div>
                </Link>
                <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10 translate-y-[-10px]">
                    Empowering local professionals to build the most efficient hive for premium services in every community.
                </p>
                <div className="border-t border-gray-100 dark:border-petal-leaf/5 pt-10">
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} Service-Bee Hub • All Rights Reserved
                    </p>
                    <span className="text-[10px] text-petal-rose mt-4 block font-black uppercase tracking-[0.4em] opacity-80 underline underline-offset-8 decoration-petal-rose/30">Premium Service Network</span>
                </div>
            </div>
        </footer>
    );
}
