
export function Toggle({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</p>
        {description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5.5 h-[22px] rounded-full transition-colors duration-200 focus:outline-none
          ${value ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200
          ${value ? "translate-x-[18px]" : "translate-x-0"}`} />
      </button>
    </div>
  );
}