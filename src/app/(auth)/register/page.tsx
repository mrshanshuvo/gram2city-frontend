'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { useAuthStore } from '@/features/auth/authStore';
import { toast } from 'sonner';
import React, { useState } from 'react';
import { axiosPublic } from '@/api/axios';
import { UserInfoDB } from '@/features/auth/types';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '@/features/auth/schema';

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();
  const {
    createUser,
    signInWithGoogle,
    updateUserProfile,
    isLoading: authLoading,
  } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') || '/';

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    if (!data.password) return;

    try {
      setIsSubmitting(true);

      // 1. Fetch a random avatar from the library
      let finalPhotoURL =
        'https://api.dicebear.com/7.x/lorelei/svg?seed=' + Math.random().toString(36).substring(7);
      try {
        const avatarRes = await axiosPublic.get('/avatars/random');
        if (avatarRes.data && avatarRes.data.url) {
          finalPhotoURL = avatarRes.data.url;
        }
      } catch (e) {
        console.warn('Using fallback avatar due to error:', e);
      }

      // 2. Create user in Firebase
      const userCredential = await createUser(data.email, data.password);
      const token = await userCredential.user.getIdToken();

      // 3. Prepare the user info object for DB
      const userInfoDB: UserInfoDB = {
        email: data.email,
        name: data.name,
        photoURL: finalPhotoURL,
        isProfileComplete: false, // Mark as incomplete for progressive onboarding
      };

      // 4. Send to backend DB
      await axiosPublic.post('/users', userInfoDB, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 5. Update Firebase user profile
      await updateUserProfile({
        displayName: data.name,
        photoURL: finalPhotoURL,
      });

      toast.success(`Welcome to Gram2City, ${data.name}!`);
      router.replace(from);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Registration failed: ' + errorMessage);
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle()
      .then(() => {
        toast.success('Google login successful!');
        router.push('/dashboard');
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error('Google sign-in failed: ' + errorMessage);
        console.error('Google sign-in error:', error);
      });
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 mb-2 justify-center lg:justify-start"
        >
          <Sparkles className="text-accent" size={24} />
          <span className="text-primary font-black uppercase tracking-widest text-xs">
            Start Your Journey
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2"
        >
          Join{' '}
          <span className="font-extrabold tracking-tight">
            <span className="text-primary">Gram</span>
            <span className="text-accent">2</span>
            <span className="text-secondary">City</span>
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 font-medium"
        >
          The fastest way to ship from village to city.
        </motion.p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
            Full Name
          </label>
          <div className="relative group">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              {...register('name')}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Your full name"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="email"
              {...register('email')}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="name@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
            Password
          </label>
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
              {errors.password.message}
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || authLoading}
          type="submit"
          className="w-full py-4 px-6 bg-primary hover:bg-secondary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting || authLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-black text-primary hover:text-secondary transition-all underline underline-offset-4"
          >
            Log In
          </Link>
        </p>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
          <span className="px-4 bg-white dark:bg-slate-900">Or join with</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleSignIn}
        type="button"
        className="w-full flex justify-center items-center py-4 px-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/80 transition-all cursor-pointer shadow-xs hover:border-primary/50 dark:hover:border-primary/50"
      >
        <FcGoogle className="w-6 h-6 mr-3" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Google Account</span>
      </motion.button>
    </div>
  );
};

import { Suspense } from 'react';
import PageLoader from '@/components/Shared/PageLoader';

const RegisterPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Register />
    </Suspense>
  );
};

export default RegisterPage;
