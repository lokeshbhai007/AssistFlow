import { motion } from "framer-motion";
import { Navbar } from "../layout/Navbar.jsx";

const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const statCards = (user) => [
  { label: "Role",      value: user.role },
  { label: "Tenant ID", value: user.tenantId || "Not assigned" },
  { label: "Status",    value: "Active" },
];

export function UserDashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={user} onLogout={onLogout} />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto px-6 py-12"
      >
        {/* Greeting */}
        <motion.div variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            {user.photo ? (
              <img src={user.photo} alt="avatar" className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-zinc-800 shadow-sm object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 grid place-items-center text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                {(user.name?.[0] || user.email[0]).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Welcome back, {user.name?.split(" ")[0]}
              </h1>
              <p className="text-zinc-400 text-sm">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stat row */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-6">
          {statCards(user).map((s) => (
            <div key={s.label} className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-4">
              <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-1.5">{s.label}</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Chatbot card */}
        <motion.div variants={fadeUp} className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">Your AI Agent</p>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Chatbot Overview</h2>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Knowledge base", value: "No documents uploaded yet" },
              { label: "Embed status",   value: "Not deployed" },
              { label: "Voice support",  value: "Disabled" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <span className="text-sm text-zinc-500">{row.label}</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
