import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HttpError from "../utils/httpError.js";

function dateRange(query) {
  const from = query.from || `${new Date().getFullYear()}-01-01`;
  const to = query.to || new Date().toISOString().slice(0, 10);
  if (
    Number.isNaN(Date.parse(from)) ||
    Number.isNaN(Date.parse(to)) ||
    from > to
  )
    throw new HttpError(400, "Valid from/to date range is required");
  return { from, to };
}
export const attendanceReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req.query);
  const match = { date: { $gte: from, $lte: to } };
  if (req.query.employee) match.employee = req.query.employee;
  const data = await Attendance.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, range: { from, to }, data });
});
export const leaveReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req.query);
  const data = await Leave.aggregate([
    {
      $match: {
        startDate: { $lte: new Date(`${to}T23:59:59.999Z`) },
        endDate: { $gte: new Date(`${from}T00:00:00.000Z`) },
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, range: { from, to }, data });
});
export const employeeReport = asyncHandler(async (_req, res) => {
  const [byDepartment, byStatus, recentHires] = await Promise.all([
    Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]),
    Employee.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Employee.find()
      .sort({ joiningDate: -1 })
      .limit(10)
      .select(
        "employeeCode firstName lastName jobTitle joiningDate department",
      ),
  ]);
  res.json({ success: true, data: { byDepartment, byStatus, recentHires } });
});
