// lib/seedAdmin.js
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
  try {
    // Wait for database connection to complete
    await connectDB();
    
    console.log("✅ Database connected, checking for admin user...");

    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn("⚠ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env.local");
      return { 
        success: false, 
        message: "Admin credentials missing in environment variables" 
      };
    }

    // Check if admin already exists
    const exists = await User.findOne({ email });
    
    if (exists) {
      console.log("ℹ Admin already exists");
      return { 
        success: true, 
        message: "Admin already exists",
        exists: true 
      };
    }

    
    // Create admin user
    const admin = await User.create({
      name: "System Admin",
      email,
      password,
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin seeded correctly");
    return { 
      success: true, 
      message: "Admin seeded successfully",
      email: admin.email,
      role: admin.role 
    };

  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}