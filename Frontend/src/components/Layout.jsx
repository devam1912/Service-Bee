import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

import ChatDisclaimer from "./ChatDisclaimer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-petal-light dark:bg-premium-dark text-petal-moss dark:text-gray-100 font-sans selection:bg-petal-rose selection:text-white">
      <ChatDisclaimer />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-7xl">
        <Outlet />
      </main>
      <Footer />

      {/* Background ambient effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-petal-rose/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-petal-leaf/5 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}

