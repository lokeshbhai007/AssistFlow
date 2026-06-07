import { Router } from "express";
import {
  getWidgetConfig,
  handleWidgetChat,
} from "../controllers/widget.controller.js";

const router = Router();

// GET /api/widget/config/:assistantId
// Returns public-safe config so the widget can theme itself
router.get("/config/:assistantId", getWidgetConfig);

// POST /api/widget/chat
// Body: { assistantId, message, conversationHistory }
router.post("/chat", handleWidgetChat);

export default router;

