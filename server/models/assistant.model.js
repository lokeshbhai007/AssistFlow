import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const assistantSchema = new mongoose.Schema(
  {
    // Owner reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uid: {
      type: String,
      required: true, // Firebase UID — mirrors req.user.uid for easy lookup
    },

    // Company / user identity
    name: { type: String, required: true },
    email: { type: String, required: true },

    // Assistant identity
    assistantName: { type: String, required: true },
    businessName: { type: String, required: true },
    industry: { type: String, required: true },

    // Behaviour
    assistantTone: {
      type: String,
      enum: ["friendly", "professional", "sales"],
      default: "friendly",
    },

    // UI / theming
    theme: {
      type: String,
      enum: ["light", "dark", "glass", "neon"],
      default: "dark",
    },

    // Features
    enableVoice: { type: Boolean, default: true },
    enableNavigation: { type: Boolean, default: true },

    // Pages the assistant should understand
    pages: { type: [pageSchema], default: [] },

    // API key (stored encrypted in production — store as-is here for dev)
    geminiApiKey: { type: String, default: "" },

    // Usage & billing
    totalMessages: { type: Number, default: 0 },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    requestLimit: { type: Number, default: 200 },
    proExpiresAt: { type: Date, default: null },

    // Lifecycle
    isSetupComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Assistant", assistantSchema);