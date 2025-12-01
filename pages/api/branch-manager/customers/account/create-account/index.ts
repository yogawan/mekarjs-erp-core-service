// @/pages/api/branch-manager/customers/account/create-account/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Customer from "@/models/Customer";
import { mongoConnect } from "@/lib/mongoConnect";
import { hashPassword } from "@/lib/auth";
import { enableCors } from "@/middleware/enableCors";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await mongoConnect();

    const { nama, email, password, alamat } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    // Cek apakah email sudah ada
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Buat customer baru
    const customer = await Customer.create({
      nama,
      email,
      password: hashedPassword,
      alamat: alamat || "",
    });

    // Jangan return password
    const customerResponse = {
      _id: customer._id,
      nama: customer.nama,
      email: customer.email,
      alamat: customer.alamat,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
    };

    return res.status(201).json({
      message: "Akun customer berhasil dibuat",
      customer: customerResponse,
    });
  } catch (err) {
    console.error("Create account error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export default enableCors(handler);