import mongoose from "mongoose";
const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    description: { type: String, default: "" },
    location: { type: String, default: "All" },
    isOptional: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
holidaySchema.index({ date: 1, name: 1 }, { unique: true });
export default mongoose.model("Holiday", holidaySchema);
