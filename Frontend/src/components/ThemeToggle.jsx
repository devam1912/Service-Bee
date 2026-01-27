import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const themeCtx = useTheme();

  if (!themeCtx) return null;

  const { theme, toggleTheme } = themeCtx;

  return (
    <button
      onClick={toggleTheme}
      className="px-2 py-1 rounded border"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
