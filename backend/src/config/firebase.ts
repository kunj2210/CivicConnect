import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
    try {
        const absolutePath = path.isAbsolute(serviceAccountPath) 
            ? serviceAccountPath 
            : path.join(__dirname, '../../', serviceAccountPath);
            
        if (!getApps().length) {
            initializeApp({
                credential: cert(absolutePath),
            });
            console.log('[Firebase] Admin SDK initialized successfully');
        }
    } catch (error) {
        console.error('[Firebase] Failed to initialize with service account:', error);
    }
} else {
    console.warn('[Firebase] No FIREBASE_SERVICE_ACCOUNT_PATH found in .env. Push notifications will be disabled.');
}

/**
 * Returns the Firebase Messaging instance if initialized.
 * @throws Error if Firebase is not initialized.
 */
export const fcm = (): Messaging => {
    if (getApps().length === 0) {
        throw new Error('Firebase Admin SDK not initialized. Check your FIREBASE_SERVICE_ACCOUNT_PATH.');
    }
    return getMessaging();
};

export default { fcm };
