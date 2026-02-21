import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

import ChatDisclaimer from "./ChatDisclaimer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bee-light dark:bg-bee-dark text-bee-accent dark:text-gray-200 font-sans selection:bg-bee-yellow selection:text-bee-accent">
      <ChatDisclaimer />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        <Outlet />
      </main>
      <Footer />

      {/* Background ambient effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-bee-yellow/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}

