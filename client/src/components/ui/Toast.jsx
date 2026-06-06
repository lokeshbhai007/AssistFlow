import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Toast({ message, show, onHide }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 right-4 z-50 inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold shadow-lg shadow-black/20"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-500 grid place-items-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}