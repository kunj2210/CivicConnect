import { Notification } from '../models/Notification.js';
import { supabase } from '../config/supabase.js';

export const sendNotificationToUser = async (userId: string, title: string, body: string, data?: any) => {
    try {
        console.log(`[Notification] Persisting & Sending to user: ${userId} - ${title}: ${body}`);
        
        // 1. Persist to Database (Supabase Realtime will pick this up if enabled on the table)
        await Notification.create({
            user_id: userId,
            title,
            body,
            data
        });

        // 2. Also Broadcast via Supabase Realtime Channel (Optional, for instant UI updates if not using table listeners)
        await supabase.channel(`notifications:${userId}`).send({
            type: 'broadcast',
            event: 'new_notification',
            payload: { title, body, data, ts: new Date().toISOString() }
        });
        
    } catch (error) {
        console.error('[Notification] Error:', error);
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
    } catch (error) {
        console.error('[Notification] Error:', error);
    }
};


