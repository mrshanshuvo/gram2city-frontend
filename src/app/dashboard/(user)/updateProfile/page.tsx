'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { axiosSecure } from '@/api/axios';
import { useAuthStore } from '@/features/auth/authStore';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormValues } from '@/features/auth/schema';
import { usePageHeader } from '@/hooks/usePageHeader';
import { AvatarOption } from '@/types';

const UpdateProfile = () => {
  const { user, updateUserProfile } = useAuthStore();
  usePageHeader('Identity Control', 'Personalize your logistics persona and contact info');

  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);

  const { data: dbUser, isLoading: userLoading } = useQuery({
    queryKey: ['db-user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  const { data: avatarLibrary = [] } = useQuery<AvatarOption[]>({
    queryKey: ['avatar-library'],
    queryFn: async () => {
      const res = await axiosSecure.get('/avatars');
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const currentPhotoURL = watch('photoURL');

  useEffect(() => {
    if (dbUser) {
      setValue('name', dbUser.name);
      setValue('photoURL', dbUser.photoURL);
      setValue('phone', dbUser.phone);
      setValue('address', dbUser.address);
    }
  }, [dbUser, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setSaving(true);
      await updateUserProfile({
        displayName: data.name,
        photoURL: data.photoURL,
      });

      const res = await axiosSecure.patch(`/users/${user?.email}`, {
        name: data.name,
        photoURL: data.photoURL,
        phone: data.phone,
        address: data.address,
      });

      if (res.data.success) {
        queryClient.invalidateQueries({ queryKey: ['db-user'] });
        toast.success('Identity updated successfully!');
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Update failed: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (userLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 font-outfit">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Identity Settings
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Manage your platform persona and contact info
          </p>
        </div>
        {dbUser?.isProfileComplete && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary dark:text-emerald-400 rounded-2xl border border-primary/20 shadow-sm">
            <ShieldCheck size={20} className="animate-pulse" />
            <span className="font-black uppercase tracking-widest text-[10px]">
              Verified Shipper
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Avatar & Tier */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="relative inline-block">
                <div className="w-40 h-40 rounded-[3.5rem] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-inner transition-transform duration-700 group-hover:rotate-6">
                  {currentPhotoURL ? (
                    <Image
                      src={currentPhotoURL}
                      alt="Profile"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-4xl">
                      {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarGrid(!showAvatarGrid)}
                  className="absolute -bottom-2 -right-2 p-4 bg-secondary text-white rounded-2xl shadow-xl border-4 border-white dark:border-slate-900 hover:scale-110 transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera size={20} />
                </button>
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {user?.displayName}
                </h3>
                <span className="px-4 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-400 rounded-full uppercase tracking-widest mt-2 inline-block">
                  {dbUser?.role || 'Citizen'}
                </span>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-8">
                <div>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {dbUser?.isProfileComplete ? '100%' : '65%'}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Strength
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                <div>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">Elite</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Trust Tier
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center text-xl">
                <Zap />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Pro Tip</h3>
            </div>
            <p className="text-xs font-bold text-slate-400 leading-relaxed relative z-10">
              Keep your phone and address updated to receive faster delivery assignments and
              verification badges.
            </p>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl rounded-full"></div>
          </div>
        </div>

        {/* Right Side: Identity Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {showAvatarGrid ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    Avatar Library
                  </h3>
                  <button
                    onClick={() => setShowAvatarGrid(false)}
                    className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    BACK TO FORM
                  </button>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {avatarLibrary.map((avatar: AvatarOption, i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        setValue('photoURL', avatar.url);
                        setShowAvatarGrid(false);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        currentPhotoURL === avatar.url
                          ? 'border-blue-500 shadow-lg'
                          : 'border-slate-50 dark:border-slate-800'
                      }`}
                    >
                      <Image
                        src={avatar.url}
                        alt="Avatar Option"
                        fill
                        sizes="(max-width: 768px) 25vw, 150px"
                        className="w-full h-full object-cover"
                      />
                      {currentPhotoURL === avatar.url && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <ShieldCheck className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                  <div className="aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 border-4 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center p-2">
                    <Zap className="text-slate-300 dark:text-slate-600 mb-1" size={16} />
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase leading-tight">
                      More Coming
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
                        Official Name
                      </label>
                      <div className="relative group">
                        <UserIcon
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors"
                          size={20}
                        />
                        <input
                          type="text"
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-3xl focus:ring-8 focus:ring-blue-500/5 transition-all font-black text-slate-700 dark:text-slate-100 outline-none"
                          {...register('name')}
                        />
                      </div>
                      {errors.name && (
                        <span className="text-[10px] text-rose-500 font-bold ml-2">
                          {errors.name.message as string}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
                        Platform Email
                      </label>
                      <div className="relative group opacity-60">
                        <Mail
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500"
                          size={20}
                        />
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full pl-14 pr-6 py-5 bg-slate-100 dark:bg-slate-800/50 border-none rounded-3xl cursor-not-allowed font-black text-slate-500 dark:text-slate-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
                        Contact Line
                      </label>
                      <div className="relative group">
                        <Phone
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors"
                          size={20}
                        />
                        <input
                          type="tel"
                          placeholder="017xxxxxxxx"
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-3xl focus:ring-8 focus:ring-blue-500/5 transition-all font-black text-slate-700 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          {...register('phone')}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
                        Custom Avatar URL
                      </label>
                      <div className="relative group">
                        <Camera
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors"
                          size={20}
                        />
                        <input
                          type="url"
                          placeholder="https://imgur.com/..."
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-3xl focus:ring-8 focus:ring-blue-500/5 transition-all font-black text-slate-700 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          {...register('photoURL')}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
                        Base Pickup Address
                      </label>
                      <div className="relative group">
                        <MapPin
                          className="absolute left-5 top-7 text-slate-300 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors"
                          size={20}
                        />
                        <textarea
                          placeholder="Your primary location for parcel collection..."
                          rows={4}
                          className="w-full pl-14 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl focus:ring-8 focus:ring-blue-500/5 transition-all font-black text-slate-700 dark:text-slate-100 leading-relaxed outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                          {...register('address')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn bg-secondary hover:bg-blue-700 text-white border-none rounded-2xl font-black px-12 h-16 shadow-2xl shadow-blue-500/30 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                      Deploy Identity Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
