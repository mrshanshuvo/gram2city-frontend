'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Layout, Globe, UserCircle, Zap, Save, Loader2, Upload, ImageIcon } from 'lucide-react';
import { LandingConfig } from '@/features/landing/types';

interface ConfigTabProps {
  config: LandingConfig | undefined;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, ogImageFile?: File | null) => void;
  isSaving: boolean;
}

export default function ConfigTab({ config, onSubmit, isSaving }: ConfigTabProps) {
  const [ogFile, setOgFile] = useState<File | null>(null);
  const [ogPreview, setOgPreview] = useState(config?.seo?.image || '');
  const ogInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOgPreview(config?.seo?.image || '');
    setOgFile(null);
  }, [config?.seo?.image]);

  const handleOgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOgFile(file);
    setOgPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    onSubmit(e, ogFile);
  };
  return (
    <div className="max-w-4xl font-outfit">
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Merchant Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layout className="text-[#2E7D32]" size={24} />
            Merchant Section
          </h2>
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Headline
              </label>
              <input
                name="title"
                defaultValue={config?.merchantSection?.title}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm focus:ring-4 focus:ring-primary/10 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={config?.merchantSection?.description}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium text-sm focus:ring-4 focus:ring-primary/10 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  CTA Text
                </label>
                <input
                  name="ctaText"
                  defaultValue={config?.merchantSection?.ctaText}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  CTA Link
                </label>
                <input
                  name="ctaLink"
                  defaultValue={config?.merchantSection?.ctaLink}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Benefits (Comma separated)
              </label>
              <input
                name="benefits"
                defaultValue={config?.merchantSection?.benefits?.join(', ')}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="text-[#1E5AA8]" size={24} />
            Contact Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Address
              </label>
              <input
                name="address"
                defaultValue={config?.contactInfo?.address}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Phone
              </label>
              <input
                name="phone"
                defaultValue={config?.contactInfo?.phone}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                WhatsApp
              </label>
              <input
                name="whatsapp"
                defaultValue={config?.contactInfo?.whatsapp}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Email
              </label>
              <input
                name="email"
                defaultValue={config?.contactInfo?.email}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCircle className="text-[#F4C20D]" size={24} />
            Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            {['X', 'Facebook', 'LinkedIn', 'Instagram', 'YouTube'].map((s) => (
              <div key={s} className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  {s}
                </label>
                <input
                  name={s.toLowerCase()}
                  defaultValue={
                    config?.socialLinks?.[s.toLowerCase() as keyof LandingConfig['socialLinks']]
                  }
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder={`https://${s.toLowerCase()}.com/...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEO & Marketing */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="text-[#F4C20D]" size={24} />
            SEO & Social Marketing
          </h2>
          <div className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  SEO Title (Google)
                </label>
                <input
                  name="seoTitle"
                  defaultValue={config?.seo?.title}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="e.g. Gram2City | Fastest Village to City Logistics"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  SEO Keywords
                </label>
                <input
                  name="seoKeywords"
                  defaultValue={config?.seo?.keywords}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="logistics, shipping, bangladesh, delivery"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Meta Description
              </label>
              <textarea
                name="seoDescription"
                rows={3}
                defaultValue={config?.seo?.description}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="Tell Google what your site is about..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                OpenGraph Share Image
              </label>
              {/* Upload widget */}
              <div
                onClick={() => ogInputRef.current?.click()}
                className={`relative h-48 w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${
                  ogPreview
                    ? 'border-primary/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {ogPreview ? (
                  <>
                    <Image
                      src={ogPreview}
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover"
                      alt="OG Preview"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-sm text-slate-900 dark:text-slate-100">
                        <Upload size={16} /> Change Image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2 p-8">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto group-hover:scale-110 transition-transform">
                      <ImageIcon size={28} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                      Click to upload OG image
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">
                      Recommended: 1200 × 630 px · PNG or JPG
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={ogInputRef}
                onChange={handleOgFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
              />
              {/* URL fallback — used only when no file is selected */}
              {!ogFile && (
                <input
                  name="seoImage"
                  defaultValue={config?.seo?.image}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400 outline-none"
                  placeholder="…or paste an image URL"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-12 py-5 bg-primary text-white rounded-2xl font-black shadow-xl flex items-center gap-2 hover:bg-primary/90 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
