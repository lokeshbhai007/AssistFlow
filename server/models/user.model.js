import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    photo: { type: String },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    tenantId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);