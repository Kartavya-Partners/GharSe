import { Router, Request, Response } from "express";

const router = Router();

// @desc    Upload image to ImgBB
// @route   POST /api/upload/image
// @access  Private
router.post("/image", async (req: Request, res: Response): Promise<void> => {
    // ImgBB API key (free tier allows 32MB/month)
    // You can get one from https://api.imgbb.com/
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "";

    try {
        const { image } = req.body;

        if (!image) {
            res.status(400).json({ message: "Image data is required" });
            return;
        }

        if (!IMGBB_API_KEY) {
            res.status(500).json({ message: "Image upload service not configured" });
            return;
        }

        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // Create form data for ImgBB API
        const formData = new URLSearchParams();
        formData.append("key", IMGBB_API_KEY);
        formData.append("image", base64Data);

        // Log API key status (don't log the actual key)
        console.log("Starting upload with API Key configured:", !!IMGBB_API_KEY);

        const response = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorDetail = "Unknown error";
            try {
                const error = await response.json();
                errorDetail = JSON.stringify(error);
            } catch (e) {
                errorDetail = await response.text();
            }

            console.error(`ImgBB upload failed with status ${response.status}:`, errorDetail);
            res.status(500).json({
                message: "Failed to upload image",
                details: errorDetail
            });
            return;
        }

        const data = await response.json();

        if (data.success) {
            res.json({
                url: data.data.url,
                deleteUrl: data.data.delete_url,
                thumbnail: data.data.thumb?.url,
            });
        } else {
            res.status(500).json({ message: "Image upload failed" });
        }
    } catch (error: any) {
        console.error("Upload error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
