import type { NextApiRequest, NextApiResponse } from "next";
import BranchManager from "@/models/BranchManager";
import Branch from "@/models/Branch";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await mongoConnect();

  if (req.method === "GET") {
    try {
      const managers = await BranchManager.find().populate("cabangId").lean();

      return res.status(200).json({
        message: "Berhasil mengambil data branch manager",
        managers,
      });
    } catch (err) {
      console.error("Error get branch managers:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}

export default enableCors(handler);