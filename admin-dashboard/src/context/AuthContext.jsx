import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('civic_admin_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (role) => {
        const userData = { id: 1, name: role === 'Admin' ? 'Admin' : 'Nodal Officer', role };
        setUser(userData);
        localStorage.setItem('civic_admin_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('civic_admin_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
