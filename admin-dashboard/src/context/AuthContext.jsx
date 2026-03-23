import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Session Check
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error("Auth session error:", error);
                setLoading(false);
                return;
            }
            const session = data?.session;
            if (session) {
                api.get('/users/me')
                    .then(profile => {
                        setUser({
                            ...session.user,
                            ...profile,
                            token: session.access_token
                        });
                        setLoading(false);
                    })
                    .catch(err => {
                        console.warn("Profile resolving failed, using metadata fallback:", err.message);
                        setUser({
                            ...session.user,
                            role: session.user.user_metadata?.role || 'Citizen',
                            token: session.access_token
                        });
                        setLoading(false);
                    });
            } else {
                setLoading(false);
            }
        }).catch(err => {
            console.error("Fatal getSession error:", err);
            setLoading(false);
        });

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                api.get('/users/me')
                    .then(profile => {
                        setUser({
                            ...session.user,
                            ...profile,
                            token: session.access_token
                        });
                        setLoading(false);
                    })
                    .catch(err => {
                        setUser({
                            ...session.user,
                            role: session.user.user_metadata?.role || 'Citizen',
                            token: session.access_token
                        });
                        setLoading(false);
                    });
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[AuthContext] login error:', error);
            throw error;
        }
        return data;
    };

    const signInWithPhone = async (phone) => {
        const { data, error } = await supabase.auth.signInWithOtp({
            phone,
        });
        if (error) {
            console.error('[AuthContext] signInWithPhone error:', error);
            throw error;
        }
        return data;
    };

    const verifyPhoneOtp = async (phone, token) => {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });
        if (error) {
            console.error('[AuthContext] verifyPhoneOtp error:', error);
            throw error;
        }
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, signInWithPhone, verifyPhoneOtp }}>
            {loading ? (
                <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white font-bold">Verifying Identity Configuration...</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
