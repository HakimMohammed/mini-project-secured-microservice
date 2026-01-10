import axios, { AxiosError } from 'axios';
import keycloak from '../config/keycloak';
import { ApiError } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to every request
api.interceptors.request.use(
    (config) => {
        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 errors (token expired) and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401 && keycloak.authenticated) {
            try {
                // Try to refresh the token
                const refreshed = await keycloak.updateToken(30);
                if (refreshed && error.config) {
                    // Retry the original request with new token
                    error.config.headers.Authorization = `Bearer ${keycloak.token}`;
                    return api.request(error.config);
                }
            } catch {
                // Refresh failed, redirect to login
                keycloak.login();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
