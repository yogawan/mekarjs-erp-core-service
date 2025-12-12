// @/pages/api/branch-manager/landing-page/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import LandingPage from "@/models/LandingPage";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    await mongoConnect();

    const { id } = req.query;

    if (!id || typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID parameter"
        });
    }

    switch (req.method) {
        case "GET":
            try {
                const landingPage = await LandingPage.findById(id);

                if (!landingPage) {
                    return res.status(404).json({
                        success: false,
                        message: "Landing page not found"
                    });
                }

                return res.status(200).json({ success: true, data: landingPage });
            } catch (err: any) {
                return res.status(500).json({ success: false, message: err.message });
            }

        case "PUT":
            try {
                const landingPage = await LandingPage.findById(id);

                if (!landingPage) {
                    return res.status(404).json({
                        success: false,
                        message: "Landing page not found"
                    });
                }

                const updatedLandingPage = await LandingPage.findByIdAndUpdate(
                    id,
                    req.body,
                    { new: true, runValidators: true }
                );

                return res.status(200).json({
                    success: true,
                    data: updatedLandingPage,
                    message: "Landing page updated successfully"
                });
            } catch (err: any) {
                return res.status(400).json({ success: false, message: err.message });
            }

        case "DELETE":
            try {
                const landingPage = await LandingPage.findById(id);

                if (!landingPage) {
                    return res.status(404).json({
                        success: false,
                        message: "Landing page not found"
                    });
                }

                await LandingPage.findByIdAndDelete(id);

                return res.status(200).json({
                    success: true,
                    message: "Landing page deleted successfully"
                });
            } catch (err: any) {
                return res.status(500).json({ success: false, message: err.message });
            }

        default:
            return res
                .status(405)
                .json({ success: false, message: "Method Not Allowed" });
    }
}

export default enableCors(handler);