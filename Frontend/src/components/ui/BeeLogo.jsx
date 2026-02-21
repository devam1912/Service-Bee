import { motion } from "framer-motion";

export default function BeeLogo({ className = "w-8 h-8", animate = true }) {
    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            initial={animate ? { rotate: -10, scale: 0.9 } : false}
            animate={animate ? {
                rotate: [-10, 10, -10],
                y: [0, -2, 0]
            } : false}
            transition={animate ? {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            } : {}}
        >
            {/* Wings */}
            <path
                d="M12 10C12 10 15 6 18 6C21 6 22 8 22 10C22 12 20 14 18 14C16 14 12 10 12 10Z"
                className="fill-petal-rose/30 stroke-petal-rose"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 10C12 10 9 6 6 6C3 6 2 8 2 10C2 12 4 14 6 14C8 14 12 10 12 10Z"
                className="fill-petal-rose/30 stroke-petal-rose"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Body */}
            <path
                d="M12 18C14.2091 18 16 15.3137 16 12C16 8.68629 14.2091 6 12 6C9.79086 6 8 8.68629 8 12C8 15.3137 9.79086 18 12 18Z"
                className="fill-petal-leaf dark:fill-white stroke-petal-leaf dark:stroke-white"
                strokeWidth="1.5"
            />
            {/* Stripes */}
            <path d="M9 10H15" className="stroke-petal-rose" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 13H15.5" className="stroke-petal-rose" strokeWidth="1.5" strokeLinecap="round" />
            {/* Antennae */}
            <path d="M11 6L10 3" className="stroke-petal-leaf dark:stroke-white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13 6L14 3" className="stroke-petal-leaf dark:stroke-white" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
    );
}
