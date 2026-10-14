export interface User {
  uid?: string;
  _id?: string;
  email: string | null;
  displayName?: string | null;
  name?: string;
  photoURL?: string | null;
  role?: 'user' | 'rider' | 'admin' | 'merchant' | 'superAdmin';
  phone?: string;
  address?: string;
  district?: string;
  vehicleType?: string;
  emailVerified?: boolean;
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
