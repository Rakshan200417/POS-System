import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('pos_token');
        const savedUser = localStorage.getItem('pos_user');
        if (token && savedUser) {
            try {
                let parsed = JSON.parse(savedUser);
                // Self-heal: ensure admin username or admin roles are recognized as admin
                const isUserAdmin = parsed?.roles?.some(r => r.toUpperCase() === 'ROLE_ADMIN' || r.toUpperCase() === 'ADMIN')
                    || parsed?.name?.toLowerCase() === 'admin'
                    || parsed?.role === 'admin';
                if (isUserAdmin && parsed.role !== 'admin') {
                    parsed = { ...parsed, role: 'admin', roles: parsed.roles || ['ROLE_ADMIN'] };
                    localStorage.setItem('pos_user', JSON.stringify(parsed));
                }
                setUser(parsed);
            } catch (e) {
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        try {
            const response = await api.post('/auth/signin', { username: identifier, password });
            const data = response.data;
            const token = data.token;
            const roles = data.roles || [];
            const isAdmin = roles.some(r => r.toUpperCase() === 'ROLE_ADMIN' || r.toUpperCase() === 'ADMIN')
                || data.username?.toLowerCase() === 'admin';

            const authUser = {
                id: data.id,
                name: data.username,
                email: data.email,
                roles: roles,
                role: isAdmin ? 'admin' : (roles[0]?.replace('ROLE_', '').toLowerCase() || 'cashier')
            };

            localStorage.setItem('pos_token', token);
            localStorage.setItem('pos_user', JSON.stringify(authUser));
            setUser(authUser);
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            const msg = error.response?.data?.message || 'Invalid username or password';
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
