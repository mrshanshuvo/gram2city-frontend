import { create } from 'zustand';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';
import { User } from './types';

const googleProvider = new GoogleAuthProvider();

interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Actions
  createUser: (
    email: string,
    password: string,
    name?: string,
    photoURL?: string,
  ) => Promise<{ user: User }>;
  signInUser: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: (googleToken?: {
    credential?: string;
    access_token?: string;
  }) => Promise<{ user: User; token?: string; role?: string }>;
  updateUserProfile: (profileInfo: {
    displayName?: string | null;
    photoURL?: string | null;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ isLoading: loading }),

  createUser: async (email, password, name, photoURL) => {
    set({ isLoading: true });
    try {
      const { axiosPublic } = await import('../../api/axios');
      const res = await axiosPublic.post('/auth/register', {
        email,
        password,
        name: name || email.split('@')[0],
        photoURL,
      });
      if (res.data.token) {
        localStorage.setItem('gram2city_jwt_token', res.data.token);
      }
      if (res.data.user) {
        set({ user: res.data.user, role: res.data.role, isLoading: false });
      }
      return { user: res.data.user };
    } finally {
      set({ isLoading: false });
    }
  },

  signInUser: async (email, password) => {
    set({ isLoading: true });
    try {
      const { axiosPublic } = await import('../../api/axios');
      const res = await axiosPublic.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('gram2city_jwt_token', res.data.token);
      }
      if (res.data.user) {
        set({ user: res.data.user, role: res.data.role, isLoading: false });
      }
      return { user: res.data.user } as unknown as UserCredential;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async (googleToken) => {
    set({ isLoading: true });
    try {
      let payload: { credential?: string; access_token?: string } = {};

      if (googleToken?.credential || googleToken?.access_token) {
        payload = googleToken;
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        payload = { credential: idToken };
      }

      const { axiosPublic } = await import('../../api/axios');
      const res = await axiosPublic.post('/auth/google', payload);
      if (res.data.token) {
        localStorage.setItem('gram2city_jwt_token', res.data.token);
      }
      if (res.data.user) {
        set({ user: res.data.user, role: res.data.role, isLoading: false });
      }
      return res.data;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserProfile: (profileInfo) => {
    if (!auth.currentUser) return Promise.resolve();
    return updateProfile(auth.currentUser, profileInfo);
  },

  logout: async () => {
    set({ isLoading: true });
    localStorage.removeItem('gram2city_jwt_token');
    try {
      const { axiosPublic } = await import('../../api/axios');
      await axiosPublic.post('/auth/logout');
    } catch (err) {
      console.error('Logout backend error:', err);
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout Firebase error:', err);
    }
    set({ user: null, role: null, isLoading: false });
  },
}));
