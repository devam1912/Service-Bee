export default function Container({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50
                    dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-50">
      {children}
    </div>
  );
}
