// @/pages/api/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: string;
  message: string;
  method: string;
  timestamp: string;
  path: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  res.status(200).json({
    status: "success",
    message: "Application is smoothly running ...",
    method: req.method || "",
    timestamp: new Date().toISOString(),
    path: req.url || "/api",
  });
}
