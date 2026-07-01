import { api } from '../utils/api';

export const adminApi = {
    wipeData: () => api.post('/system/wipe-data'),
    // Extend with other system-level endpoints as needed
};
