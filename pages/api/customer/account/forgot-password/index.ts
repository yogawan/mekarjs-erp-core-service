// @/pages/api/auth/customer/forgot-password/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Customer from "@/models/Customer";
import Otp from "@/models/Otp";
import { mongoConnect } from "@/lib/mongoConnect";
import { generateOtp } from "@/lib/generateOtp";
import { sendEmail } from "@/lib/mailer";
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

    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    const otpCode = generateOtp();

    await Otp.create({
      email,
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail(
      email,
      "Reset Password OTP",
      `<p>Kode OTP reset password kamu: <b>${otpCode}</b></p>`,
    );

    return res.status(200).json({ message: "OTP dikirim ke email" });
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export default enableCors(handler);
