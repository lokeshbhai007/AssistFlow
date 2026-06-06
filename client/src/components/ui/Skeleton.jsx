export function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-pulse">
      <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-10" />
      <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
      <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}
      </div>
      <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
    </div>
  );
}
