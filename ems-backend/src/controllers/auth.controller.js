import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions, clearCookieOptions } from "../utils/cookies.js";

function signToken(userId) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error("JWT_SECRET must be at least 32 characters");
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    employee: user.employee,
  };
}
export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password)
    throw new HttpError(400, "Email and password are required");
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    throw new HttpError(401, "Invalid email or password");
  if (!user.isActive) throw new HttpError(403, "Your account is inactive");
  res.cookie(
    process.env.COOKIE_NAME || "ems_token",
    signToken(user._id),
    cookieOptions(),
  );
  res.json({
    success: true,
    message: "Login successful",
    user: publicUser(user),
  });
});
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || "ems_token", clearCookieOptions());
  res.json({ success: true, message: "Logged out successfully" });
});
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || String(newPassword).length < 8)
    throw new HttpError(
      400,
      "Provide current password and a new password of at least 8 characters",
    );
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword)))
    throw new HttpError(400, "Current password is incorrect");
  user.password = newPassword;
  await user.save();
  res.clearCookie(process.env.COOKIE_NAME || "ems_token", clearCookieOptions());
  res.json({
    success: true,
    message: "Password changed. Please log in again.",
  });
});
export const createUserAccount = async ({
  name,
  email,
  password,
  role,
  employee,
}) => {
  return User.create({ name, email, password, role, employee });
};
