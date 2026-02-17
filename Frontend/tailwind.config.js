/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        spooky: {
          dark: "#121212",
          card: "#1E1E1E",
          purple: "#7c3aed",
          orange: "#ff7518",
          green: "#10b981",
          red: "#ef4444",
          ghost: "#f8f9fa",
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
            "0%": { opacity: "0" },
            "100%": { opacity: "1" },
        }
      },
      fontFamily: {
        spooky: ['"Creepster"', 'cursive'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
