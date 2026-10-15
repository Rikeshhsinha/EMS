import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD in the configured business timezone
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    status: {
      type: String,
      enum: [
        "present",
        "late",
        "half_day",
        "absent",
        "work_from_home",
        "on_leave",
      ],
      default: "present",
    },
    workLocation: { type: String, enum: ["office", "remote"], default: "office" },
    notes: { type: String, default: "" },
    correctedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
export default mongoose.model("Attendance", attendanceSchema);
