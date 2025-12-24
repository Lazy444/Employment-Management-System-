// userSeed.js  (ESM version)
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config(); // load .env

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/EMS";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: "admin@ems.com" });

    if (existingAdmin) {
      console.log("ℹ️ Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = await User.create({
      name: "EMS Admin",
      email: "admin@ems.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin user created:", adminUser.email);
    process.exit(0);
  } catch (err) {
    console.error(" Seeding error:", err);
    process.exit(1);
  }
}

seedAdmin();