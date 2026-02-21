import multer from 'multer';
import path from 'path';
const storage = multer.memoryStorage(); // Use memory storage for processing before upload to S3/Firebase
export const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        console.log('--- Multer File Filter ---');
        console.log('Originalname:', file.originalname);
        console.log('Mimetype Received:', file.mimetype);
        // Accept all files that have an "image/" mimetype
        const isImage = file.mimetype.startsWith('image/');
        console.log(`Validation -> isImage: ${isImage}`);
        if (isImage) {
            return cb(null, true);
        }
        const errorMsg = `Only image files are allowed. Received: ${file.mimetype}`;
        console.warn('REJECTED:', errorMsg);
        cb(new Error(errorMsg));
    },
});
//# sourceMappingURL=upload.js.map