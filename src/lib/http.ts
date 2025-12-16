import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const http = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Not needed if we manually attach token
});

// Add a request interceptor
http.interceptors.request.use(
    (config) => {
        const token = Cookies.get('adminAccessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
http.interceptors.response.use(
    (response) => {
        // API Standard Response Wrapper logic
        // Backend returns { success: boolean, code: number, message: string, data: any }
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            if (response.data.success) {
                // Unwrap: Replace response.data with the actual payload
                // IMPORTANT: If paginated, data might be { items: [], pagination: {} }
                // If simple list, data might be [...].
                // We overwrite response.data so call sites see the actual data.
                response.data = response.data.data;
                return response;
            } else {
                // Business logic error (success: false)
                return Promise.reject(new Error(response.data.message || 'Operation failed'));
            }
        }
        return response;
    },
    (error) => {
        // Handle network errors or HTTP errors (e.g. 401, 404, 500)
        // If the backend sent a standardized error response definition, it might be in error.response.data
        if (error.response && error.response.data && error.response.data.message) {
            // Create a new error with the server message
            const serverMessage = error.response.data.message;
            error.message = serverMessage;
        }

        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                Cookies.remove('adminAccessToken');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default http;
