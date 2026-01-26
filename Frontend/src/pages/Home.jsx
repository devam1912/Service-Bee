import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-6"
      >
        <div className="rounded-3xl p-8 border border-black/5 dark:border-white/10
                        bg-white/70 dark:bg-white/5 shadow-sm">
          <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            Production-grade MERN • Payments • Realtime • Moderation
          </div>

          <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">
            Book services. Confirm with payments. Chat in real time.
          </h1>

          <p className="mt-4 text-zinc-600 dark:text-zinc-300 max-w-2xl">
            Verified providers, slot locking, payment confirmation, realtime updates,
            and a moderated community chat — built like a real product.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-2xl bg-amber-500 text-black font-bold">Trust Score Ranking</div>
            <div className="px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/10 font-semibold">Socket.IO Rooms</div>
            <div className="px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/10 font-semibold">Terms Enforcement</div>
            <div className="px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/10 font-semibold">Chat Moderation</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            ["Payments", "Razorpay order + signature verify → booking confirmation."],
            ["Realtime", "Status updates for booking & payment with Socket.IO."],
            ["Moderation", "Abuse filter, rate limit, reports & admin actions."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-3xl p-6 border border-black/5 dark:border-white/10
                         bg-white/70 dark:bg-white/5 shadow-sm"
            >
              <div className="font-extrabold text-xl">{title}</div>
              <div className="mt-2 text-zinc-600 dark:text-zinc-300">{desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
