import { motion } from "framer-motion";

export default function Button({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) {
    const baseStyle = "px-6 py-2 rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight";

    const variants = {
        primary: "bg-bee-accent dark:bg-bee-yellow text-white dark:text-bee-accent hover:opacity-90 shadow-lg shadow-bee-yellow/5",
        secondary: "bg-bee-yellow text-bee-accent hover:bg-opacity-90 shadow-md",
        outline: "bg-transparent border-2 border-bee-yellow text-bee-yellow hover:bg-bee-yellow hover:text-bee-accent",
        ghost: "bg-transparent text-gray-500 hover:text-bee-accent dark:hover:text-bee-yellow hover:bg-gray-100 dark:hover:bg-gray-800"
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.button>
    );
}

