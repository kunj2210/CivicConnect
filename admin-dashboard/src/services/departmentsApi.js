import { api } from '../utils/api';

export const departmentsApi = {
    getAll: () => api.get('/departments'),
    getById: (id) => api.get(`/departments/${id}`),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.patch(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`)
};
