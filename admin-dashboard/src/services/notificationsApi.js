import { api } from '../utils/api';

export const notificationsApi = {
    getAll: () => api.get('/notifications'),
    create: (data) => api.post('/notifications', data),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`)
};
