import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HttpError from "../utils/httpError.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[process.env.COOKIE_NAME || "ems_token"];
  if (!token) throw new HttpError(401, "Please log in to continue");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Session is invalid or expired. Please log in again");
  }
  const user = await User.findById(payload.sub).select("-password");
  if (!user || !user.isActive) throw new HttpError(401, "Account is unavailable");
  req.user = user;
  next();
});
