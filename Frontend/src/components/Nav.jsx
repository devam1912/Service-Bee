import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";

export default function Nav() {
  return (
    <div className="sticky top-0 z-50 backdrop-blur border-b border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow"
          />
          <div>
            <div className="font-extrabold tracking-tight text-lg">Service Bee</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">
              Serious backend. Spooky vibes.
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/global"
            className="text-sm font-semibold px-4 py-2 rounded-2xl
                       bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition"
          >
            Global Chat
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
