import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('civic_admin_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('civic_admin_user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('civic_admin_user');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('civic_admin_user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
