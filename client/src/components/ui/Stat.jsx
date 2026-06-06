export function Stat({ label, value }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3">
      <p className="text-[11px] text-zinc-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
    </div>
  );
}

