import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../services/storageService.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifySupabaseToken);

router.post('/signed-url', async (req: any, res: any) => {
    try {
        const { filename, fileType } = req.body;
        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        const ext = filename.split('.').pop() || 'jpg';
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const subfolder = fileType === 'audio' ? 'audio' : 'images';
        const s3Key = `raw/${year}/${month}/${day}/${subfolder}/${uuidv4()}.${ext}`;

        const uploadUrl = await StorageService.getPresignedPutUrl(s3Key);

        return res.status(200).json({
            upload_url: uploadUrl,
            s3_key: s3Key
        });
    } catch (error: any) {
        console.error('Error generating presigned PUT URL:', error);
        return res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
    }
});

export default router;
