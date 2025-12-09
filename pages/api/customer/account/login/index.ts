// @/pages/api/auth/customer/login/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Customer from "@/models/Customer";
import { mongoConnect } from "@/lib/mongoConnect";
import { comparePassword, generateToken } from "@/lib/auth";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await mongoConnect();

  const { email, password } = req.body;

  const user = await Customer.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Akun tidak ditemukan" });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Password salah" });
  }

  const token = generateToken({ id: user._id, role: "customer" });

  return res.status(200).json({
    message: "Login berhasil",
    token,
    customer: user,
  });
}

export default enableCors(handler);