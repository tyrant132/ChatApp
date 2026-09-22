import apiClient from "../utils/apiClient";

export type AttachmentType = "image" | "audio";

export type UploadedAttachment = {
    url: string;
    type: AttachmentType;
    mimeType: string;
    size: number;
};

export const uploadService = {
    uploadFile: async (file: File | Blob, filename?: string): Promise<UploadedAttachment> => {
        const formData = new FormData();
        formData.append("file", file, filename);

        const response = await apiClient.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }
}
