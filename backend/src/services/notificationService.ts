import { Notification } from '../models/Notification.js';
import { supabase } from '../config/supabase.js';
import { fcm } from '../config/firebase.js';
import { UserDevice } from '../models/UserDevice.js';
import { User } from '../models/User.js';

export const sendNotificationToUser = async (userId: string, title: string, body: string, data?: any) => {
    try {
        console.log(`[Notification] Persisting & Sending to user: ${userId} - ${title}: ${body}`);
        
        // 1. Persist to Database
        await Notification.create({
            user_id: userId,
            title,
            body,
            data
        });

        // 2. Broadcast via Supabase Realtime Channel
        await supabase.channel(`notifications:${userId}`).send({
            type: 'broadcast',
            event: 'new_notification',
            payload: { title, body, data, ts: new Date().toISOString() }
        });

        // 3. Send Push Notification via FCM
        const user = await User.findByPk(userId);
        if (user) {
            const devices = await UserDevice.findAll({
                where: { user_id: user.id }
            });

            const tokens = devices.map(d => d.fcm_token);

            if (tokens.length > 0) {
                console.log(`[FCM] Sending to ${tokens.length} devices for user ${userId}`);
                try {
                    const message: any = {
                        tokens,
                        notification: { title, body },
                    };
                    
                    if (data) {
                        message.data = Object.fromEntries(
                            Object.entries(data).map(([k, v]) => [k, String(v)])
                        );
                    }

                    await fcm().sendEachForMulticast(message);
                } catch (fcmError) {
                    console.error('[FCM] Error sending multicast:', fcmError);
                }
            }
        }
        
    } catch (error) {
        console.error('[Notification] Overall Error:', error);
    }
};

export const broadcastNotification = async (topic: string, title: string, body: string, data?: any) => {
    try {
        console.log(`[Notification] Broadcasting to ${topic}: ${title} - ${body}`);
        
        await supabase.channel(`topic:${topic}`).send({
            type: 'broadcast',
            event: 'broadcast_notification',
            payload: { title, body, data, ts: new Date().toISOString() }
        });

        // Also broadcast via FCM Topic
        try {
            const message: any = {
                topic,
                notification: { title, body },
            };

            if (data) {
                message.data = Object.fromEntries(
                    Object.entries(data).map(([k, v]) => [k, String(v)])
                );
            }

            await fcm().send(message);
        } catch (fcmError: any) {
            console.warn(`[FCM] Topic broadcast failed:`, fcmError.message);
        }
    } catch (error) {
        console.error('[Notification] Error:', error);
    }
};


