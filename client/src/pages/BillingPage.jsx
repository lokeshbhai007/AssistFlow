import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Perfect for trying out AssistFlow.",
    features: ["1 assistant", "500 messages/mo", "File uploads up to 5 MB", "Community support"],
    cta: "Current plan",
    active: true,
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    desc: "For businesses ready to scale support.",
    features: ["3 assistants", "10,000 messages/mo", "File uploads up to 100 MB", "Voice support", "Priority support", "Custom widget branding"],
    cta: "Upgrade to Pro",
    active: false,
    highlight: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "per month",
    desc: "For teams with heavy support needs.",
    features: ["Unlimited assistants", "Unlimited messages", "Unlimited uploads", "Voice + analytics", "Dedicated support", "SLA guarantee"],
    cta: "Contact Sales",
    active: false,
    highlight: false,
  },
];

export function BillingPage({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={user} onLogout={onLogout} onBilling={() => navigate("/billing")} currentPage="billing" />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto px-6 py-12"
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
        <motion.div variants={fadeUp} className="mb-2">
          <div className="flex items-center gap-3 mb-5">
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">Billing & Plans</h1>
          <p className="text-zinc-400 text-sm">Choose the plan that fits your business. Upgrade or downgrade anytime.</p>
        </motion.div>

        {/* Current usage strip */}
        <motion.div
          variants={fadeUp}
          className="my-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-wrap items-center gap-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-0.5">Current Plan</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Starter</p>
          </div>
          <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-0.5">Messages Used</p>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">124 <span className="text-zinc-400 font-normal">/ 500</span></p>
          </div>
          <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-0.5">Renewal</p>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Jul 1, 2025</p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
              <span>Usage</span><span>25%</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "25%" }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Plan cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-5 flex flex-col transition-all duration-200
                ${plan.highlight
                  ? "border-indigo-400 dark:border-indigo-600 bg-white dark:bg-zinc-900 shadow-lg shadow-indigo-500/10"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-4 mt-2">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-zinc-400 mb-1.5">{plan.period}</span>
                </div>
                <p className="text-xs text-zinc-400">{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95
                  ${plan.active
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-default"
                    : plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow shadow-indigo-500/25"
                      : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                disabled={plan.active}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </motion.div>

        {/* Note */}
        <motion.p variants={fadeUp} className="text-center text-xs text-zinc-400 mt-8">
          All plans include SSL, 99.9% uptime SLA, and GDPR-compliant data handling.
          Questions?{" "}
          <span className="text-indigo-500 cursor-pointer hover:underline">Contact support</span>
        </motion.p>
      </motion.main>
    </div>
  );
}