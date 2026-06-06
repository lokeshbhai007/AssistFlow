import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createAssistant,
  getAssistant,
  markSetupComplete,
} from "../controllers/assistant.controller.js";

const router = express.Router();

// All routes here require a valid JWT cookie
router.use(authenticate);

// ── Assistant ────────────────────────────────────────────────────────────────
router.post("/assistant", createAssistant); // create / upsert
router.get("/assistant", getAssistant); // fetch current user's assistant
router.patch("/assistant/complete", markSetupComplete); // mark isSetupComplete = true

export default router;
