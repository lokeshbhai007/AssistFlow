import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "./lib/firebase.js";
import { api } from "./lib/api.js";
import { Spinner } from "./components/ui/Spinner.jsx";
import { LoginPage } from "./components/auth/LoginPage.jsx";
import { AdminDashboard } from "./components/dashboard/AdminDashboard.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { BillingPage } from "./pages/BillingPage.jsx";
import { BuildPage } from "./pages/BuildPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api("/api/auth/me")
      .then((d) => { if (d.user) setUser(d.user); })
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    await signOut(auth);
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner size={7} />
      </div>
    );
  }

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoginPage onLogin={setUser} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AdminDashboard user={user} onLogout={handleLogout} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<HomePage    user={user} onLogout={handleLogout} />} />
        <Route path="/billing"           element={<BillingPage user={user} onLogout={handleLogout} />} />
        <Route path="/build-assistant"   element={<BuildPage   user={user} onLogout={handleLogout} />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}