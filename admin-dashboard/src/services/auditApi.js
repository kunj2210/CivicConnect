import { api } from '../utils/api';

const qs = (params) => {
    if (!params) return '';
    const filtered = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return filtered.length ? `?${filtered.join('&')}` : '';
};

export const auditApi = {
    getAll: (params) => api.get(`/audit-logs${qs(params)}`)
};
