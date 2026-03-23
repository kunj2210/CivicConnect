import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // Use memory storage for processing before upload


export const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        console.log('--- Multer File Filter ---');
        console.log('Originalname:', file.originalname);
        console.log('Mimetype Received:', file.mimetype);

        // Accept all files that have an "image/" or "audio/" mimetype, OR common extensions as a fallback
        const isImage = file.mimetype.startsWith('image/') || 
                       file.originalname.toLowerCase().endsWith('.jpg') || 
                       file.originalname.toLowerCase().endsWith('.jpeg') || 
                       file.originalname.toLowerCase().endsWith('.png') || 
                       file.originalname.toLowerCase().endsWith('.webp');

        const isAudio = file.mimetype.startsWith('audio/') || 
                       file.mimetype === 'video/ogg' || 
                       file.mimetype === 'application/octet-stream' && (file.originalname.endsWith('.m4a') || file.originalname.endsWith('.mp3')) ||
                       ['.wav', '.mp3', '.m4a', '.aac', '.ogg'].some(ext => file.originalname.toLowerCase().endsWith(ext));


        console.log(`Validation -> isImage: ${isImage}, isAudio: ${isAudio}`);

        if (isImage || isAudio) {
            return cb(null, true);
        }

        const errorMsg = `Only image and audio files are allowed. Received: ${file.mimetype}`;
        console.warn('REJECTED:', errorMsg);
        cb(new Error(errorMsg));
    },
});
