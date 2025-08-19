import multer from "multer";

// disk storage for /uploads
export const uploadDisk = multer({ dest: "uploads/" });

// memory storage for direct buffers (e.g., /api/pronunciation)
export const uploadMemory = multer({ storage: multer.memoryStorage() });
