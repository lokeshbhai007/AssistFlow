import Assistant from "../models/assistant.model.js";
import User from "../models/user.model.js";

// ─── POST /api/user/assistant ────────────────────────────────────────────────
// Creates (or upserts) the assistant for the authenticated user.
export const createAssistant = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    
    // JWT has userId (MongoDB _id), not uid (Firebase)
    const { userId, email } = req.user;

    const dbUser = await User.findById(userId); // ← use findById directly
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      assistantName,
      businessName,
      industry,
      assistantTone,
      theme,
      enableVoice,
      enableNavigation,
      pages,
      geminiApiKey,
    } = req.body;

    if (!assistantName || !businessName || !industry) {
      return res.status(400).json({
        message: "assistantName, businessName, and industry are required.",
      });
    }

    const assistant = await Assistant.findOneAndUpdate(
      { userId: dbUser._id },
      {
        $set: {
          userId: dbUser._id,
          uid: dbUser.uid || "",   // keep field but don't rely on JWT for it
          name: name || dbUser.name,
          email: email || dbUser.email,
          assistantName,
          businessName,
          industry,
          assistantTone: assistantTone || "friendly",
          theme: theme || "dark",
          enableVoice: enableVoice !== undefined ? enableVoice : true,
          enableNavigation: enableNavigation !== undefined ? enableNavigation : true,
          pages: pages || [],
          geminiApiKey: geminiApiKey || "",
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Assistant saved successfully.",
      assistant,
    });
  } catch (error) {
    console.error("createAssistant error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET /api/user/assistant ─────────────────────────────────────────────────
// Returns the assistant that belongs to the authenticated user.
export const getAssistant = async (req, res) => {
  try {
    const { userId } = req.user; // ← was uid

    const assistant = await Assistant.findOne({ userId });
    if (!assistant) {
      return res.status(404).json({ message: "No assistant found." });
    }

    return res.status(200).json({ assistant });
  } catch (error) {
    console.error("getAssistant error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




// ─── PATCH /api/user/assistant/complete ──────────────────────────────────────
// Mark setup as complete (called on final deploy step).
export const markSetupComplete = async (req, res) => {
  try {
    const { userId } = req.user; // ← was uid

    const assistant = await Assistant.findOneAndUpdate(
      { userId },
      { $set: { isSetupComplete: true } },
      { new: true }
    );

    if (!assistant) {
      return res.status(404).json({ message: "No assistant found." });
    }

    return res.status(200).json({ message: "Setup marked complete.", assistant });
  } catch (error) {
    console.error("markSetupComplete error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
