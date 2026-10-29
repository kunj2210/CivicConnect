import type { Response } from 'express';
import { User } from '../../config/db.js';
import { StorageService } from '../../services/storageService.js';
import { supabaseAdmin } from '../../config/supabase.js';
import type { AuthRequest } from './user.utils.js';

export const updateUserAvatar = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Upload the file to Supabase Storage.
        const presignedUrl = await StorageService.uploadFile(req.file, 'avatars');
        if (!presignedUrl) {
            return res.status(500).json({ error: 'Failed to upload image to storage' });
        }

        const s3Key = presignedUrl;

        // 1. Update avatar_url in PostgreSQL
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.avatar_url = s3Key;
        await user.save();

        const freshPresignedUrl = await StorageService.getPresignedUrl(s3Key);

        // 2. Update avatar_url in Supabase Auth user metadata
        const userMetadata = req.user?.user_metadata || {};
        const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            {
                user_metadata: {
                    ...userMetadata,
                    avatar_url: freshPresignedUrl
                }
            }
        );

        if (metadataError) {
            console.error('[AvatarController] Error updating Supabase user metadata:', metadataError.message);
        }

        return res.json({
            success: true,
            avatar_url: freshPresignedUrl
        });
    } catch (error: any) {
        console.error('[AvatarController] Internal Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
