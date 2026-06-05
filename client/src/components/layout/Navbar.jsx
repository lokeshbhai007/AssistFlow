import { motion } from "framer-motion";

const roleMeta = {
  ADMIN: { label: "Admin", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  USER:  { label: "User",  cls: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" },
};

export function Navbar({ user, onLogout }) {
  const meta = roleMeta[user?.role] ?? roleMeta.USER;

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 grid place-items-center shadow-sm shadow-indigo-500/30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" opacity="0.9"/>
              <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">AssistFlow</span>
          {user?.role === "ADMIN" && (
            <span className="text-zinc-300 dark:text-zinc-700 select-none">·</span>
          )}
          {user?.role === "ADMIN" && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Admin Console</span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${meta.cls}`}>
            {meta.label}
          </span>
          {user?.photo && (
            <img src={user.photo} alt="avatar" className="w-7 h-7 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700 object-cover" />
          )}
          <button
            onClick={onLogout}
            className="text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </motion.header>
  );
}
