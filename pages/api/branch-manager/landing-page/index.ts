// @/pages/api/branch-manager/landing-page/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import LandingPage from "@/models/LandingPage";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    await mongoConnect();

    switch (req.method) {
        case "GET":
            try {
                // Get the single landing page data
                const landingPage = await LandingPage.findOne().sort({ createdAt: -1 });

                if (!landingPage) {
                    return res.status(404).json({
                        success: false,
                        message: "Landing page not found. Please create one first."
                    });
                }

                return res.status(200).json({ success: true, data: landingPage });
            } catch (err: any) {
                return res.status(500).json({ success: false, message: err.message });
            }

        case "POST":
            try {
                // Check if landing page already exists
                const existingLandingPage = await LandingPage.findOne();

                if (existingLandingPage) {
                    return res.status(400).json({
                        success: false,
                        message: "Landing page already exists. Only one landing page is allowed. Use PUT method to update.",
                        existingId: existingLandingPage._id,
                    });
                }

                // Validate required fields
                const { navbar, hero, about, products, footer } = req.body;

                if (!navbar || !hero || !about || !products || !footer) {
                    return res.status(400).json({
                        success: false,
                        message: "All sections (navbar, hero, about, products, footer) are required",
                    });
                }

                // Create new landing page
                const landingPage = await LandingPage.create(req.body);

                return res.status(201).json({
                    success: true,
                    data: landingPage,
                    message: "Landing page created successfully"
                });
            } catch (err: any) {
                return res.status(400).json({ success: false, message: err.message });
            }

        case "PUT":
            try {
                // Find the existing landing page
                const existingLandingPage = await LandingPage.findOne();

                if (!existingLandingPage) {
                    return res.status(404).json({
                        success: false,
                        message: "Landing page not found. Please create one first using POST method.",
                    });
                }

                // Update the landing page
                const updatedLandingPage = await LandingPage.findByIdAndUpdate(
                    existingLandingPage._id,
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

        default:
            return res
                .status(405)
                .json({ success: false, message: "Method Not Allowed" });
    }
}

export default enableCors(handler);