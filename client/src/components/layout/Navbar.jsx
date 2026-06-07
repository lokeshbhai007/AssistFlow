import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function Navbar({ user, onLogout, onBilling, currentPage }) {
  const isUser = user?.role !== "ADMIN";

  const navigate = useNavigate();

  return (

    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center shadow shadow-indigo-500/30">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L12 3.5v6L6.5 12 1 9.5v-6L6.5 1Z" fill="white" opacity="0.85"/>
              <circle cx="6.5" cy="6.5" r="2" fill="white"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">AssistFlow</span>
          {user?.role === "ADMIN" && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium ml-1">· Admin Console</span>
          )}
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2.5">

          {/* Billing — USER only */}
          {isUser && (
            <button
              onClick={onBilling}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer
                ${currentPage === "billing"
                  ? "bg-indigo-600 border-indigo-600 text-white shadow shadow-indigo-500/25"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-900"
                }`}
            >
              Billing
            </button>
          )}

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />

          {/* Avatar */}
          {user?.photo ? (
            <img src={user.photo} alt="avatar"
              className="w-7 h-7 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700 object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 grid place-items-center text-indigo-600 dark:text-indigo-300 text-xs font-bold shrink-0">
              {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
            </div>
          )}

          {/* Name + email */}
          <div className="hidden sm:flex flex-col leading-none gap-0.5">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate max-w-[130px]">
              {user?.name || "User"}
            </span>
            <span className="text-[10px] text-zinc-400 truncate max-w-[130px]">
              {user?.email}
            </span>
          </div>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />

          {/* Logout */}
          <button
            onClick={onLogout}
            className=" text-xs font-semibold px-3 py-1.5 rounded-lg border  duration-200 cursor-pointer transition-colors  border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-900"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.header>
  );
}
