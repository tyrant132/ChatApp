import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import UploadController from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", authMiddleware, (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || "Upload failed" });
        }
        next();
    });
}, UploadController.uploadAttachment);

export default router;
