// @/pages/api/customer/account/profile/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Customer from "@/models/Customer";
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

    if (decoded.role !== "customer") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Profile berhasil diambil",
      customer,
    });
  } catch (err) {
    console.error("Customer Profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}