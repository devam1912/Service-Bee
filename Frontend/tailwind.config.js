/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "petal-rose": "#FF8E9C",
        "petal-leaf": "#3A5A40",
        "petal-moss": "#1B2620",
        "petal-light": "#FDFBFB",
        "petal-clay": "#4A4E4D",
        "petal-dark": "#0B0F0D",
        "petal-muted": "#161E1A",
        "deep-moss": "#0B0F0D",
        "soft-petal": "#FDFBFB",
        "bee-yellow": "#FFD700",
        "bee-accent": "#1B2620",
        "bee-dark": "#080B09",
        "bee-muted": "#121815",
        "bee-light": "#FDFBFB",
        "premium-dark": "#050706",
        "glass-dark": "rgba(22, 30, 26, 0.7)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
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
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

