export default function GlobalChat() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-3xl p-6 border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
        <div className="font-extrabold text-2xl">Global Community Chat</div>
        <div className="mt-2 text-zinc-600 dark:text-zinc-300">
          Next we’ll connect Socket.IO + show live messages + moderation errors.
        </div>
      </div>
    </div>
  );
}
