import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export const listEmployees = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.q) {
    const q = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { firstName: new RegExp(q, "i") },
      { lastName: new RegExp(q, "i") },
      { employeeCode: new RegExp(q, "i") },
    ];
  }
  const [data, total] = await Promise.all([
    Employee.find(filter)
      .populate("user", "name email role isActive")
      .populate("department", "name code")
      .populate("manager", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);
  res.json({
    success: true,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate("manager", "firstName lastName employeeCode");
  if (!employee) throw new HttpError(404, "Employee not found");
  if (
    req.user.role === "employee" &&
    String(employee.user._id) !== String(req.user._id)
  )
    throw new HttpError(403, "You can only view your own record");
  res.json({ success: true, employee });
});
export const createEmployee = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    employeeCode,
    jobTitle,
    department,
    joiningDate,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !employeeCode ||
    !jobTitle ||
    !joiningDate
  )
    throw new HttpError(
      400,
      "firstName, lastName, email, password, employeeCode, jobTitle and joiningDate are required",
    );
  if (String(password).length < 8)
    throw new HttpError(400, "Password must be at least 8 characters");
  if (
    department &&
    !(await Department.exists({ _id: department, isActive: true }))
  )
    throw new HttpError(400, "Department does not exist or is inactive");
  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    password,
    role:
      req.body.role === "hr" && req.user.role === "admin" ? "hr" : "employee",
  });
  try {
    const employee = await Employee.create({
      employeeCode,
      user: user._id,
      firstName,
      lastName,
      phone: req.body.phone || "",
      jobTitle,
      department: department || null,
      manager: req.body.manager || null,
      joiningDate,
      employmentType: req.body.employmentType || "full_time",
      workLocation: req.body.workLocation || "",
    });
    user.employee = employee._id;
    await user.save();
    res
      .status(201)
      .json({ success: true, message: "Employee created", employee });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
});
export const updateEmployee = asyncHandler(async (req, res) => {
  const allowed = [
    "firstName",
    "lastName",
    "phone",
    "address",
    "jobTitle",
    "department",
    "manager",
    "joiningDate",
    "employmentType",
    "status",
    "workLocation",
    "avatarUrl",
  ];
  const updates = {};
  for (const key of allowed)
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  ).populate("department", "name code");
  if (!employee) throw new HttpError(404, "Employee not found");
  if (req.body.firstName !== undefined || req.body.lastName !== undefined) {
    await User.findByIdAndUpdate(employee.user, {
      name: `${employee.firstName} ${employee.lastName}`,
    });
  }
  res.json({ success: true, message: "Employee updated", employee });
});
export const setEmployeeStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== "boolean")
    throw new HttpError(400, "isActive must be a boolean");
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new HttpError(404, "Employee not found");
  await User.findByIdAndUpdate(employee.user, { isActive });
  employee.status = isActive ? "active" : "inactive";
  await employee.save();
  res.json({
    success: true,
    message: "Employee account status updated",
    employee,
  });
});


export const changeEmployeeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["employee", "hr"].includes(role)) {
    throw new HttpError(400, "Role must be employee or hr");
  }

  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    throw new HttpError(404, "Employee not found");
  }

  const userId = employee.user?._id || employee.user;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { new: true, runValidators: true }
  ).select("name email role isActive");

  if (!user) {
    throw new HttpError(404, "Employee account not found");
  }

  res.json({
    success: true,
    message: `Employee role updated to ${role}`,
    user,
  });
});