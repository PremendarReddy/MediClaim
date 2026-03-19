import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user on load
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.requires2FA) {
                return { success: true, requires2FA: true, tempToken: response.data.tempToken };
            }
            if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, role: userData.role };
            }
            return { success: false, error: 'Login failed' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Network error occurred'
            };
        }
    };

    const verify2FALogin = async (tempToken, token) => {
        try {
            const response = await api.post('/auth/login/verify-2fa', { tempToken, token });
            if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, role: userData.role };
            }
            return { success: false, error: 'Invalid 2FA code' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Network error occurred'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.success) {
                const newUserData = response.data.data;
                setUser(newUserData);
                localStorage.setItem('user', JSON.stringify(newUserData));
                return { success: true, role: newUserData.role };
            }
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Network error occurred'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const updateUserLocal = (updatedFields) => {
        setUser((prev) => {
            const newUser = { ...prev, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, verify2FALogin, register, logout, updateUserLocal }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
