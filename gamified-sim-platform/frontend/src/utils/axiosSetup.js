import axios from 'axios';
import { refreshAccessToken } from '../contexts/AuthContext'; // adjust path if needed

axios.interceptors.response.use(
    res => res,
    async err => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axios(originalRequest);
            } catch (error) {
                return Promise.reject(error);
            }
        }

        return Promise.reject(err);
    }
);
