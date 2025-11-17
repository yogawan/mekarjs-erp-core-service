// @/pages/api/inventory-forecast/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import InventoryForecast from "@/models/InventoryForecast";
import { mongoConnect } from "@/lib/mongoConnect";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const data = await InventoryForecast.findById(id)
          .populate("produkId")
          .populate("gudangId");

        if (!data)
          return res
            .status(404)
            .json({ success: false, message: "Forecast not found" });

        return res.status(200).json({ success: true, data });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    case "PUT":
      try {
        const updated = await InventoryForecast.findByIdAndUpdate(
          id,
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );

        if (!updated)
          return res
            .status(404)
            .json({ success: false, message: "Forecast not found" });

        return res.status(200).json({ success: true, data: updated });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
      }

    case "DELETE":
      try {
        const deleted = await InventoryForecast.findByIdAndDelete(id);

        if (!deleted)
          return res
            .status(404)
            .json({ success: false, message: "Forecast not found" });

        return res
          .status(200)
          .json({ success: true, message: "Forecast deleted successfully" });
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
