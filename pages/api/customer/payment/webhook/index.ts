// @/pages/api/customer/payment/webhook/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Transaction from "@/models/Transaction";
import { mongoConnect } from "@/lib/mongoConnect";
import crypto from "crypto";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    // Connect to MongoDB
    await mongoConnect();

    const notification = req.body;

    // Handle test notification (empty body)
    if (!notification || Object.keys(notification).length === 0) {
      console.log("Test notification received from Midtrans");
      return res.status(200).json({
        success: true,
        message: "Webhook endpoint is working",
      });
    }

    console.log("Webhook notification received:", JSON.stringify(notification, null, 2));

    // Validate required fields
    if (!notification.order_id || !notification.status_code || !notification.gross_amount) {
      console.error("Missing required fields in notification");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const orderId = notification.order_id;

    // Handle test notification from Midtrans
    if (orderId.startsWith("payment_notif_test_")) {
      console.log("Test notification from Midtrans:", orderId);
      return res.status(200).json({
        success: true,
        message: "Test notification received",
      });
    }

    // Verifikasi signature hash dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    // Generate signature hash
    const signatureKey = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    console.log("Signature verification:", {
      received: notification.signature_key,
      calculated: signatureKey,
      match: signatureKey === notification.signature_key,
    });

    // Verifikasi signature
    if (signatureKey !== notification.signature_key) {
      console.error("Invalid signature detected");
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Cari transaksi berdasarkan order_id
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      console.error(`Transaction not found for order_id: ${orderId}`);
      // Return 200 agar Midtrans tidak retry terus-menerus
      return res.status(200).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update status transaksi berdasarkan notification
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let paymentStatus: "pending" | "settlement" | "cancel" | "deny" | "expire" | "failure" = transaction.paymentStatus;

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        paymentStatus = "settlement";
      } else {
        paymentStatus = "failure";
      }
    } else if (transactionStatus === "settlement") {
      paymentStatus = "settlement";
    } else if (transactionStatus === "cancel") {
      paymentStatus = "cancel";
    } else if (transactionStatus === "deny") {
      paymentStatus = "deny";
    } else if (transactionStatus === "expire") {
      paymentStatus = "expire";
    } else if (transactionStatus === "failure") {
      paymentStatus = "failure";
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

    console.log(`Webhook processed successfully - Order: ${orderId}, Status: ${paymentStatus}`);

    return res.status(200).json({
      success: true,
      message: "Notification processed successfully",
    });
  } catch (err: any) {
    console.error("Error processing webhook:", err);
    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  }
}

export default handler;
