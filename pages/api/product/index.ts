// @/pages/api/product/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Product";
import { mongoConnect } from "@/lib/mongoConnect";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    case "GET":
      try {
        const products = await Product.find();
        return res.status(200).json({ success: true, data: products });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    case "POST":
      try {
        const product = await Product.create(req.body);
        return res.status(201).json({ success: true, data: product });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    default:
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
  }
}

export default handler;
