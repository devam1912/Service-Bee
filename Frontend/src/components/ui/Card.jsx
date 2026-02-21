import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export default function Card({ children, className = "", hoverEffect = true, ...props }) {
    return (
        <motion.div
            {...props}
            className={cn(
                "bg-white dark:bg-bee-muted rounded-[32px] p-6 border border-gray-100 dark:border-petal-leaf/20 shadow-xl relative overflow-hidden transition-colors duration-300",
                className
            )}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={hoverEffect ? {
                y: -8,
                boxShadow: "0 25px 50px -12px rgba(255, 142, 156, 0.15)",
                borderColor: "rgba(255, 142, 156, 0.3)"
            } : {}}
            transition={{ duration: 0.3 }}
        >
            {/* Subtle accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-bee-yellow opacity-5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-5 blur-[60px] rounded-full -ml-16 -mb-16 pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

