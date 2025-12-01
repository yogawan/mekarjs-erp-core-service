// @/pages/api/auth/owner/register/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Owner from "@/models/Owner";
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

    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const exist = await Owner.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await hashPassword(password);

    const owner = await Owner.create({
      nama,
      email,
      password: hashed,
    });

    return res.status(201).json({
      message: "Owner berhasil didaftarkan",
      owner,
    });
  } catch (err) {
    console.error("Owner Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export default enableCors(handler);