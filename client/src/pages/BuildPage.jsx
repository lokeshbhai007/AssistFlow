import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/layout/Navbar.jsx";
import { Toggle } from "../components/ui/Toggle.jsx";
import { Card } from "../components/ui/Card.jsx";
import { StepBar } from "../components/ui/StepBar.jsx";
import { api } from "../lib/api.js";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const INDUSTRIES = [
  "E-commerce",
  "SaaS / Software",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "Other",
];

const TONES = [
  { value: "friendly", label: "Friendly", icon: "😊" },
  { value: "professional", label: "Professional", icon: "💼" },
  { value: "sales", label: "Sales", icon: "🚀" },
];

const THEMES = [
  { value: "dark", label: "Dark", preview: "bg-zinc-900 border-zinc-700" },
  { value: "light", label: "Light", preview: "bg-white border-zinc-200" },
  {
    value: "glass",
    label: "Glass",
    preview: "bg-white/10 backdrop-blur border-white/30",
  },
  { value: "neon", label: "Neon", preview: "bg-black border-fuchsia-500" },
];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 " +
  "bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 " +
  "placeholder-zinc-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors";

const labelCls =
  "text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block";

export function BuildPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    assistantName: "",
    businessName: "",
    industry: "",
    businessDescription: "",
    assistantTone: "friendly",
    theme: "dark",
    enableVoice: true,
    enableNavigation: true,
    pages: [],
    geminiApiKey: "",
  });

  const [pageName, setPageName] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [pageKeyword, setPageKeyword] = useState("");
  const [pageKeywords, setPageKeywords] = useState([]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addKeyword = () => {
    const kw = pageKeyword.trim();
    if (kw && !pageKeywords.includes(kw)) setPageKeywords((p) => [...p, kw]);
    setPageKeyword("");
  };

  const addPage = () => {
    if (!pageName.trim() || !pagePath.trim()) return;
    const newPage = {
      name: pageName.trim(),
      path: pagePath.trim().startsWith("/")
        ? pagePath.trim()
        : `/${pagePath.trim()}`,
      keywords: pageKeywords,
    };
    set("pages", [...form.pages, newPage]);
    setPageName("");
    setPagePath("");
    setPageKeyword("");
    setPageKeywords([]);
  };

  const removePage = (i) =>
    set("pages", form.pages.filter((_, idx) => idx !== i));

  const canContinue = () => {
    if (step === 1)
      return form.assistantName.trim() && form.businessName.trim() && form.industry;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await api("/api/user/assistant", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          name: user?.name || "",
          email: user?.email || "",
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar
          user={user}
          onLogout={onLogout}
          onBilling={() => navigate("/billing")}
          currentPage="builder"
        />
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 grid place-items-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
            <svg
              width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Assistant created!
          </h2>
          <p className="text-zinc-400 text-sm mb-8">
            Your AI assistant{" "}
            <span className="text-indigo-500 font-semibold">{form.assistantName}</span>{" "}
            is ready. Head to the dashboard to upload documents and get your embed script.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow shadow-indigo-500/20 transition-all active:scale-95"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar
        user={user}
        onLogout={onLogout}
        onBilling={() => navigate("/billing")}
        currentPage="builder"
      />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto px-6 py-12"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
            Build Your Assistant
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Set up your AI-powered assistant in four steps. It'll be live on your website in minutes.
          </p>
        </motion.div>

        {/* Step bar */}
        <motion.div variants={fadeUp}>
          <StepBar current={step} />
        </motion.div>

        {/* Steps */}
        <AnimatePresence mode="wait">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Card stepNum={1} title="Business Information">
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      className={inputCls}
                      value={form.businessName}
                      onChange={(e) => set("businessName", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Assistant Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aria, Max, Support Bot…"
                      className={inputCls}
                      value={form.assistantName}
                      onChange={(e) => set("assistantName", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Industry</label>
                    <select
                      className={inputCls}
                      value={form.industry}
                      onChange={(e) => set("industry", e.target.value)}
                    >
                      <option value="">Select industry…</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Business Description</label>
                    <textarea
                      placeholder="Describe what your business does, your products/services, and anything else the assistant should know…"
                      className={inputCls}
                      value={form.businessDescription}
                      maxLength={5000}
                      onChange={(e) => set("businessDescription", e.target.value)}
                      style={{ resize: "vertical", minHeight: "110px" }}
                    />
                    <p className="text-[11px] text-zinc-400 mt-1 text-right">
                      {form.businessDescription.length.toLocaleString()} / 5,000
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Card stepNum={2} title="Appearance & Features">
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Assistant Tone</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TONES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set("assistantTone", t.value)}
                          className={`py-2.5 rounded-xl border text-xs font-medium transition-all duration-150
                            ${form.assistantTone === t.value
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-300 hover:text-indigo-500"
                            }`}
                        >
                          <span className="block text-base mb-0.5">{t.icon}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Widget Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {THEMES.map((th) => (
                        <button
                          key={th.value}
                          type="button"
                          onClick={() => set("theme", th.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150
                            ${form.theme === th.value
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-300"
                            }`}
                        >
                          <div className={`w-full h-8 rounded-lg border ${th.preview}`} />
                          <span
                            className={`text-[11px] font-semibold ${form.theme === th.value ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"}`}
                          >
                            {th.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 py-1 divide-y divide-zinc-100 dark:divide-zinc-700/60">
                    <Toggle
                      label="Enable Voice"
                      description="Let customers speak to the assistant"
                      value={form.enableVoice}
                      onChange={(v) => set("enableVoice", v)}
                    />
                    <Toggle
                      label="Enable Navigation"
                      description="Assistant can guide users to pages"
                      value={form.enableNavigation}
                      onChange={(v) => set("enableNavigation", v)}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Card stepNum={3} title="Website Pages">
                <p className="text-xs text-zinc-400 mb-4 -mt-3 leading-relaxed">
                  Add the pages of your website so the assistant knows where to send users.
                  Keywords help it match customer intent to the right page.
                </p>

                {form.pages.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {form.pages.map((pg, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                            {pg.name}
                          </p>
                          <p className="text-xs text-indigo-500 font-mono">{pg.path}</p>
                          {pg.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {pg.keywords.map((kw) => (
                                <span
                                  key={kw}
                                  className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-medium"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePage(i)}
                          className="text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors mt-0.5 shrink-0"
                        >
                          <svg
                            width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">
                    Add a page
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Page Name</label>
                      <input
                        type="text"
                        placeholder="Pricing"
                        className={inputCls}
                        value={pageName}
                        onChange={(e) => setPageName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Path</label>
                      <input
                        type="text"
                        placeholder="/pricing"
                        className={inputCls}
                        value={pagePath}
                        onChange={(e) => setPagePath(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Keywords</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="cost, plans, upgrade…"
                        className={inputCls}
                        value={pageKeyword}
                        onChange={(e) => setPageKeyword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addKeyword())
                        }
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-500 transition-all text-xs font-semibold shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    {pageKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pageKeywords.map((kw) => (
                          <span
                            key={kw}
                            onClick={() =>
                              setPageKeywords((p) => p.filter((k) => k !== kw))
                            }
                            className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium cursor-pointer hover:bg-red-50 hover:text-red-400 transition-colors"
                          >
                            {kw} ×
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={addPage}
                    disabled={!pageName.trim() || !pagePath.trim()}
                    className="w-full py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + Add Page
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Card stepNum={4} title="API Key & Deploy">
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Gemini API Key</label>
                    <input
                      type="password"
                      placeholder="AIza…"
                      className={inputCls}
                      value={form.geminiApiKey}
                      onChange={(e) => set("geminiApiKey", e.target.value)}
                    />
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                      Get your key at{" "}
                      
                       <a href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:underline"
                      >
                        aistudio.google.com/apikey
                      </a>
                      . Stored securely; never exposed to end-users.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 space-y-2">
                    <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-3">
                      Summary
                    </p>
                    {[
                      ["Assistant", form.assistantName || "—"],
                      ["Business", form.businessName || "—"],
                      ["Industry", form.industry || "—"],
                      [
                        "Description",
                        form.businessDescription
                          ? form.businessDescription.slice(0, 60) +
                            (form.businessDescription.length > 60 ? "…" : "")
                          : "—",
                      ],
                      ["Tone", form.assistantTone],
                      ["Theme", form.theme],
                      ["Voice", form.enableVoice ? "On" : "Off"],
                      ["Navigation", form.enableNavigation ? "On" : "Off"],
                      [
                        "Pages",
                        `${form.pages.length} page${form.pages.length !== 1 ? "s" : ""}`,
                      ],
                    ].map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{key}</span>
                        <span className="text-zinc-700 dark:text-zinc-200 font-medium capitalize">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
                      <svg
                        width="14" height="14" className="mt-0.5 shrink-0"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Nav buttons ── */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95
              ${step === 1 ? "invisible" : ""}`}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => canContinue() && setStep((s) => s + 1)}
              disabled={!canContinue()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow shadow-indigo-500/20 transition-all duration-200 active:scale-95"
            >
              Continue
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold shadow shadow-indigo-500/20 transition-all duration-200 active:scale-95"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin"
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  Launch Assistant
                  <svg
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </>
              )}
            </button>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
}