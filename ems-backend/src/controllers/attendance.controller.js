import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

const dateKey = (date = new Date()) => {
  const y = date.getFullYear(),
    m = String(date.getMonth() + 1).padStart(2, "0"),
    d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
async function ownEmployee(req) {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new HttpError(404, "Employee profile not found");
  return employee;
}
export const checkIn = asyncHandler(async (req, res) => {
  const employee = await ownEmployee(req);
  const workLocation = req.body.workLocation || "office";
  if (!["office", "remote"].includes(workLocation))
    throw new HttpError(400, "workLocation must be office or remote");
  const date = dateKey();
  let record = await Attendance.findOne({ employee: employee._id, date });
  if (record?.checkIn)
    throw new HttpError(409, "You have already checked in today");
  if (!record) record = new Attendance({ employee: employee._id, date });
  record.checkIn = new Date();
  record.workLocation = workLocation;
  record.status = workLocation === "remote" ? "work_from_home" : "present";
  await record.save();
  res
    .status(201)
    .json({ success: true, message: "Checked in", attendance: record });
});
export const checkOut = asyncHandler(async (req, res) => {
  const employee = await ownEmployee(req);
  const record = await Attendance.findOne({
    employee: employee._id,
    date: dateKey(),
  });
  if (!record?.checkIn)
    throw new HttpError(400, "Check in before checking out");
  if (record.checkOut) throw new HttpError(409, "You have already checked out");
  record.checkOut = new Date();
  await record.save();
  res.json({ success: true, message: "Checked out", attendance: record });
});
export const myAttendance = asyncHandler(async (req, res) => {
  const employee = await ownEmployee(req);
  const { page, limit, skip } = getPagination(req.query);
  const filter = { employee: employee._id };
  if (req.query.from || req.query.to)
    filter.date = {
      ...(req.query.from ? { $gte: req.query.from } : {}),
      ...(req.query.to ? { $lte: req.query.to } : {}),
    };
  const [data, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
  ]);
  res.json({
    success: true,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const listAttendance = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.employee) filter.employee = req.query.employee;
  if (req.query.from || req.query.to)
    filter.date = {
      ...(req.query.from ? { $gte: req.query.from } : {}),
      ...(req.query.to ? { $lte: req.query.to } : {}),
    };
  if (req.query.status) filter.status = req.query.status;
  const [data, total] = await Promise.all([
    Attendance.find(filter)
      .populate("employee", "employeeCode firstName lastName department")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);
  res.json({
    success: true,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const correctAttendance = asyncHandler(async (req, res) => {
  const allowed = ["checkIn", "checkOut", "status", "workLocation", "notes"];
  const updates = {};
  for (const key of allowed)
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  updates.correctedBy = req.user._id;
  const record = await Attendance.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!record) throw new HttpError(404, "Attendance record not found");
  res.json({ success: true, attendance: record });
});
export { dateKey };
