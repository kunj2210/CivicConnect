import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
});

export class StorageService {
    private static bucketName = process.env.MINIO_BUCKET || 'civic-connect-uploads';

    static async uploadFile(file: any, folder: string = 'reports'): Promise<string | null> {
        try {
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${folder}/${uuidv4()}.${fileExt}`;
            
            // Upload to MinIO
            await minioClient.putObject(
                this.bucketName,
                fileName,
                file.buffer,
                file.size,
                { 'Content-Type': file.mimetype }
            );

            // Construct Public URL (Assumes bucket policy is public-read)
            const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
            const host = process.env.MINIO_ENDPOINT || 'localhost';
            const port = process.env.MINIO_PORT || '9000';
            
            return `${protocol}://${host}:${port}/${this.bucketName}/${fileName}`;
        } catch (error) {
            console.error('MinIO Storage Service Error:', error);
            return null;
        }
    }

    static async deleteFile(path: string): Promise<boolean> {
        try {
            await minioClient.removeObject(this.bucketName, path);
            return true;
        } catch (error) {
            console.error('MinIO Storage Service Delete Error:', error);
            return false;
        }
    }
}

