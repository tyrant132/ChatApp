class UploadController {
    static async uploadAttachment(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const isImage = req.file.mimetype.startsWith("image/");
            const isAudio = req.file.mimetype.startsWith("audio/");

            if (!isImage && !isAudio) {
                return res.status(400).json({ message: "Unsupported file type" });
            }

            res.json({
                url: `/uploads/${req.file.filename}`,
                type: isImage ? "image" : "audio",
                mimeType: req.file.mimetype,
                size: req.file.size,
            });

        } catch (error) {
            console.error("Error uploading attachment", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default UploadController;
