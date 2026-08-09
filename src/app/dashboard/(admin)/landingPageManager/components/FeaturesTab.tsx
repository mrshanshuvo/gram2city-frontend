'use client';

import Image from 'next/image';
import { Edit3, Trash2 } from 'lucide-react';
import { Feature } from '@/features/landing/types';

interface FeaturesTabProps {
  features: Feature[];
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
  onEdit: (feature: Feature) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  renderBulkActionsBar: () => React.ReactNode;
  AddButton: React.ComponentType<{ label: string; onClick: () => void }>;
}

export default function FeaturesTab({
  features,
  selectedItems,
  toggleSelectItem,
  onEdit,
  onDelete,
  onAdd,
  renderBulkActionsBar,
  AddButton,
}: FeaturesTabProps) {
  return (
    <div className="space-y-8 font-outfit">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Platform Features
        </h3>
        <AddButton label="Add Feature" onClick={onAdd} />
      </div>
      {renderBulkActionsBar()}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {features.map((feature: Feature) => (
          <div
            key={feature._id}
            className={`p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 transition-all ${
              !feature.isActive ? 'opacity-60 grayscale-[0.5]' : ''
            } ${
              selectedItems.includes(feature._id as string)
                ? 'ring-2 ring-primary border-transparent'
                : ''
            }`}
          >
            <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative">
              <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(feature._id as string)}
                  onChange={() => toggleSelectItem(feature._id as string)}
                  className="checkbox checkbox-primary checkbox-sm bg-white dark:bg-slate-900 rounded-lg shadow-sm cursor-pointer"
                />
                {!feature.isActive && (
                  <div className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                    Hidden
                  </div>
                )}
              </div>
              {feature.image && (
                <Image
                  src={feature.image}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="w-full h-full object-contain"
                  alt=""
                />
              )}
            </div>
            <div className="flex justify-between items-start">
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                {feature.title || ''}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(feature)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => onDelete(feature._id as string)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
