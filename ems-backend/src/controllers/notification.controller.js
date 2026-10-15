import Notification from "../models/Notification.js";
import User from "../models/User.js";
import HttpError from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { recipient: req.user._id };
  if (req.query.unread === "true") filter.readAt = null;
  const [data, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, readAt: null }),
  ]);
  res.json({
    success: true,
    unreadCount,
    ...paginatedResponse({ page, limit, total, data }),
  });
});
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true },
  );
  if (!notification) throw new HttpError(404, "Notification not found");
  res.json({ success: true, notification });
});
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, readAt: null },
    { $set: { readAt: new Date() } },
  );
  res.json({ success: true, message: "All notifications marked as read" });
});
export const createNotification = asyncHandler(async (req, res) => {
  const { recipient, title, message } = req.body;
  if (!recipient || !title || !message)
    throw new HttpError(400, "recipient, title and message are required");
  if (!(await User.exists({ _id: recipient, isActive: true })))
    throw new HttpError(404, "Active recipient not found");
  const notification = await Notification.create({
    recipient,
    title,
    message,
    type: req.body.type || "info",
    link: req.body.link || "",
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, notification });
});
