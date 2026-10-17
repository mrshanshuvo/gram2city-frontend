import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import {
  X,
  Save,
  Zap,
  Type,
  Hash,
  FileText,
  Image as ImageIcon,
  Upload,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Service } from '@/features/landing/types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData | Service) => void;
  initialData?: Service;
  isLoading?: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      icon: 'Zap',
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData || {
          title: '',
          description: '',
          icon: 'Zap',
          order: 0,
          isActive: true,
        },
      );
      setPreviewUrl(initialData?.image || '');
      setSelectedFile(null);
    }
  }, [initialData, isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (formValues: Service) => {
    if (!selectedFile && !initialData?.image) {
      toast.error('Please upload a service illustration image.');
      return;
    }
    let imageUrl = initialData?.image || '';
    if (selectedFile) {
      try {
        const { uploadDirectToCloudinary } = await import('@/lib/cloudinary');
        imageUrl = await uploadDirectToCloudinary(selectedFile, 'gram2city/cms');
      } catch (err) {
        console.warn('Direct upload failed; falling back to multipart form:', err);
        const fd = new FormData();
        fd.append('image', selectedFile);
        Object.entries(formValues).forEach(([key, value]) => {
          if (value !== undefined && value !== null) fd.append(key, String(value));
        });
        onSubmit(fd as unknown as Service);
        return;
      }
    }
    onSubmit({ ...formValues, image: imageUrl });
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
            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {initialData ? 'Edit Service Card' : 'Add New Service'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Define your logistics value prop
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="p-8 space-y-6 overflow-y-auto"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">
                    Service Illustration
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-48 w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${
                      previewUrl
                        ? 'border-primary/30'
                        : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                  >
                    {previewUrl ? (
                      <>
                        <Image
                          src={previewUrl}
                          fill
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 font-black text-sm text-slate-900">
                            <Upload size={16} /> Change Image
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1">
                        <ImageIcon size={24} className="text-slate-300 mx-auto" />
                        <p className="text-slate-500 font-bold text-sm">Upload service image</p>
                        <p className="text-slate-400 text-xs">PNG, JPG or WebP (Max 5MB)</p>
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
                    <Type size={12} /> Service Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    placeholder="e.g. Express Home Delivery"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.title.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={12} /> Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    placeholder="Short description of this service..."
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-600"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.description.message as string}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Zap size={12} /> Fallback Icon Name
                    </label>
                    <input
                      {...register('icon')}
                      placeholder="Zap, Box, Truck..."
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Hash size={12} /> Display Order
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

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900">Live Visibility</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Instantly toggle this service visibility on the landing page
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="sr-only peer"
                      defaultChecked={initialData?.isActive !== false}
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4 shrink-0">
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
                      <Save size={20} /> Save Service
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

export default ServiceModal;
