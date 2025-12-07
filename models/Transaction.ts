// @/models/Transaction.ts
import mongoose, { Document, Model } from "mongoose";

export interface ITransaction extends Document {
  orderId: string;
  customerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  grossAmount: number;
  paymentUrl?: string;
  paymentStatus: "pending" | "settlement" | "cancel" | "deny" | "expire" | "failure";
  transactionStatus?: string;
  paymentType?: string;
  transactionId?: string;
  transactionTime?: Date;
  settlementTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    orderId: { type: String, required: true, unique: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, default: 1 },
    grossAmount: { type: Number, required: true },
    paymentUrl: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "settlement", "cancel", "deny", "expire", "failure"],
      default: "pending",
    },
    transactionStatus: { type: String },
    paymentType: { type: String },
    transactionId: { type: String },
    transactionTime: { type: Date },
    settlementTime: { type: Date },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
