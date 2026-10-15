import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Department from "../models/Department.js";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { dateKey } from "./attendance.controller.js";

export const dashboardSummary = asyncHandler(async (req, res) => {
  const today = dateKey();
  if (req.user.role === "employee") {
    const employee = await Employee.findOne({ user: req.user._id });
    const [todayAttendance, recentLeaves, unreadNotifications] =
      await Promise.all([
        employee
          ? Attendance.findOne({ employee: employee._id, date: today })
          : null,
        employee
          ? Leave.find({ employee: employee._id })
              .sort({ createdAt: -1 })
              .limit(5)
          : [],
        Notification.countDocuments({ recipient: req.user._id, readAt: null }),
      ]);
    return res.json({
      success: true,
      summary: { todayAttendance, recentLeaves, unreadNotifications },
    });
  }
  const [
    totalEmployees,
    activeEmployees,
    departments,
    presentToday,
    pendingLeaves,
    approvedLeaves,
    unreadNotifications,
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: "active" }),
    Department.countDocuments({ isActive: true }),
    Attendance.countDocuments({
      date: today,
      status: { $in: ["present", "late", "work_from_home"] },
    }),
    Leave.countDocuments({ status: "pending" }),
    Leave.countDocuments({ status: "approved" }),
    Notification.countDocuments({ recipient: req.user._id, readAt: null }),
  ]);
  res.json({
    success: true,
    summary: {
      totalEmployees,
      activeEmployees,
      departments,
      presentToday,
      pendingLeaves,
      approvedLeaves,
      unreadNotifications,
    },
  });
});
