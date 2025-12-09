// @/pages/api/auth/customer/verify-otp/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Otp from "@/models/Otp";
import Customer from "@/models/Customer";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await mongoConnect();

  const { email, otp } = req.body;

  const otpData = await Otp.findOne({ email, code: otp });

  if (!otpData) {
    return res.status(400).json({ message: "OTP salah" });
  }

  if (otpData.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (!otpData.registrationData) {
    return res.status(400).json({ message: "Data registrasi tidak ditemukan" });
  }

  await Customer.create({
    nama: otpData.registrationData.nama,
    email,
    alamat: otpData.registrationData.alamat,
    password: otpData.registrationData.password,
  });

  await otpData.deleteOne();

  return res
    .status(200)
    .json({ message: "Akun berhasil diverifikasi & dibuat!" });
}

export default enableCors(handler);