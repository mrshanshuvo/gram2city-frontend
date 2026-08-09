'use client';

import Image from 'next/image';
import { Edit3, Trash2 } from 'lucide-react';
import { Banner } from '@/features/landing/types';

interface BannersTabProps {
  banners: Banner[];
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  renderBulkActionsBar: () => React.ReactNode;
  AddButton: React.ComponentType<{ label: string; onClick: () => void }>;
}

export default function BannersTab({
  banners,
  selectedItems,
  toggleSelectItem,
  onEdit,
  onDelete,
  onAdd,
  renderBulkActionsBar,
  AddButton,
}: BannersTabProps) {
  return (
    <div className="space-y-8 font-outfit">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Hero Banner Slides
        </h3>
        <AddButton label="Add Banner" onClick={onAdd} />
      </div>
      {renderBulkActionsBar()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {banners.map((banner: Banner) => (
          <div
            key={banner._id}
            className={`group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md flex flex-col ${
              !banner.isActive ? 'opacity-75 grayscale-[0.1]' : ''
            } ${selectedItems.includes(banner._id as string) ? 'ring-2 ring-primary border-transparent' : ''}`}
          >
            <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(banner._id as string)}
                  onChange={() => toggleSelectItem(banner._id as string)}
                  className="checkbox checkbox-primary checkbox-sm bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-sm cursor-pointer"
                />
                <span
                  className={`text-xs font-black px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md transition-colors ${
                    banner.isActive ? 'bg-emerald-500/95 text-white' : 'bg-rose-500/95 text-white'
                  }`}
                >
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Order Badge */}
              <span className="absolute top-4 right-4 z-20 bg-slate-900/80 dark:bg-slate-950/80 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md">
                #{banner.order}
              </span>

              <Image
                src={banner.image}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={banner.title || ''}
                priority={true}
              />
              <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3 z-10">
                <button
                  onClick={() => onEdit(banner)}
                  className="p-3 bg-white dark:bg-slate-900 rounded-full text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform shadow-lg cursor-pointer"
                  title="Edit Banner"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => onDelete(banner._id as string)}
                  className="p-3 bg-white dark:bg-slate-900 rounded-full text-rose-600 dark:text-rose-400 hover:scale-110 transition-transform shadow-lg cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 line-clamp-1">
                  {banner.title || 'Untitled Banner'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 mt-2 leading-relaxed">
                  {banner.subtitle || 'No subtitle provided.'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
