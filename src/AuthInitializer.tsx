'use client';

import { useEffect } from 'react';
import { auth } from './firebase/firebase.init';
import { User } from './features/auth/types';
import { useAuthStore } from './features/auth/authStore';
import { useSocketStore } from './store/useSocketStore';
import { axiosSecure } from './api/axios';
import { userResponseSchema } from './lib/responseSchemas';

const AuthInitializer = () => {
  const { setUser, setRole, setLoading } = useAuthStore();
  const { initializeSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    // Initialize Socket
    initializeSocket();

    const checkAuth = async () => {
      const localToken = localStorage.getItem('gram2city_jwt_token');
      if (localToken) {
        try {
          const res = await axiosSecure.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user as User);
            setRole(res.data.user.role);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem('gram2city_jwt_token');
        }
      }

      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        // Set basic user info first
        setUser(currentUser as User);

        if (currentUser) {
          try {
            const res = await axiosSecure.post('/users/sync');
            const validated = userResponseSchema.safeParse(res.data);

            if (validated.success && validated.data.user) {
              setRole(validated.data.user.role);
            } else if (!validated.success) {
              console.error('Auth Initializer: Validation failed', validated.error);
            }
          } catch (error) {
            console.error('Auth Initializer: Sync failed', error);
          }
        } else {
          setRole(null);
        }

        setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribeFirebase: (() => void) | undefined;
    checkAuth().then((unsub) => {
      if (typeof unsub === 'function') unsubscribeFirebase = unsub;
    });

    return () => {
      if (unsubscribeFirebase) unsubscribeFirebase();
      disconnectSocket();
    };
  }, [setUser, setRole, setLoading, initializeSocket, disconnectSocket]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;
