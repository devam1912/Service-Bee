import { motion } from "framer-motion";

export default function Card({ children, className = "", hoverEffect = true, ...props }) {
    return (
        <motion.div
            {...props}
            className={`bg-white dark:bg-bee-muted rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? {
                y: -5,
                boxShadow: "0 20px 40px -20px rgba(253, 184, 19, 0.2)",
                borderColor: "rgba(253, 184, 19, 0.2)"
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

