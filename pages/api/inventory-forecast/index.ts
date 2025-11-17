// pages/api/inventory-forecast/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import InventoryForecast from "@/models/InventoryForecast";
import { mongoConnect } from "@/lib/mongoConnect";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  switch (req.method) {
    case "GET":
      try {
        const data = await InventoryForecast.find()
          .populate("produkId")
          .populate("gudangId");

        return res.status(200).json({ success: true, data });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    case "POST":
      try {
        const newData = await InventoryForecast.create(req.body);
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
