
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

export function Card({ stepNum, title, children }) {
  return (
    <motion.div
      key={stepNum}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="exit"
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-4"
    >
      <p className="text-[11px] uppercase tracking-widest text-indigo-500 font-semibold mb-1">
        Step {stepNum}
      </p>
      <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-5">{title}</h2>
      {children}
    </motion.div>
  );
}