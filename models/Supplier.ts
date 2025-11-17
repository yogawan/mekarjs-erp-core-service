// @/models/Supplier.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  materialsSupplied?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema<ISupplier> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    materialsSupplied: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Supplier: Model<ISupplier> =
  mongoose.models.Supplier ||
  mongoose.model<ISupplier>("Supplier", SupplierSchema);

export default Supplier;