import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  _id?: string;
  name?: string;
  role?: 'user' | 'rider' | 'admin' | 'merchant';
  phone?: string;
  address?: string;
  district?: string;
  vehicleType?: string;
}

export interface UserInfoDB {
  email: string;
  name: string;
  photoURL: string | null;
  role?: string;
  isProfileComplete?: boolean;
  phone?: string;
  address?: string;
  district?: string;
  created_at?: string;
  last_login?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password?: string;
}

export interface LoginFormData {
  email: string;
  password?: string;
}
