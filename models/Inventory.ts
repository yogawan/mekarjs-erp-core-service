// @/models/Inventory.ts
import mongoose, { Document, Model } from "mongoose";

export interface IInventory extends Document {
  produkId: mongoose.Types.ObjectId;
  gudangId: mongoose.Types.ObjectId;
  jumlah: number;
  stokMinimum: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const InventoriSchema = new mongoose.Schema<IInventory>(
  {
    produkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    gudangId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    jumlah: { type: Number, default: 0 },
    stokMinimum: { type: Number, default: 0 },
  },
  { timestamps: true },
);

InventoriSchema.index({ produkId: 1, gudangId: 1 }, { unique: true });

const Inventory: Model<IInventory> =
  mongoose.models.Inventory ||
  mongoose.model<IInventory>("Inventory", InventoriSchema);

export default Inventory;
