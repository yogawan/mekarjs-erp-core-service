// @/pages/api/inventory-movement/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import InventoryMovement from "@/models/InventoryMovement";
import { mongoConnect } from "@/lib/mongoConnect";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    case "GET":
      try {
        const data = await InventoryMovement.find()
          .populate("produkId")
          .populate("gudangId")
          .populate("gudangAsalId")
          .populate("gudangTujuanId");

        return res.status(200).json({ success: true, data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    case "POST":
      try {
        const body = req.body;

        if (
          body.tipe === "TRANSFER" &&
          (!body.gudangAsalId || !body.gudangTujuanId)
        ) {
          return res.status(400).json({
            success: false,
            message: "TRANSFER membutuhkan gudangAsalId dan gudangTujuanId",
          });
        }

        const newMovement = await InventoryMovement.create(body);

        return res.status(201).json({ success: true, data: newMovement });
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
