import { Ghost } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-spooky-dark border-t border-gray-800 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <Ghost className="w-6 h-6 text-spooky-purple" />
                    <span className="font-spooky text-xl text-gray-400">Service Bee</span>
                </div>
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} Service Bee. All rights reserved. <br />
                    <span className="text-xs text-gray-600">Spooky vibes only 👻</span>
                </p>
            </div>
        </footer>
    );
}
