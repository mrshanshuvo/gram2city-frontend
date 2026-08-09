'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { useAuthStore } from '@/features/auth/authStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Bike,
  Store,
  User as UserIcon,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/features/auth/schema';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const { signInWithGoogle, signInUser, isLoading: loading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') || '/';

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    if (!data.password) return;

    signInUser(data.email, data.password)
      .then((userCredential) => {
        const user = userCredential.user;
        toast.success(`Welcome back, ${user.displayName || 'User'}!`);
        router.replace(from);
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error('Login failed: ' + errorMessage);
        console.error('Login error:', error);
      });
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
      <div className="mb-10 text-center lg:text-left">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3"
        >
          Welcome Back
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 font-medium text-lg"
        >
          Sign in to your{' '}
          <span className="font-extrabold tracking-tight">
            <span className="text-primary">Gram</span>
            <span className="text-accent">2</span>
            <span className="text-secondary">City</span>
          </span>{' '}
          account
        </motion.p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:text-secondary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
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

        {/* Demo Accounts Quick Login */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            {
              label: 'Admin',
              icon: ShieldCheck,
              email: 'admin@gram2city.com',
              pass: 'Admin123!',
            },
            { label: 'Rider', icon: Bike, email: 'rider@gram2city.com', pass: 'Rider123!' },
            {
              label: 'Merchant',
              icon: Store,
              email: 'merchant@gram2city.com',
              pass: 'Merchant123!',
            },
            { label: 'User', icon: UserIcon, email: 'user@gram2city.com', pass: 'User123!' },
          ].map((demo) => {
            const IconComp = demo.icon;
            return (
              <button
                key={demo.email}
                type="button"
                onClick={() => {
                  setValue('email', demo.email, { shouldValidate: true, shouldDirty: true });
                  setValue('password', demo.pass, { shouldValidate: true, shouldDirty: true });
                  trigger();
                  toast.info(`Auto-filled credentials for ${demo.label}`);
                }}
                className="py-2 px-1.5 bg-amber-400/15 hover:bg-amber-400/30 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] font-bold transition-all border border-amber-300/50 dark:border-amber-500/40 flex items-center justify-center gap-1 cursor-pointer truncate shadow-xs"
                title={`Auto-fill ${demo.label}`}
              >
                <IconComp size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">{demo.label}</span>
              </button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-primary hover:bg-secondary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-10">
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
            <span className="px-4 bg-white dark:bg-slate-900">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleSignIn}
            className="flex justify-center items-center py-4 px-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/80 transition-all cursor-pointer shadow-xs hover:border-primary/50 dark:hover:border-primary/50"
          >
            <FcGoogle className="w-6 h-6 mr-3 shrink-0" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Sign in with Google
            </span>
          </motion.button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          New to{' '}
          <span className="font-extrabold tracking-tight">
            <span className="text-primary">Gram</span>
            <span className="text-accent">2</span>
            <span className="text-secondary">City</span>
          </span>{' '}
          ?{' '}
          <Link
            href={`/register?from=${from}`}
            className="font-black text-primary hover:text-secondary transition-all underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

import { Suspense } from 'react';
import PageLoader from '@/components/Shared/PageLoader';

const LoginPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Login />
    </Suspense>
  );
};

export default LoginPage;
