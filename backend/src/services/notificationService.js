import admin from '../config/firebase.js';
import { UserDevice } from '../models/UserDevice.js';
export const sendNotificationToUser = async (userId, title, body, data) => {
    try {
        const devices = await UserDevice.findAll({ where: { user_id: userId } });
        const tokens = devices.map(d => d.fcm_token);
        console.log(`[FCM] Attempting to send notification to user: ${userId}`);
        console.log(`[FCM] Found ${tokens.length} tokens for this user.`);
        if (tokens.length === 0) {
            console.log(`[FCM] SKIP: No FCM tokens found for user: ${userId}`);
            return;
        }
        const message = {
            notification: { title, body },
            data: data || {},
            tokens: tokens,
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Multicast response: ${response.successCount} success, ${response.failureCount} failure`);
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`[FCM] Token ${idx} failed:`, resp.error);
                }
            });
        }
    }
    catch (error) {
        console.error('[FCM] CRITICAL: Error sending notification:', error);
    }
};
export const broadcastNotification = async (topic, title, body, data) => {
    try {
        const message = {
            notification: { title, body },
            data: data || {},
            topic: topic,
        };
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    }
    catch (error) {
        console.error('Error broadcasting notification:', error);
    }
};
//# sourceMappingURL=notificationService.js.map