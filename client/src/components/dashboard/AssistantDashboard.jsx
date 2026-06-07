import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../layout/Navbar.jsx";
import { Stat } from "../ui/Stat.jsx";
import { Badge } from "../ui/Badge.jsx";
import { api } from "../../lib/api.js";
import { DeleteModal } from "../ui/DeleteModal.jsx";
import { Toast } from "../ui/Toast.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

const TONE_COLOR = {
  friendly:
    "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  professional:
    "bg-blue-50   dark:bg-blue-950/40    text-blue-600   dark:text-blue-400",
  sales:
    "bg-orange-50 dark:bg-orange-950/40  text-orange-600 dark:text-orange-400",
};
const THEME_COLOR = {
  dark:  "bg-zinc-800  text-zinc-200",
  light: "bg-zinc-100  text-zinc-700",
  glass: "bg-white/20  text-zinc-600 backdrop-blur",
  neon:  "bg-black     text-fuchsia-400",
};

// ── Gemini status config ─────────────────────────────────────────────────────
const GEMINI_STATUS = {
  checking:     { dot: "bg-zinc-400",    text: "text-zinc-400",    label: "Checking…"     },
  active:       { dot: "bg-emerald-500", text: "text-emerald-500", label: "Active"         },
  invalid:      { dot: "bg-red-500",     text: "text-red-500",     label: "Invalid Key"    },
  limit_exceeded:{ dot: "bg-amber-400",  text: "text-amber-400",   label: "Limit Exceeded" },
  error:        { dot: "bg-zinc-400",    text: "text-zinc-400",    label: "Unknown"        },
};

const DOMAIN_URL = import.meta.env.VITE_ASSISTANT_DOMAIN_URL;

// ─── Assistant Dashboard ──────────────────────────────────────────────────────
export function AssistantDashboard({ assistant, user, onLogout, onDeleted }) {
  const navigate = useNavigate();
  const a = assistant;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [deleteError, setDeleteError]         = useState("");
  const [toastVisible, setToastVisible]       = useState(false);
  const [geminiStatus, setGeminiStatus]       = useState("checking");

  // ── Probe Gemini key on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!a?._id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/widget/validate-key/${a._id}`
        );
        if (cancelled) return;
        const data = await res.json();
        setGeminiStatus(data.status || "error");
      } catch {
        if (!cancelled) setGeminiStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [a?._id]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api("/api/user/assistant", { method: "DELETE" });
      setShowDeleteModal(false);
      if (onDeleted) onDeleted();
      else navigate("/build-assistant");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete assistant.");
      setDeleting(false);
    }
  };

  const gs = GEMINI_STATUS[geminiStatus] ?? GEMINI_STATUS.error;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar
        user={user}
        onLogout={onLogout}
        onBilling={() => navigate("/billing")}
        currentPage="builder"
      />

      {showDeleteModal && (
        <DeleteModal
          assistantName={a.assistantName}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setDeleteError(""); }}
          deleting={deleting}
        />
      )}

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto px-6 py-12"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
              {a.assistantName}
            </h1>
            <p className="text-zinc-400 text-sm">
              {a.businessName} · {a.industry}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold
              ${a.isSetupComplete
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-50  dark:bg-amber-950/40  text-amber-600  dark:text-amber-400"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${a.isSetupComplete ? "bg-emerald-500" : "bg-amber-400"}`} />
              {a.isSetupComplete ? "Live" : "Setup incomplete"}
            </span>
            <Badge
              className={`${a.plan === "pro"
                ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                : "bg-green-400 dark:bg-green-600 text-black"
              }`}
            >
              {a.plan} plan
            </Badge>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-6">
          <Stat
            label="Messages Left"
            value={(a.requestLimit - a.totalMessages).toLocaleString()}
          />

          {/* ── Gemini AI Status stat ── */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3">
            <p className="text-[11px] text-zinc-400 font-medium mb-0.5">AI Status</p>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${gs.text}`}>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${gs.dot} ${
                  geminiStatus === "checking" ? "animate-pulse" : ""
                }`}
              />
              {gs.label}
            </span>
          </div>

          <Stat label="Pages indexed" value={a.pages.length} />
        </motion.div>

        {/* Delete error banner */}
        {deleteError && (
          <motion.div
            variants={fadeUp}
            className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs"
          >
            <svg width="14" height="14" className="mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {deleteError}
          </motion.div>
        )}

        {/* Details card */}
        <motion.div
          variants={fadeUp}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-4"
        >
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Configuration</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Tone</span>
              <Badge className={TONE_COLOR[a.assistantTone] || "bg-zinc-100 text-zinc-500"}>
                {a.assistantTone}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Theme</span>
              <Badge className={THEME_COLOR[a.theme] || "bg-zinc-100 text-zinc-500"}>
                {a.theme}
              </Badge>
            </div>

            {[
              ["Voice enabled",      a.enableVoice],
              ["Navigation enabled", a.enableNavigation],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">{label}</span>
                <span className={`font-semibold ${val ? "text-emerald-500" : "text-zinc-400"}`}>
                  {val ? "On" : "Off"}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Gemini API key</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                {a.geminiApiKey ? "Set" : "Not set"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Contact email</span>
              <span className="text-zinc-600 dark:text-zinc-300">{a.email}</span>
            </div>
          </div>
        </motion.div>

        {/* Pages card */}
        {a.pages.length > 0 && (
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-4"
          >
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">
              Indexed Pages
              <span className="ml-2 text-[11px] font-normal text-zinc-400">({a.pages.length})</span>
            </h2>
            <div className="space-y-2">
              {a.pages.map((pg, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <span className="font-mono text-indigo-500 text-xs mt-0.5 shrink-0">{pg.path}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{pg.name}</p>
                    {pg.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pg.keywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete
          </button>

          <button
            onClick={() => navigate("/build-assistant/edit")}
            className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Assistant
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `<script src="${DOMAIN_URL}/widget.js" data-id="${a._id}"></script>`
              );
              setToastVisible(true);
            }}
            className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow shadow-indigo-500/20 transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Embed Script
          </button>
        </motion.div>

        <Toast
          message="Embed script copied!"
          show={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </motion.main>
    </div>
  );
}