// @/pages/api/auth/customer/register/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Customer from "@/models/Customer";
import Otp from "@/models/Otp";
import { mongoConnect } from "@/lib/mongoConnect";
import { generateOtp } from "@/lib/generateOtp";
import { hashPassword } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await mongoConnect();

  const { nama, email, alamat, password } = req.body;

  if (!nama || !email || !alamat || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  const exist = await Customer.findOne({ email });
  if (exist) {
    return res.status(400).json({ message: "Email sudah terdaftar" });
  }

  const hashed = await hashPassword(password);
  const otpCode = generateOtp();

  await Otp.create({
    email,
    code: otpCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    registrationData: {
      nama,
      alamat,
      password: hashed,
    },
  });

  await sendEmail(
    email,
    "Verifikasi Akun CoreQuarry",
    `<p>Kode OTP kamu: <b>${otpCode}</b></p>`,
  );

  return res.status(200).json({
    message: "OTP terkirim ke email. Silakan verifikasi.",
  });
}
