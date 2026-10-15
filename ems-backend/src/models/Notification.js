import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ["info", "success", "warning", "leave", "attendance", "system"],
      default: "info",
    },
    link: { type: String, default: "" },
    readAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);
notificationSchema.index({ recipient: 1, createdAt: -1 });
export default mongoose.model("Notification", notificationSchema);
