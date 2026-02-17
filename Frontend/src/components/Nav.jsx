import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <nav className="fixed top-0 w-full h-14 flex items-center justify-between px-6
      bg-white dark:bg-neutral-800 border-b dark:border-neutral-700 z-50">

      <Link to="/" className="font-bold text-lg">Service Bee</Link>

      <div className="flex items-center gap-4">
        <Link to="/global-chat">Global Chat</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
