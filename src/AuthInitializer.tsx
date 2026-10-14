'use client';

import { useEffect } from 'react';
import { User } from './features/auth/types';
import { useAuthStore } from './features/auth/authStore';
import { useSocketStore } from './store/useSocketStore';
import { axiosSecure } from './api/axios';

const AuthInitializer = () => {
  const { setUser, setRole, setLoading } = useAuthStore();
  const { initializeSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    // Initialize Socket
    initializeSocket();

    const checkAuth = async () => {
      try {
        const res = await axiosSecure.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user as User);
          setRole(res.data.user.role);
          setLoading(false);
          return;
        }
      } catch {
        // Access token invalid or no refresh session
        localStorage.removeItem('gram2city_jwt_token');
      }

      setUser(null);
      setRole(null);
      setLoading(false);
    };

    checkAuth();

    return () => {
      disconnectSocket();
    };
  }, [setUser, setRole, setLoading, initializeSocket, disconnectSocket]);

  return null;
};

export default AuthInitializer;
