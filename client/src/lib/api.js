const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return res.json();
};
