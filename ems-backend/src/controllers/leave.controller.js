import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

const day = 24 * 60 * 60 * 1000;
export const applyLeave = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new HttpError(404, "Employee profile not found");
  const { leaveType, startDate, endDate, reason } = req.body;
  const allowedLeaveTypes = [
    "casual",
    "sick",
    "earned",
    "unpaid",
    "maternity",
    "paternity",
    "other",
  ];
  if (!leaveType || !startDate || !endDate || !reason)
    throw new HttpError(
      400,
      "leaveType, startDate, endDate and reason are required",
    );
  if (!allowedLeaveTypes.includes(leaveType))
    throw new HttpError(400, "Invalid leave type");
  const normalizedReason = String(reason).trim();
  if (!normalizedReason || normalizedReason.length > 1000)
    throw new HttpError(400, "Reason must be between 1 and 1000 characters");
  const start = new Date(startDate),
    end = new Date(endDate);
  if (Number.isNaN(+start) || Number.isNaN(+end) || end < start)
    throw new HttpError(400, "Invalid leave date range");
  if (start < new Date(new Date().setHours(0, 0, 0, 0)))
    throw new HttpError(400, "Leave start date cannot be in the past");
  const overlap = await Leave.exists({
    employee: employee._id,
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: end },
    endDate: { $gte: start },
  });
  if (overlap)
    throw new HttpError(
      409,
      "You already have a pending or approved leave in this date range",
    );
  const leave = await Leave.create({
    employee: employee._id,
    leaveType,
    startDate: start,
    endDate: end,
    reason: normalizedReason,
  });
  const reviewers = await User.find({
    role: { $in: ["admin", "hr"] },
    isActive: true,
  }).select("_id");
  if (reviewers.length)
    await Notification.insertMany(
      reviewers.map((u) => ({
        recipient: u._id,
        title: "New leave request",
        message: `${employee.firstName} ${employee.lastName} submitted a leave request`,
        type: "leave",
        link: "/leaves",
      })),
    );
  res
    .status(201)
    .json({ success: true, message: "Leave request submitted", leave });
});
export const myLeaves = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new HttpError(404, "Employee profile not found");
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Leave.find({ employee: employee._id })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments({ employee: employee._id }),
  ]);
  res.json({
    success: true,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const listLeaves = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.employee) filter.employee = req.query.employee;
  const [data, total] = await Promise.all([
    Leave.find(filter)
      .populate("employee", "employeeCode firstName lastName department")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);
  res.json({
    success: true,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const decideLeave = asyncHandler(async (req, res) => {
  const { decision, reviewComment = "" } = req.body;
  if (!["approved", "rejected"].includes(decision))
    throw new HttpError(400, "decision must be approved or rejected");
  const leave = await Leave.findById(req.params.id).populate(
    "employee",
    "user firstName lastName",
  );
  if (!leave) throw new HttpError(404, "Leave request not found");
  if (leave.status !== "pending")
    throw new HttpError(409, "Only pending leave requests can be reviewed");
  if (decision === "approved") {
    const conflict = await Leave.exists({
      _id: { $ne: leave._id },
      employee: leave.employee._id,
      status: "approved",
      startDate: { $lte: leave.endDate },
      endDate: { $gte: leave.startDate },
    });
    if (conflict)
      throw new HttpError(
        409,
        "This request overlaps with another approved leave",
      );
  }
  leave.status = decision;
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  leave.reviewComment = String(reviewComment).slice(0, 1000);
  await leave.save();
  const employeeUser = await User.findById(leave.employee.user);
  if (employeeUser)
    await Notification.create({
      recipient: employeeUser._id,
      title: `Leave ${decision}`,
      message: `Your leave request was ${decision}`,
      type: "leave",
      link: "/my-leaves",
      createdBy: req.user._id,
    });
  res.json({ success: true, message: `Leave ${decision}`, leave });
});
export const cancelLeave = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new HttpError(404, "Employee profile not found");
  const leave = await Leave.findOne({
    _id: req.params.id,
    employee: employee._id,
  });
  if (!leave) throw new HttpError(404, "Leave request not found");
  if (leave.status !== "pending")
    throw new HttpError(409, "Only pending leave requests can be cancelled");
  leave.status = "cancelled";
  await leave.save();
  res.json({ success: true, message: "Leave request cancelled", leave });
});
