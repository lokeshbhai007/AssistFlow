// ─── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Business Info",  desc: "Name, industry, tone" },
  { id: 2, label: "Appearance",     desc: "Theme, voice, navigation" },
  { id: 3, label: "Pages",          desc: "Site pages & keywords" },
  { id: 4, label: "API & Deploy",   desc: "Gemini key, finish" },
];


export function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const done    = s.id < current;
        const active  = s.id === current;
        return (
          <div key={s.id} className="flex items-center shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
              ${active
                ? "bg-indigo-600 text-white shadow shadow-indigo-500/25"
                : done
                  ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-500"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-400"}`}
            >
              <span className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold
                ${active ? "bg-white/20 text-white" : done ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                {done ? "✓" : s.id}
              </span>
              <p className={`text-xs font-semibold leading-none ${active ? "text-white" : done ? "text-indigo-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px mx-1 shrink-0 transition-colors duration-300 ${done ? "bg-indigo-300 dark:bg-indigo-700" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}