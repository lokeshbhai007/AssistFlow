import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../layout/Navbar.jsx";
import { Spinner } from "../ui/Spinner.jsx";
import { api } from "../../lib/api.js";

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const roleStyles = {
  ADMIN: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  USER:  "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400",
};

function Avatar({ user }) {
  if (user.photo) {
    return <img src={user.photo} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700" />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 grid place-items-center text-indigo-600 dark:text-indigo-300 text-xs font-bold">
      {(user.name?.[0] || user.email[0]).toUpperCase()}
    </div>
  );
}

export function AdminDashboard({ user, onLogout }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/admin/tenants")
      .then((d) => setTenants(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={user} onLogout={onLogout} />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto px-6 py-10"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">Admin Console</p>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Tenant Management</h1>
          </div>
          {!loading && (
            <span className="text-xs text-zinc-400 font-medium">
              {tenants.length} {tenants.length === 1 ? "tenant" : "tenants"}
            </span>
          )}
        </motion.div>

        {/* Summary cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total tenants", value: loading ? "—" : tenants.length },
            { label: "Admins",        value: loading ? "—" : tenants.filter((t) => t.role === "ADMIN").length },
            { label: "Active users",  value: loading ? "—" : tenants.filter((t) => t.role === "USER").length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-5 py-4">
              <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div variants={fadeUp} className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size={6} />
            </div>
          ) : tenants.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 text-sm">No tenants found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  {["User", "Role", "Tenant ID", "Joined"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.map((t, i) => (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar user={t} />
                        <div>
                          <p className="font-medium text-zinc-800 dark:text-zinc-100 leading-none">{t.name || "—"}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${roleStyles[t.role] ?? roleStyles.USER}`}>
                        {t.role}
                      </span>
                    </td>
                    {/* Tenant */}
                    <td className="px-5 py-3.5 text-zinc-500">{t.tenantId || "—"}</td>
                    {/* Joined */}
                    <td className="px-5 py-3.5 text-zinc-400 text-xs">
                      {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
}
