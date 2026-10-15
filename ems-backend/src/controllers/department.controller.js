import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export const listDepartments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.user.role === "employee" ? { isActive: true } : {};
  const [data, total] = await Promise.all([
    Department.find(filter)
      .populate("manager", "firstName lastName employeeCode")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Department.countDocuments(filter),
  ]);
  res.json({
    success: true,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code)
    throw new HttpError(400, "Department name and code are required");
  const department = await Department.create({
    name,
    code,
    description: req.body.description || "",
    manager: req.body.manager || null,
  });
  res.status(201).json({ success: true, department });
});
export const updateDepartment = asyncHandler(async (req, res) => {
  const allowed = ["name", "code", "description", "manager", "isActive"];
  const updates = {};
  for (const key of allowed)
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  if (updates.manager && !(await Employee.exists({ _id: updates.manager })))
    throw new HttpError(400, "Manager employee not found");
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!department) throw new HttpError(404, "Department not found");
  res.json({ success: true, department });
});
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new HttpError(404, "Department not found");
  if (
    await Employee.exists({
      department: department._id,
      status: { $ne: "terminated" },
    })
  )
    throw new HttpError(
      409,
      "Reassign employees before deactivating this department",
    );
  department.isActive = false;
  await department.save();
  res.json({ success: true, message: "Department deactivated" });
});
