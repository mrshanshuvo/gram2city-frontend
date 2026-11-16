import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD1ee80ZS-KyN_zdIgln8hamahjHxH4ZRs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'gram-2-city.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'gram-2-city',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'gram-2-city.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '70114789791',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:70114789791:web:8fd387f26c2bc8e1d155aa',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
