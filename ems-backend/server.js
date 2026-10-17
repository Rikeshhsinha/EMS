import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(PORT, () => console.log(`EMS API listening on port ${PORT}`));
} catch (error) {
  console.error("Unable to start EMS API:", error.message);
  process.exit(1);
}
