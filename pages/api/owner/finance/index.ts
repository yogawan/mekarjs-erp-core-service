// @/pages/api/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { enableCors } from "@/middleware/enableCors";

type Data = {
  pemasukan: string;
  pengeluaran: string;
  netProfit: string;
  timestamp: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  // Dummy data pemasukan & pengeluaran (bisa lu ganti dari DB)
  const pemasukan = 1500000;   // contoh pemasukan
  const pengeluaran = 500000;  // contoh pengeluaran

  const netProfit = pemasukan - pengeluaran;

  res.status(200).json({
    pemasukan: pemasukan.toString(),
    pengeluaran: pengeluaran.toString(),
    netProfit: netProfit.toString(),
    timestamp: new Date().toISOString(),
  });
}

export default enableCors(handler);