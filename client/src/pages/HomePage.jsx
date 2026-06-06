import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/layout/Navbar.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const steps = [
  {
    num: "01",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: "Upload Your Content",
    desc: "Add FAQs, docs, website pages or product manuals. AssistFlow indexes everything instantly.",
  },
  {
    num: "02",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    title: "Train Your Assistant",
    desc: "Your AI learns your business tone, products and policies — no prompting skills required.",
  },
  {
    num: "03",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: "Embed on Your Site",
    desc: "Copy one script tag. Your voice-enabled chat widget goes live on any website in under a minute.",
  },
  {
    num: "04",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Talk to Your Visitors",
    desc: "Customers get instant answers 24/7 — via text or voice — without a single human agent.",
  },
];

const faqs = [
  { q: "Do I need any coding knowledge?",         a: "None at all. You upload content, configure your assistant through our UI, and embed it with one copy-paste script tag." },
  { q: "What file types can I upload?",           a: "PDFs, Word docs, plain text, Markdown, and we can also crawl any public URL on your website automatically." },
  { q: "How does voice support work?",            a: "Your assistant uses browser-native speech APIs for real-time voice input and output — no extra plugins or apps needed for visitors." },
  { q: "Is my data isolated from other businesses?", a: "Yes. AssistFlow is fully multi-tenant. Your documents, conversations and settings are completely isolated and never shared." },
  { q: "Can I customise the chat widget appearance?", a: "You can set colours, name, avatar, greeting message and widget position. Advanced theming options are on our roadmap." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4 group">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-zinc-400 text-xl leading-none shrink-0 font-light">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 pb-4 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HomePage({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={user} onLogout={onLogout} onBilling={() => navigate("/billing")} currentPage="home" />

      <main className="overflow-y-auto">

        {/* Hero */}
        <motion.section variants={stagger} initial="hidden" animate="show" className="relative max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full opacity-25"
            style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, transparent 70%)" }} />

          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Voice-Enabled · No-Code · Embeddable
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-zinc-900 dark:text-white mb-4">
            Add your Virtual Assistant<br />
            <span className="text-indigo-600 dark:text-indigo-400">to your website</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Create a smart, voice-enabled assistant that talks to visitors, answers questions and helps users navigate your website — instantly.
          </motion.p>

          <motion.div variants={fadeUp}>
            <button
              onClick={() => navigate("/build-assistant")}
              className="inline-flex cursor-pointer items-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Build Your Assistant
            </button>
          </motion.div>
        </motion.section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-500 font-semibold mb-2">How it works</p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Live in four simple steps</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 grid place-items-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">{s.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-widest">{s.num}</span>
                      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{s.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature banner */}
        <section className="max-w-4xl mx-auto px-6 pb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-white">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
              <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full bg-white/5" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div>
                <p className="text-indigo-200 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">Always on</p>
                <h3 className="text-2xl font-bold leading-tight mb-2">Your AI support agent<br />never sleeps.</h3>
                <p className="text-indigo-200 text-sm leading-relaxed max-w-sm">Handle customer queries, guide onboarding, and reduce support tickets — 24/7, automatically.</p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                {["24/7 availability", "Voice + text input", "Zero setup time", "Instant answers"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="w-4 h-4 rounded-full bg-white/20 grid place-items-center text-[10px] font-bold">✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-6 py-12 pb-24">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-500 font-semibold mb-2">FAQ</p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Common questions</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </motion.div>
        </section>

      </main>
    </div>
  );
}