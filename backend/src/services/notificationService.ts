import admin from '../config/firebase.js';
import { UserDevice } from '../models/UserDevice.js';

export const sendNotificationToUser = async (userId: string, title: string, body: string, data?: any) => {
    try {
        const devices = await UserDevice.findAll({ where: { user_id: userId } });
        const tokens = devices.map(d => d.fcm_token);

        if (tokens.length === 0) {
            console.log(`No FCM tokens found for user: ${userId}`);
            return;
        }

        const message = {
            notification: { title, body },
            data: data || {},
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`${response.successCount} messages were sent successfully`);

        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const failedToken = tokens[idx];
                    if (failedToken) failedTokens.push(failedToken);
                }
            });
            console.log('Failure tokens:', failedTokens);
            // Optionally remove invalid tokens from DB
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

export const broadcastNotification = async (topic: string, title: string, body: string, data?: any) => {
    try {
        const message = {
            notification: { title, body },
            data: data || {},
            topic: topic,
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error broadcasting notification:', error);
    }
};
