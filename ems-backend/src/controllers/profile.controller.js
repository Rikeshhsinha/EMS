import Employee from "../models/Employee.js";
import User from "../models/User.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id })
    .populate("department", "name code")
    .populate("manager", "firstName lastName employeeCode");
  res.json({ success: true, user: req.user, employee });
});
export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "phone",
    "address",
    "dateOfBirth",
    "gender",
    "workLocation",
    "avatarUrl",
    "emergencyContact",
  ];
  const updates = {};
  for (const key of allowed)
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  const employee = await Employee.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true },
  ).populate("department", "name code");
  if (!employee) throw new HttpError(404, "Employee profile not found");
  if (req.body.name)
    await User.findByIdAndUpdate(
      req.user._id,
      { name: String(req.body.name).trim() },
      { runValidators: true },
    );
  res.json({ success: true, message: "Profile updated", employee });
});
