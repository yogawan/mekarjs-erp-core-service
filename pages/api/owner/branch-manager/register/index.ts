import type { NextApiRequest, NextApiResponse } from "next";
import BranchManager from "@/models/BranchManager";
import { mongoConnect } from "@/lib/mongoConnect";
import { hashPassword } from "@/lib/auth";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await mongoConnect();

    const { nama, email, password, cabangId } = req.body;

    if (!nama || !email || !password || !cabangId) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const exist = await BranchManager.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await hashPassword(password);

    const manager = await BranchManager.create({
      nama,
      email,
      password: hashed,
      cabangId,
    });

    return res.status(201).json({
      message: "Branch Manager berhasil didaftarkan",
      manager,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export default enableCors(handler);