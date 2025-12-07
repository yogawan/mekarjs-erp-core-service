// @/lib/mongoConnect.ts
import mongoose from "mongoose";

// Import all models to ensure they are registered
import "@/models/Branch";
import "@/models/BranchManager";
import "@/models/Customer";
import "@/models/Inventory";
import "@/models/InventoryForecast";
import "@/models/InventoryMovement";
import "@/models/Otp";
import "@/models/Owner";
import "@/models/Product";
import "@/models/Purchase";
import "@/models/Sale";
import "@/models/Supplier";
import "@/models/Warehouse";
import "@/models/Transaction";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function mongoConnect() {
  if (cached.conn) {
    console.log("Atlas MongoDB Already Connected");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {})
      .then((mongoose) => {
        console.log("Atlas MongoDB Connected Successfully");
        return mongoose;
      })
      .catch((err) => {
        console.error("Atlas MongoDB Connection Failed:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}