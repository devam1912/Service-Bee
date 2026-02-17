import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

import ChatDisclaimer from "./ChatDisclaimer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-spooky-dark text-gray-200 font-sans selection:bg-spooky-purple selection:text-white">
      <ChatDisclaimer />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />

      {/* Background ambient effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-spooky-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-spooky-orange/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
