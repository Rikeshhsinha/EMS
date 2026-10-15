import mongoose from "mongoose";
const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: [
        "casual",
        "sick",
        "earned",
        "unpaid",
        "maternity",
        "paternity",
        "other",
      ],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    reviewComment: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true },
);
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });
export default mongoose.model("Leave", leaveSchema);
