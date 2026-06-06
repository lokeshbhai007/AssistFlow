import { motion } from "framer-motion";

export function Spinner({ size = 6 }) {
  return (
    <motion.div
      className={`w-${size} h-${size} rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-indigo-500`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
    />
  );
}
