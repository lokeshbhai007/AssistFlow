import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createAssistant,
  deleteAssistant,
  getAssistant,
} from "../controllers/assistant.controller.js";

const router = express.Router();

// All routes here require a valid JWT cookie
router.use(authenticate);

// ── Assistant ────────────────────────────────────────────────────────────────
router.post("/assistant", createAssistant);
router.put("/assistant", createAssistant);        // ← reuses same upsert logic
router.get("/assistant", getAssistant);
router.delete("/assistant", deleteAssistant);     // ← new

export default router;
