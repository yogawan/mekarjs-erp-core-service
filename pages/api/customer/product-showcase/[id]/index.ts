// @/pages/api/customer/product-showcase/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import "@/models/Branch"
import Product from "@/models/Product";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import { verifyAuth } from "@/middleware/verifyAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const product = await Product.findById(id).populate('cabangId');
        if (!product)
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });
        return res.status(200).json({ success: true, data: product });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    default:
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
  }
}

export default enableCors(verifyAuth(handler));
