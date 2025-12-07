// @/pages/api/customer/payment/create-link/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Product";
import Transaction from "@/models/Transaction";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import { verifyAuth } from "@/middleware/verifyAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    case "POST":
      try {
        const { productId, quantity = 1 } = req.body;
        const customerId = (req as any).user.id; // Dari verifyAuth middleware

        // Validasi input
        if (!productId) {
          return res.status(400).json({
            success: false,
            message: "Product ID is required",
          });
        }

        // Ambil data produk
        const product = await Product.findById(productId).populate("cabangId");
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        // Hitung total amount
        const grossAmount = product.hargaJual * quantity;

        // Generate unique order ID
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Buat transaksi di database
        const transaction = await Transaction.create({
          orderId,
          customerId,
          productId,
          quantity,
          grossAmount,
          paymentStatus: "pending",
        });

        // Setup Midtrans API
        const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
        
        if (!midtransServerKey) {
          return res.status(500).json({
            success: false,
            message: "Midtrans server key not configured",
          });
        }

        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
        const midtransUrl = isProduction
          ? "https://api.midtrans.com/v1/payment-links"
          : "https://api.sandbox.midtrans.com/v1/payment-links";

        // Encode server key untuk basic auth (server_key:)
        const authString = Buffer.from(`${midtransServerKey}:`).toString("base64");

        // Request body untuk Midtrans
        const midtransBody = {
          transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
          },
          customer_required: true,
          item_details: [
            {
              id: product._id.toString(),
              name: product.nama,
              price: product.hargaJual,
              quantity: quantity,
            },
          ],
          usage_limit: 1,
        };

        // Call Midtrans API
        const midtransResponse = await fetch(midtransUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${authString}`,
          },
          body: JSON.stringify(midtransBody),
        });

        const midtransData = await midtransResponse.json();

        if (!midtransResponse.ok) {
          console.error("Midtrans API Error:", {
            status: midtransResponse.status,
            statusText: midtransResponse.statusText,
            error: midtransData,
            serverKey: midtransServerKey ? "Present" : "Missing",
            authStringLength: authString.length,
          });
          
          // Hapus transaksi jika gagal create payment link
          await Transaction.findByIdAndDelete(transaction._id);
          return res.status(midtransResponse.status).json({
            success: false,
            message: "Failed to create payment link",
            error: midtransData,
          });
        }

        // Update transaksi dengan payment URL
        transaction.paymentUrl = midtransData.payment_url;
        await transaction.save();

        return res.status(201).json({
          success: true,
          message: "Payment link created successfully",
          data: {
            orderId: transaction.orderId,
            paymentUrl: transaction.paymentUrl,
            grossAmount: transaction.grossAmount,
            product: {
              id: product._id,
              nama: product.nama,
              kodeSku: product.kodeSku,
              hargaJual: product.hargaJual,
            },
            quantity: transaction.quantity,
          },
        });
      } catch (err: any) {
        console.error("Error creating payment link:", err);
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

export default enableCors(verifyAuth(handler));
