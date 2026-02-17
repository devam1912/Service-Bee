import { motion } from "framer-motion";

export default function Button({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) {
    const baseStyle = "px-6 py-2 rounded-lg font-creepy transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider uppercase";

    const variants = {
        primary: "bg-spooky-purple text-white hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-spooky-purple",
        secondary: "bg-spooky-orange text-white hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(255,117,24,0.5)] border border-spooky-orange",
        outline: "bg-transparent border border-spooky-purple text-spooky-purple hover:bg-spooky-purple hover:text-white",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-spooky-card"
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    );
}
