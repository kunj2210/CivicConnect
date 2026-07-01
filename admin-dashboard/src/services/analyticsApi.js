import { api } from '../utils/api';

export const analyticsApi = {
    query: (data) => api.post('/analytics/query', data),
    reindex: () => api.post('/analytics/reindex')
};
