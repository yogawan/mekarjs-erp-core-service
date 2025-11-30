import type { NextApiRequest, NextApiResponse } from "next";
import BranchManager from "@/models/BranchManager";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await mongoConnect();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const manager = await BranchManager.findById(id)
        .populate("cabangId")
        .lean();

      if (!manager) {
        return res
          .status(404)
          .json({ message: "Branch Manager tidak ditemukan" });
      }

      return res.status(200).json({
        message: "Berhasil mengambil data",
        manager,
      });
    } catch (err) {
      console.error("Error get branch manager by ID:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await BranchManager.findByIdAndDelete(id);

      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Branch Manager tidak ditemukan" });
      }

      return res.status(200).json({
        message: "Branch Manager berhasil dihapus",
        deleted,
      });
    } catch (err) {
      console.error("Error delete branch manager:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}

export default enableCors(handler);