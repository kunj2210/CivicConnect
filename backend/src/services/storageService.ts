import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || '';
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'civic-connect-data';

if (!supabaseUrl || !serviceRoleKey) {
    console.error('CRITICAL: Supabase Storage requires SUPABASE_URL and SUPABASE_SERVICE_ROLE');
}

const supabaseStorage = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

function objectPathFromValue(value: string): string {
    const cleanValue = value.split('?')[0] || '';
    const marker = `/storage/v1/object/`;
    const markerIndex = cleanValue.indexOf(marker);

    if (markerIndex === -1) {
        return cleanValue.replace(/^\/+/, '');
    }

    const objectValue = cleanValue.slice(markerIndex + marker.length);
    const parts = objectValue.split('/');
    const bucketIndex = parts.indexOf(bucketName);

    return bucketIndex >= 0
        ? parts.slice(bucketIndex + 1).join('/')
        : cleanValue.replace(/^\/+/, '');
}

export class StorageService {
    static async uploadFile(file: any, folder: string = 'reports'): Promise<string | null> {
        try {
            const extension = file.originalname?.split('.').pop() || 'bin';
            const objectPath = `${folder}/${uuidv4()}.${extension}`;
            const { error } = await supabaseStorage.storage
                .from(bucketName)
                .upload(objectPath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            return await this.getPresignedUrl(objectPath, 24 * 60 * 60);
        } catch (error) {
            console.error('Supabase Storage upload error:', error);
            return null;
        }
    }

    static async getPresignedUrl(value: string, expiresInSeconds: number = 60 * 60): Promise<string> {
        if (!value) {
            return '';
        }

        if (value.startsWith('http://') || value.startsWith('https://')) {
            const objectPath = objectPathFromValue(value);
            if (!objectPath || objectPath === value) {
                return value;
            }
            value = objectPath;
        }

        try {
            const { data, error } = await supabaseStorage.storage
                .from(bucketName)
                .createSignedUrl(objectPathFromValue(value), expiresInSeconds);

            if (error) {
                throw error;
            }
            return data.signedUrl;
        } catch (error) {
            console.error('Supabase Storage signed URL error:', error);
            return value;
        }
    }

    static async deleteFile(value: string): Promise<boolean> {
        try {
            const objectPath = objectPathFromValue(value);
            const { error } = await supabaseStorage.storage
                .from(bucketName)
                .remove([objectPath]);

            if (error) {
                throw error;
            }
            return true;
        } catch (error) {
            console.error('Supabase Storage delete error:', error);
            return false;
        }
    }

    static getBucketName(): string {
        return bucketName;
    }

    static async getPresignedPutUrl(objectPath: string): Promise<{ signedUrl: string; token: string }> {
        const { data, error } = await supabaseStorage.storage
            .from(bucketName)
            .createSignedUploadUrl(objectPath);

        if (error) {
            console.error('Supabase Storage signed upload URL error:', error);
            throw error;
        }

        return {
            signedUrl: data.signedUrl,
            token: data.token,
        };
    }
}
