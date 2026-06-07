import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dns from "dns";
import connectDB from "./config/db.config.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRouter from "./routes/user.route.js";
import widgetRouter from "./routes/widget.route.js";
import path from "path";
import { fileURLToPath } from "url";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Private CORS — only your AssistFlow dashboard (CLIENT_URL) is allowed.
 * Used for all internal routes: auth, admin, user settings, etc.
 * Credentials (cookies / JWT) are included.
 */
const privateCors = cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
});

/**
 * Public CORS — any origin is allowed.
 * Used only for the embeddable widget API so any customer website can call it.
 * No credentials (cookies) are ever sent on these routes.
 */
const publicCors = cors({
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});


app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Serve widget.js publicly 
app.get("/widget.js", publicCors, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "widget.js"));
});


app.use("/api/widget", publicCors, widgetRouter);


app.use("/api/auth", privateCors,   authRoutes);
app.use("/api/admin", privateCors, adminRoutes);
app.use("/api/user", privateCors, userRouter);


app.get("/", (req, res) => res.json({ message: "AssistFlow API running" }));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
}).catch((err) => {
  console.error("DB connection failed:", err);
  process.exit(1);
});