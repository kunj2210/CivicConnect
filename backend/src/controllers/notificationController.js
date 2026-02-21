import { Notification } from '../models/Notification.js';
export const getNotifications = async (req, res) => {
    try {
        const { user_id } = req.query;
        const query = user_id ? { where: { user_id } } : {};
        const notifications = await Notification.findAll({
            ...query,
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;
        const notification = await Notification.create({ user_id, title, message, type });
        res.status(201).json(notification);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);
        if (!notification)
            return res.status(404).json({ error: 'Notification not found' });
        notification.read_status = true;
        await notification.save();
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=notificationController.js.map