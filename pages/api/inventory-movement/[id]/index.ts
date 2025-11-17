// @/pages/api/inventory-movement/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import InventoryMovement from "@/models/InventoryMovement";
import { mongoConnect } from "@/lib/mongoConnect";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const data = await InventoryMovement.findById(id)
          .populate("produkId")
          .populate("gudangId")
          .populate("gudangAsalId")
          .populate("gudangTujuanId");

        if (!data)
          return res
            .status(404)
            .json({ success: false, message: "Movement not found" });

        return res.status(200).json({ success: true, data });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    case "PUT":
      try {
        const body = req.body;

        if (
          body.tipe === "TRANSFER" &&
          (!body.gudangAsalId || !body.gudangTujuanId)
        ) {
          return res.status(400).json({
            success: false,
            message: "TRANSFER membutuhkan gudangAsalId & gudangTujuanId",
          });
        }

        const updated = await InventoryMovement.findByIdAndUpdate(id, body, {
          new: true,
          runValidators: true,
        });

        if (!updated)
          return res
            .status(404)
            .json({ success: false, message: "Movement not found" });

        return res.status(200).json({ success: true, data: updated });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    case "DELETE":
      try {
        const deleted = await InventoryMovement.findByIdAndDelete(id);

        if (!deleted)
          return res
            .status(404)
            .json({ success: false, message: "Movement not found" });

        return res.status(200).json({
          success: true,
          message: "Movement deleted successfully",
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
