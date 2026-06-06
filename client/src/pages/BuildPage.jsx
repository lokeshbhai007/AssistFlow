import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

const steps = [
  { id: 1, label: "Business Info",  desc: "Name, industry, tone" },
  { id: 2, label: "Upload Content", desc: "Docs, FAQs, URLs" },
  { id: 3, label: "Configure",      desc: "Voice, colours, greeting" },
  { id: 4, label: "Deploy",         desc: "Copy embed script" },
];

export function BuildPage({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={user} onLogout={onLogout} onBilling={() => navigate("/billing")} currentPage="builder" />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto px-6 py-12"
      >
        {/* Back */}
        <motion.button
          variants={fadeUp}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-8 font-medium"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to dashboard
        </motion.button>

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            {user?.photo ? (
              <img src={user.photo} alt="avatar" className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-zinc-800 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 grid place-items-center text-indigo-600 dark:text-indigo-300 font-bold">
                {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{user?.name}</p>
              <p className="text-xs text-zinc-400">{user?.email}</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
            Build Your Assistant
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Set up your AI-powered voice assistant in four steps. It'll be live on your website in minutes.
          </p>
        </motion.div>

        {/* Progress steps */}
        <motion.div variants={fadeUp} className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center shrink-0">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                ${s.id === 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-400"}`}>
                <span className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold
                  ${s.id === 1 ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                  {s.id}
                </span>
                <p className={`text-xs font-semibold leading-none ${s.id === 1 ? "text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                  {s.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="w-6 h-px bg-zinc-200 dark:bg-zinc-700 mx-1 shrink-0" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step 1 form card */}
        <motion.div
          variants={fadeUp}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-4"
        >
          <p className="text-[11px] uppercase tracking-widest text-indigo-500 font-semibold mb-1">Step 1</p>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-5">Business Information</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">Business Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">Industry</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors">
                <option value="">Select industry…</option>
                <option>E-commerce</option>
                <option>SaaS / Software</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">Assistant Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {["Friendly", "Professional", "Concise"].map((t) => (
                  <button key={t}
                    className="py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all first:border-indigo-500 first:text-indigo-600 first:bg-indigo-50 dark:first:bg-indigo-950/50 dark:first:text-indigo-400"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">Assistant Name</label>
              <input
                type="text"
                placeholder="e.g. Aria, Max, Support Bot…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Next button */}
        <motion.div variants={fadeUp} className="flex justify-end">
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow shadow-indigo-500/20 transition-all duration-200 active:scale-95">
            Continue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </motion.div>
      </motion.main>
    </div>
  );
}