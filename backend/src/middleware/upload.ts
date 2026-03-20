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

        // Accept all files that have an "image/" or "audio/" mimetype
        const isImage = file.mimetype.startsWith('image/');
        const isAudio = file.mimetype.startsWith('audio/') || file.mimetype === 'video/ogg' || file.originalname.endsWith('.wav') || file.originalname.endsWith('.mp3') || file.originalname.endsWith('.m4a');

        console.log(`Validation -> isImage: ${isImage}, isAudio: ${isAudio}`);

        if (isImage || isAudio) {
            return cb(null, true);
        }

        const errorMsg = `Only image and audio files are allowed. Received: ${file.mimetype}`;
        console.warn('REJECTED:', errorMsg);
        cb(new Error(errorMsg));
    },
});
