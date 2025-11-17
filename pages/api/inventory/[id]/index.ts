// @/pages/api/inventory/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";
import Inventory from "@/models/Inventory";
import { mongoConnect } from "@/lib/mongoConnect";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();
  const { id } = req.query;

  switch (req.method) {
    /**
     * GET - Detail inventory
     */
    case "GET":
      try {
        const inventory = await Inventory.findById(id)
          .populate("produkId")
          .populate("gudangId");

        if (!inventory)
          return res
            .status(404)
            .json({ success: false, message: "Inventory not found" });

        return res.status(200).json({ success: true, data: inventory });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    /**
     * PUT - Update stok / pindah gudang / edit data inventory
     */
    case "PUT":
      try {
        const updated = await Inventory.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!updated)
          return res
            .status(404)
            .json({ success: false, message: "Inventory not found" });

        return res.status(200).json({ success: true, data: updated });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    /**
     * DELETE - Hapus inventory
     */
    case "DELETE":
      try {
        const deleted = await Inventory.findByIdAndDelete(id);

        if (!deleted)
          return res
            .status(404)
            .json({ success: false, message: "Inventory not found" });

        return res.status(200).json({
          success: true,
          message: "Inventory deleted successfully",
        });
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
