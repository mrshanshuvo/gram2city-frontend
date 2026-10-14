'use client';

import { useEffect } from 'react';
import { auth } from './firebase/firebase.init';
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

      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            const { axiosPublic } = await import('./api/axios');
            const googleRes = await axiosPublic.post('/auth/google', { credential: idToken });
            if (googleRes.data.token) {
              localStorage.setItem('gram2city_jwt_token', googleRes.data.token);
            }
            if (googleRes.data.user) {
              setUser(googleRes.data.user as User);
              setRole(googleRes.data.user.role);
            }
          } catch (error) {
            console.error('Auth Initializer: Google sync failed', error);
            setUser(currentUser as unknown as User);
          }
        } else {
          setUser(null);
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
