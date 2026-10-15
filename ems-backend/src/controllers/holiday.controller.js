import Holiday from "../models/Holiday.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export const listHolidays = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.year) {
    const year = Number(req.query.year);
    if (!Number.isInteger(year) || year < 2000 || year > 2200)
      throw new HttpError(400, "Invalid year");
    filter.date = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
    };
  }
  const [data, total] = await Promise.all([
    Holiday.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
    Holiday.countDocuments(filter),
  ]);
  res.json({
    success: true,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const createHoliday = asyncHandler(async (req, res) => {
  const { name, date } = req.body;
  if (!name || !date || Number.isNaN(+new Date(date)))
    throw new HttpError(400, "Valid holiday name and date are required");
  const holiday = await Holiday.create({
    name,
    date,
    description: req.body.description || "",
    location: req.body.location || "All",
    isOptional: Boolean(req.body.isOptional),
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, holiday });
});
export const updateHoliday = asyncHandler(async (req, res) => {
  const allowed = ["name", "date", "description", "location", "isOptional"];
  const updates = {};
  for (const key of allowed)
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  const holiday = await Holiday.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!holiday) throw new HttpError(404, "Holiday not found");
  res.json({ success: true, holiday });
});
export const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);
  if (!holiday) throw new HttpError(404, "Holiday not found");
  res.json({ success: true, message: "Holiday deleted" });
});
