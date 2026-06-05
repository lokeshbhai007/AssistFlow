import User from "../models/user.model.js";

export const getAllTenants = async (req, res) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    return res.status(200).json({ users, total: users.length });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};