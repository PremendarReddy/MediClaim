import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

// Add a request interceptor to attach JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user?.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Dispatch a multi-tab logout event across the browser
            localStorage.setItem('logout-event', Date.now().toString());
            // Clear the local token
            localStorage.removeItem('user');
            
            // Only redirect if we aren't already on login
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
