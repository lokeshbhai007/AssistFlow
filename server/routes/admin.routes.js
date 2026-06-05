import express from "express";
import { getAllTenants } from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/tenants", authenticate, requireAdmin, getAllTenants);

export default router;