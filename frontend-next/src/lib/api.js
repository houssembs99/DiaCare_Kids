import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5246/api',
});

// Request interceptor for API calls
api.interceptors.request.use(
    async (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

export default api;
