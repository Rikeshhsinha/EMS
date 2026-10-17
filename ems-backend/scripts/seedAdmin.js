import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";

try {
  await connectDB();
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password || password.length < 12) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters) in the environment");
  }
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists; no changes made.");
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log(`Admin created: ${email}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
