// @/models/Warehouse.ts
import mongoose, { Document, Model } from "mongoose";

export interface IGudang extends Document {
  nama: string;
  kode: string;
  alamat?: string;
  deskripsi?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const GudangSchema = new mongoose.Schema<IGudang>(
  {
    nama: { type: String, required: true },
    kode: { type: String, unique: true, required: true },
    alamat: { type: String },
    deskripsi: { type: String },
  },
  { timestamps: true },
);

const Warehouse: Model<IGudang> =
  mongoose.models.Warehouse ||
  mongoose.model<IGudang>("Warehouse", GudangSchema);

export default Warehouse;
