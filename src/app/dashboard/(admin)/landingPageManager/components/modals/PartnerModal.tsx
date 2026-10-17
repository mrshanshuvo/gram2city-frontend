'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { X, Save, Building2, Hash, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Partner } from '@/features/landing/types';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData | Partner) => void;
  initialData?: Partner;
  isLoading?: boolean;
}

const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialData || { name: '', order: 0, isActive: true },
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: '', order: 0, isActive: true });
      setPreviewUrl(initialData?.logo || '');
      setSelectedFile(null);
    }
  }, [initialData, isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (formValues: Partner) => {
    if (!selectedFile && !initialData?.logo) {
      toast.error('Please upload a partner logo.');
      return;
    }
    let logoUrl = initialData?.logo || '';
    if (selectedFile) {
      try {
        const { uploadDirectToCloudinary } = await import('@/lib/cloudinary');
        logoUrl = await uploadDirectToCloudinary(selectedFile, 'gram2city/cms');
      } catch (err) {
        console.warn('Direct upload failed; falling back to multipart form:', err);
        const fd = new FormData();
        fd.append('logo', selectedFile);
        Object.entries(formValues).forEach(([key, value]) => {
          if (value !== undefined && value !== null) fd.append(key, String(value));
        });
        onSubmit(fd);
        return;
      }
    }
    onSubmit({ ...formValues, logo: logoUrl });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {initialData ? 'Edit Partner' : 'Add New Partner'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">Manage industry trust logos</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">
                    Partner Logo (Transparent PNG Recommended)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-32 w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${previewUrl ? 'border-primary/30' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}`}
                  >
                    {previewUrl ? (
                      <>
                        <Image
                          src={previewUrl}
                          width={200}
                          height={80}
                          className="max-h-20 max-w-[80%] object-contain"
                          alt="Logo"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-black text-xs text-slate-900">
                            <Upload size={12} /> Change Logo
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={24} className="text-slate-300 mx-auto" />
                        <p className="text-slate-400 text-xs font-bold mt-1">Upload logo</p>
                        <p className="text-slate-300 text-[10px] mt-0.5">
                          PNG, JPG or WebP (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Building2 size={12} /> Partner Name
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Hash size={12} /> Order
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    {...register('order', { valueAsNumber: true })}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  />
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl text-slate-500 font-black hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-3.5 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} /> Save Partner
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PartnerModal;
