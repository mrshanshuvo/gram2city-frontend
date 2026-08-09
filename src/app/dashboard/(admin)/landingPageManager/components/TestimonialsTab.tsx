'use client';

import Image from 'next/image';
import { Edit3, Trash2, Quote, Star } from 'lucide-react';
import { Testimonial } from '@/features/landing/types';

interface TestimonialsTabProps {
  testimonials: Testimonial[];
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  renderBulkActionsBar: () => React.ReactNode;
  AddButton: React.ComponentType<{ label: string; onClick: () => void }>;
}

export default function TestimonialsTab({
  testimonials,
  selectedItems,
  toggleSelectItem,
  onEdit,
  onDelete,
  onAdd,
  renderBulkActionsBar,
  AddButton,
}: TestimonialsTabProps) {
  return (
    <div className="space-y-8 font-outfit">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Testimonials & Reviews
        </h3>
        <AddButton label="Add Quote" onClick={onAdd} />
      </div>
      {renderBulkActionsBar()}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t: Testimonial) => (
          <div
            key={t._id}
            className={`p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 relative group transition-all ${
              !t.isActive ? 'opacity-60 grayscale-[0.5]' : ''
            } ${
              selectedItems.includes(t._id as string)
                ? 'ring-2 ring-primary border-transparent'
                : ''
            }`}
          >
            <div className="absolute top-8 right-8 text-slate-200 dark:text-slate-800 group-hover:text-primary/20 transition-colors">
              <Quote size={40} />
            </div>
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedItems.includes(t._id as string)}
                onChange={() => toggleSelectItem(t._id as string)}
                className="checkbox checkbox-primary checkbox-sm bg-white dark:bg-slate-900 rounded-lg shadow-sm cursor-pointer"
              />
              {!t.isActive && (
                <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Hidden
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mb-6">
              <Image
                src={t.image}
                width={56}
                height={56}
                className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100 dark:border-slate-800"
                alt=""
              />
              <div>
                <h4 className="font-black text-slate-900 dark:text-slate-100">{t.name || ''}</h4>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.title || ''}
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium italic mb-6 leading-relaxed">
              "{t.quote}"
            </p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-1 text-[#F4C20D]">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(t)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => onDelete(t._id as string)}
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
