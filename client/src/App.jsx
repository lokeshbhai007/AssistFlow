import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "./lib/firebase.js";
import { api } from "./lib/api.js";
import { LoginPage }      from "./components/auth/LoginPage.jsx";
import { UserDashboard }  from "./components/dashboard/UserDashboard.jsx";
import { AdminDashboard } from "./components/dashboard/AdminDashboard.jsx";
import { Spinner }        from "./components/ui/Spinner.jsx";

export default function App() {
  const [user,     setUser]     = useState(null);
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

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoginPage onLogin={setUser} />
        </motion.div>
      ) : user.role === "ADMIN" ? (
        <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AdminDashboard user={user} onLogout={handleLogout} />
        </motion.div>
      ) : (
        <motion.div key="user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <UserDashboard user={user} onLogout={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
