// @/pages/api/auth/customer/reset-password/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Otp from "@/models/Otp";
import Customer from "@/models/Customer";
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

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const otpData = await Otp.findOne({ email, code: otp });
    if (!otpData) {
      return res.status(400).json({ message: "OTP salah" });
    }

    if (otpData.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashed = await hashPassword(newPassword);

    await Customer.findOneAndUpdate({ email }, { password: hashed });

    await otpData.deleteOne();

    return res.status(200).json({ message: "Password berhasil direset!" });
  } catch (error) {
    console.error("reset-password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export default enableCors(handler);