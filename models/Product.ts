// @/models/Product.ts
import mongoose, { Document, Model } from "mongoose";

export interface IProduk extends Document {
  nama: string;
  kodeSku: string;
  deskripsi?: string;
  satuan: string;
  hargaJual: number;
  aktif: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProdukSchema = new mongoose.Schema<IProduk>(
  {
    nama: { type: String, required: true },
    kodeSku: { type: String, unique: true, required: true },
    deskripsi: { type: String },
    satuan: { type: String, default: "M³" },
    hargaJual: { type: Number, default: 0 },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Product: Model<IProduk> =
  mongoose.models.Product || mongoose.model<IProduk>("Product", ProdukSchema);

export default Product;
