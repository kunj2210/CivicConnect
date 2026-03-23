import { supabase } from '../config/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
    async get(endpoint) {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
        };

        const response = await fetch(`${API_URL}${endpoint}`, { headers });
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    },

    async post(endpoint, body) {
        const { data: { session } } = await supabase.auth.getSession();
        const isFormData = body instanceof FormData;
        const headers = {
            'Authorization': `Bearer ${session?.access_token}`
        };
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body)
        });
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    },


    async patch(endpoint, body) {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    },

    async delete(endpoint) {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers
        });
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    }
};
