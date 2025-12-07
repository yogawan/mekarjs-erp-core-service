// @/pages/api/customer/product-showcase/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import "@/models/Branch"
import Product from "@/models/Product";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import { verifyAuth } from "@/middleware/verifyAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    case "GET":
      try {
        const { cabangId } = req.query;
        const query = cabangId ? { cabangId } : {};
        const products = await Product.find(query).populate('cabangId');
        return res.status(200).json({ success: true, data: products });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    default:
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
  }
}

export default enableCors(verifyAuth(handler));
