import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../lib/firebase.js";
import { api } from "../../lib/api.js";
import { Spinner } from "../ui/Spinner.jsx";

const features = [
  { icon: "◈", text: "Multi-tenant isolation" },
  { icon: "◎", text: "Role-based access control" },
  { icon: "◉", text: "Firebase OAuth + JWT sessions" },
];

export function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const result  = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const data    = await api("/api/auth/google", { method: "POST", body: JSON.stringify({ idToken }) });
      if (data.user) onLogin(data.user);
      else setError(data.message || "Login failed");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────── */}
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[46%] bg-zinc-950 p-14 relative overflow-hidden select-none"
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)" }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] translate-x-1/4 translate-y-1/4 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 65%)" }} />
          {/* dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 grid place-items-center shadow-lg shadow-indigo-500/30">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" opacity="0.8"/>
              <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">AssistFlow</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <p className="text-indigo-400 text-[11px] uppercase tracking-[0.2em] font-semibold mb-5">
            Customer Support Platform
          </p>
          <h1 className="text-white text-[2.6rem] font-bold leading-[1.1] tracking-tight mb-6">
            Deploy AI support<br />
            <span className="text-zinc-400">in minutes.</span>
          </h1>
          <p className="text-zinc-500 text-base leading-relaxed max-w-xs">
            Give every business their own AI agent — trained on their docs, isolated from others.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-indigo-500 text-sm font-mono">{f.icon}</span>
              <span className="text-zinc-500 text-sm">{f.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.aside>

      {/* ── Right panel ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[360px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 grid place-items-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" opacity="0.8"/>
                <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-zinc-900 dark:text-white">AssistFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">Sign in</h2>
          <p className="text-zinc-400 text-sm mb-8">Access your dashboard and manage your AI agent.</p>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex cursor-pointer items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Spinner size={5} />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </motion.button>

          <p className="mt-6 text-center text-xs text-zinc-400">
            By continuing you agree to our{" "}
            <span className="text-indigo-500 cursor-pointer hover:underline">Terms</span> &amp;{" "}
            <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
