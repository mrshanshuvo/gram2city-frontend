import axios from 'axios';
import { useAuthStore } from '../features/auth/authStore';
import { toast } from 'sonner';
import { ValidationError } from '@/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const axiosPublic = axios.create({
  baseURL,
  timeout: 30000,
});

export const axiosSecure = axios.create({
  baseURL,
  timeout: 30000,
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

// Response Interceptor: Handle Global Errors
axiosSecure.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const { logout } = useAuthStore.getState();

    if (status === 401) {
      console.warn('Unauthorized access - logging out');
      await logout();
      window.location.href = '/login';
    } else if (status === 403) {
      window.location.href = '/forbidden';
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
