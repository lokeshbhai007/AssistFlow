import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from 'morgan'
import cookieParser from "cookie-parser";
import dns from "dns";
import connectDB from "./config/db.config.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRouter from "./routes/user.route.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.json({ message: "API running" }));

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
  connectDB();
});