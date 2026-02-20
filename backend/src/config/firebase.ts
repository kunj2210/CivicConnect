import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import type { Bucket } from '@google-cloud/storage';

const require = createRequire(import.meta.url);
dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
    try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        });
        console.log('Firebase Admin initialized');
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
} else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not provided. Firebase Admin not initialized.');
}

// Ensure admin is initialized before accessing storage
export const bucket: any = admin.apps.length > 0 ? admin.storage().bucket() : null;
export default admin;
