// @/pages/api/inventory/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";
import Inventory from "@/models/Inventory";
import { mongoConnect } from "@/lib/mongoConnect";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    /**
     * GET - Ambil semua inventory
     */
    case "GET":
      try {
        const inventory = await Inventory.find()
          .populate("produkId")
          .populate("gudangId");

        return res.status(200).json({ success: true, data: inventory });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    /**
     * POST - Tambah inventory
     */
    case "POST":
      try {
        const exists = await Inventory.findOne({
          produkId: req.body.produkId,
          gudangId: req.body.gudangId,
        });

        if (exists) {
          return res.status(400).json({
            success: false,
            message: "Inventory untuk produk & gudang ini sudah ada",
          });
        }

        const newData = await Inventory.create(req.body);

        return res.status(201).json({ success: true, data: newData });
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
