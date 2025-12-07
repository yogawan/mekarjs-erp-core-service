// @/pages/api/customer/payment/history/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Transaction from "@/models/Transaction";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import { verifyAuth } from "@/middleware/verifyAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    case "GET":
      try {
        const customerId = (req as any).user.id; // Dari verifyAuth middleware

        // Ambil history transaksi customer
        const transactions = await Transaction.find({ customerId })
          .populate("productId")
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          data: transactions,
        });
      } catch (err: any) {
        console.error("Error fetching transaction history:", err);
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
