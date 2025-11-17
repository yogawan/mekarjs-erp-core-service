// @/models/InventoryMovement.ts
import mongoose, { Document, Model } from "mongoose";

export interface IInventoryMovement extends Document {
  produkId: mongoose.Types.ObjectId;
  gudangId: mongoose.Types.ObjectId;
  tipe: "MASUK" | "KELUAR" | "TRANSFER";
  jumlah: number;
  gudangAsalId?: mongoose.Types.ObjectId;
  gudangTujuanId?: mongoose.Types.ObjectId;
  catatan?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PergerakanInventoriSchema = new mongoose.Schema<IInventoryMovement>(
  {
    produkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    gudangId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: function () {
        return this.tipe !== "TRANSFER";
      },
    },

    tipe: {
      type: String,
      enum: ["MASUK", "KELUAR", "TRANSFER"],
      required: true,
    },
    jumlah: { type: Number, required: true },

    gudangAsalId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    gudangTujuanId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },

    catatan: { type: String },
  },
  { timestamps: true },
);

const InventoryMovement: Model<IInventoryMovement> =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>(
    "InventoryMovement",
    PergerakanInventoriSchema,
  );

export default InventoryMovement;
