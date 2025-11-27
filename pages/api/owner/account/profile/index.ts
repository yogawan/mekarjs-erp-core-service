// @/pages/api/owner/account/profile/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Owner from "@/models/Owner";
import { mongoConnect } from "@/lib/mongoConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await mongoConnect();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "owner") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const owner = await Owner.findById(decoded.id).select("-password");
    if (!owner) {
      return res.status(404).json({ message: "Owner tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Profile berhasil diambil",
      owner,
    });
  } catch (err) {
    console.error("Owner Profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}