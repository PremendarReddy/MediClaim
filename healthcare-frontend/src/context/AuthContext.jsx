import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                
                // Fetch fresh profile data to resolve nested object truncations
                try {
                    if (parsedUser.token) {
                        api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                        const res = await api.get('/auth/profile');
                        if (res.data.success) {
                            const freshUser = { ...res.data.data, token: parsedUser.token };
                            setUser(freshUser);
                            localStorage.setItem('user', JSON.stringify(freshUser));
                        }
                    }
                } catch (error) {
                    console.error("Silent background profile hydration failed:", error);
                }
            }
            setLoading(false);
        };
        
        loadUser();

        // Multi-tab logout sync
        const handleStorageChange = (e) => {
            if (e.key === 'logout-event') {
                setUser(null);
                localStorage.removeItem('user');
                delete api.defaults.headers.common['Authorization'];
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.requires2FA) {
                return { success: true, requires2FA: true, tempToken: response.data.tempToken };
            }
            if (response.data.success) {
                let userData = response.data.data;
                api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                
                try {
                    const profileRes = await api.get('/auth/profile');
                    if (profileRes.data.success) {
                        userData = { ...profileRes.data.data, token: userData.token };
                    }
                } catch (e) {
                    console.error("Profile fetch failed post-login", e);
                }

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, role: userData.role };
            }
            return { success: false, error: 'Login failed' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Unable to connect to the server (Network/CORS Error)' : 'An unexpected error occurred')
            };
        }
    };

    const verify2FALogin = async (tempToken, token) => {
        try {
            const response = await api.post('/auth/login/verify-2fa', { tempToken, token });
            if (response.data.success) {
                let userData = response.data.data;
                api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                
                try {
                    const profileRes = await api.get('/auth/profile');
                    if (profileRes.data.success) {
                        userData = { ...profileRes.data.data, token: userData.token };
                    }
                } catch (e) {
                    console.error("Profile fetch failed post-2FA", e);
                }

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, role: userData.role };
            }
            return { success: false, error: 'Invalid 2FA code' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Unable to connect to the server (Network/CORS Error)' : 'An unexpected error occurred')
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            
            if (response.data.requiresOTP) {
                return { success: true, requiresOTP: true, email: response.data.email };
            }

            if (response.data.success) {
                let newUserData = response.data.data;
                api.defaults.headers.common['Authorization'] = `Bearer ${newUserData.token}`;
                
                try {
                    const profileRes = await api.get('/auth/profile');
                    if (profileRes.data.success) {
                        newUserData = { ...profileRes.data.data, token: newUserData.token };
                    }
                } catch (e) {
                    console.error("Profile fetch failed post-register", e);
                }

                setUser(newUserData);
                localStorage.setItem('user', JSON.stringify(newUserData));
                return { success: true, role: newUserData.role };
            }
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Unable to connect to the server (Network/CORS Error)' : 'An unexpected error occurred')
            };
        }
    };

    const verifyRegistrationOTP = async (email, otp) => {
        try {
            const response = await api.post('/auth/register-verify', { email, otp });
            if (response.data.success) {
                let userData = response.data.data;
                api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                
                try {
                    const profileRes = await api.get('/auth/profile');
                    if (profileRes.data.success) {
                        userData = { ...profileRes.data.data, token: userData.token };
                    }
                } catch (e) {
                    console.error("Profile fetch failed post-registration", e);
                }

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, role: userData.role };
            }
            return { success: false, error: 'Invalid OTP' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Unable to connect to the server (Network/CORS Error)' : 'An unexpected error occurred')
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        localStorage.setItem('logout-event', Date.now().toString());
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
        }
    };

    const updateUserLocal = (updatedFields) => {
        setUser((prev) => {
            const newUser = { ...prev, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, verify2FALogin, register, verifyRegistrationOTP, logout, updateUserLocal }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
