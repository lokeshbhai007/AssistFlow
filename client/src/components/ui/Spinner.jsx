import { motion } from "framer-motion";

export function Spinner({ size = 6, color = "indigo" }) {
  const colors = {
    indigo: "border-t-indigo-500",
    amber: "border-t-amber-500",
    white: "border-t-white",
  };
  return (
    <motion.div
      className={`w-${size} h-${size} rounded-full border-2 border-zinc-200/30 ${colors[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
    />
  );
}
