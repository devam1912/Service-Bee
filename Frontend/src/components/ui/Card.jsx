import { motion } from "framer-motion";

export default function Card({ children, className = "", hoverEffect = true, ...props }) {
    return (
        <motion.div
            {...props}
            className={`bg-spooky-card rounded-xl p-6 border border-gray-800 shadow-lg relative overflow-hidden ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? {
                y: -5,
                boxShadow: "0 10px 30px -10px rgba(124, 58, 237, 0.3)",
                borderColor: "rgba(124, 58, 237, 0.3)"
            } : {}}
            transition={{ duration: 0.3 }}
        >
            {/* Ghostly mist effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-spooky-purple opacity-5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-spooky-orange opacity-5 blur-[50px] rounded-full -ml-16 -mb-16 pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
