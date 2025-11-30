// @/pages/api/owner/ai-llm/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Groq from "groq-sdk";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
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

    const { askToCoreQuarry } = req.body;

    if (!askToCoreQuarry || typeof askToCoreQuarry !== "string") {
      return res.status(400).json({ message: "Pertanyaan wajib diisi" });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: askToCoreQuarry,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    const answer = chatCompletion.choices[0]?.message?.content || "Maaf, tidak dapat menghasilkan jawaban.";

    return res.status(200).json({
      status: "Sukses bertanya pada AI LLM! CoreQuarry",
      responseCoreQuarry: answer,
    });
  } catch (err) {
    console.error("AI LLM error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export default enableCors(handler);