const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = async (path, opts = {}) => {
  try {
    const res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

    if (!res.ok) {
      const error = new Error(`HTTP Error: ${res.status}`);
      error.status = res.status;
      throw error;
    }

    return res.json();
  } catch (error) {
    throw error; 
  }
};