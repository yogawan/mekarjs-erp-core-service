// @/pages/api/customer/payment/webhook/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Transaction from "@/models/Transaction";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import crypto from "crypto";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    case "POST":
      try {
        const notification = req.body;

        // Verifikasi signature hash dari Midtrans
        const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
        const orderId = notification.order_id;
        const statusCode = notification.status_code;
        const grossAmount = notification.gross_amount;

        // Generate signature hash
        const signatureKey = crypto
          .createHash("sha512")
          .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
          .digest("hex");

        // Verifikasi signature
        if (signatureKey !== notification.signature_key) {
          return res.status(401).json({
            success: false,
            message: "Invalid signature",
          });
        }

        // Cari transaksi berdasarkan order_id
        const transaction = await Transaction.findOne({ orderId });
        if (!transaction) {
          return res.status(404).json({
            success: false,
            message: "Transaction not found",
          });
        }

        // Update status transaksi berdasarkan notification
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        let paymentStatus = transaction.paymentStatus;

        if (transactionStatus === "capture") {
          if (fraudStatus === "accept") {
            paymentStatus = "settlement";
          }
        } else if (transactionStatus === "settlement") {
          paymentStatus = "settlement";
        } else if (
          transactionStatus === "cancel" ||
          transactionStatus === "deny" ||
          transactionStatus === "expire"
        ) {
          paymentStatus = transactionStatus as any;
        } else if (transactionStatus === "pending") {
          paymentStatus = "pending";
        }

        // Update transaksi
        transaction.paymentStatus = paymentStatus;
        transaction.transactionStatus = transactionStatus;
        transaction.paymentType = notification.payment_type;
        transaction.transactionId = notification.transaction_id;
        transaction.transactionTime = notification.transaction_time
          ? new Date(notification.transaction_time)
          : undefined;
        transaction.settlementTime = notification.settlement_time
          ? new Date(notification.settlement_time)
          : undefined;

        await transaction.save();

        console.log(`Webhook received for order: ${orderId}, status: ${paymentStatus}`);

        return res.status(200).json({
          success: true,
          message: "Notification processed successfully",
        });
      } catch (err: any) {
        console.error("Error processing webhook:", err);
        return res.status(500).json({
          success: false,
          message: err.message || "Internal server error",
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed",
      });
  }
}

export default enableCors(handler);
