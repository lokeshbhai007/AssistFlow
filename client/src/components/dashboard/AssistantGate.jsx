import { useEffect, useState } from "react";
import { AssistantDashboard } from "./AssistantDashboard";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../layout/Navbar";
import { Skeleton } from "../ui/Skeleton";
import { api } from "../../lib/api";


export function AssistantGate({ user, onLogout, BuildPage }) {
  const [status, setStatus]         = useState("loading"); // "loading" | "exists" | "none" | "error"
  const [assistant, setAssistant]   = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    api("/api/user/assistant")
      .then((data) => {
        setAssistant(data.assistant);
        setStatus("exists");
      })
      .catch((err) => {
        if (err.status === 404) {
          setStatus("none"); // no assistant yet → show builder
        } else {
          setStatus("error");
        }
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar user={user} onLogout={onLogout} onBilling={() => navigate("/billing")} currentPage="builder" />
        <Skeleton />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-sm mb-4">Failed to load assistant data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === "exists") {
    return <AssistantDashboard assistant={assistant} user={user} onLogout={onLogout} />;
  }

  // status === "none" → render the wizard
  return <BuildPage user={user} onLogout={onLogout} />;
}