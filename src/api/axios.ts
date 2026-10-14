import axios from 'axios';
import { useAuthStore } from '../features/auth/authStore';
import { toast } from 'sonner';
import { ValidationError } from '@/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const axiosPublic = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

export const axiosSecure = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

// Request Interceptor: Inject Token
axiosSecure.interceptors.request.use(
  async (config) => {
    const localToken =
      typeof window !== 'undefined' ? localStorage.getItem('gram2city_jwt_token') : null;
    if (localToken) {
      config.headers.authorization = `Bearer ${localToken}`;
      return config;
    }

    const { user } = useAuthStore.getState();
    if (user && typeof user.getIdToken === 'function') {
      try {
        const token = await user.getIdToken();
        config.headers.authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('AxiosSecure: Failed to get token', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor for Public: Basic Error Logging
axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network Error: Please check your connection.');
    }
    return Promise.reject(error);
  },
);

// Response Interceptor: Silent Token Refresh on 401 & Global Error Handling
axiosSecure.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const { logout } = useAuthStore.getState();

    // 401 Unauthorized: Attempt Silent Refresh using httpOnly Refresh Cookie
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        if (refreshRes.data.token) {
          localStorage.setItem('gram2city_jwt_token', refreshRes.data.token);
          originalRequest.headers.authorization = `Bearer ${refreshRes.data.token}`;
          return axiosSecure(originalRequest);
        }
      } catch (refreshErr) {
        console.warn('Session expired - refresh token invalid or revoked');
        await logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    if (status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/forbidden';
      }
    } else if (status === 400 && error.response?.data?.message === 'Validation failed') {
      const validationErrors = error.response.data.errors;
      if (Array.isArray(validationErrors)) {
        validationErrors.forEach((err: ValidationError) => {
          toast.error(`${err.path.join('.')}: ${err.message}`, {
            id: `val-err-${err.path.join('-')}`,
          });
        });
      }
    }

    return Promise.reject(error);
  },
);
