import mongoose, { Document, Model } from "mongoose";

export interface IInventoryForecast extends Document {
  produkId: mongoose.Types.ObjectId;
  gudangId: mongoose.Types.ObjectId;
  stokSaatIni: number;
  permintaanDiprediksi: number;
  tanggalPrediksi: Date;
  periode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PeramalanInventoriSchema = new mongoose.Schema<IInventoryForecast>(
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
    stokSaatIni: { type: Number, required: true },
    permintaanDiprediksi: { type: Number, required: true },
    tanggalPrediksi: { type: Date, default: Date.now },
    periode: { type: String, default: "bulanan" },
  },
  { timestamps: true },
);

const InventoryForecast: Model<IInventoryForecast> =
  mongoose.models.InventoryForecast ||
  mongoose.model<IInventoryForecast>(
    "InventoryForecast",
    PeramalanInventoriSchema,
  );

export default InventoryForecast;
