'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Image as ImageIcon,
  Plus,
  Trash2,
  Zap,
  UserCircle,
  RefreshCcw,
  Loader2,
  Star,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

import BannerModal from './components/modals/BannerModal';
import ServiceModal from './components/modals/ServiceModal';
import ProcessStepModal from './components/modals/ProcessStepModal';
import FeatureModal from './components/modals/FeatureModal';
import TestimonialModal from './components/modals/TestimonialModal';
import PartnerModal from './components/modals/PartnerModal';

import BannersTab from './components/BannersTab';
import ServicesTab from './components/ServicesTab';
import FeaturesTab from './components/FeaturesTab';
import TestimonialsTab from './components/TestimonialsTab';
import PartnersTab from './components/PartnersTab';
import StepsTab from './components/StepsTab';
import AvatarsTab from './components/AvatarsTab';
import ConfigTab from './components/ConfigTab';

import {
  fetchLandingData,
  fetchAvatars,
  fetchLandingConfig,
  createLandingItem,
  updateLandingItem,
  deleteLandingItem,
  updateLandingConfig,
  generateAvatars,
  deleteAvatar,
} from '@/features/landing/api';
import {
  Banner,
  Service,
  Feature,
  Testimonial,
  Partner,
  ProcessStep,
  LandingConfig,
  LandingItem,
  Avatar,
} from '@/features/landing/types';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getQueryKey = (type: string): string => {
  if (type === 'processSteps' || type === 'process-steps' || type === 'steps') {
    return 'admin-process-steps';
  }
  return `admin-${type}`;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const LandingPageManager = () => {
  const [activeTab, setActiveTab] = useState<string>('banners');
  const [modalState, setModalState] = useState<{
    type: string | null;
    data: LandingItem | null;
  }>({ type: null, data: null });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setSelectedItems([]);
  }, [activeTab]);

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  // ─── DATA FETCHING ──────────────────────────────────────────────────────────

  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => fetchLandingData('banners'),
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => fetchLandingData('services'),
  });

  const { data: features = [], isLoading: featuresLoading } = useQuery({
    queryKey: ['admin-features'],
    queryFn: () => fetchLandingData('features'),
  });

  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => fetchLandingData('testimonials'),
  });

  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => fetchLandingData('partners'),
  });

  const { data: avatars = [], isLoading: avatarsLoading } = useQuery<Avatar[]>({
    queryKey: ['admin-avatars'],
    queryFn: () => fetchAvatars(),
  });

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => fetchLandingConfig(),
  });

  const { data: processSteps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ['admin-process-steps'],
    queryFn: () => fetchLandingData('processSteps'),
  });

  // ─── MUTATIONS ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: ({ type, data }: { type: string; data: FormData | LandingItem }) =>
      createLandingItem(type, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [getQueryKey(variables.type)],
      });
      toast.success(`${variables.type} created!`);
      setModalState({ type: null, data: null });
    },
    onError: (err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : 'Operation failed';
      toast.error(errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ type, id, data }: { type: string; id: string; data: FormData | LandingItem }) =>
      updateLandingItem(type, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [getQueryKey(variables.type)],
      });
      toast.success(`${variables.type} updated!`);
      setModalState({ type: null, data: null });
    },
    onError: (err: unknown) => {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Update failed';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) => deleteLandingItem(type, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [getQueryKey(variables.type)],
      });
      toast.success('Item removed.');
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: async ({ type, ids }: { type: string; ids: string[] }) => {
      const promises = ids.map((id) =>
        type === 'avatars' ? deleteAvatar(id) : deleteLandingItem(type, id),
      );
      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [getQueryKey(variables.type)],
      });
      toast.success(`${variables.ids.length} items removed.`);
      setSelectedItems([]);
    },
    onError: (err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : 'Bulk delete failed';
      toast.error(errorMsg);
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: (newData: FormData | Partial<LandingConfig>) => updateLandingConfig(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
      toast.success('Configuration saved!');
    },
  });

  const generateAvatarsMutation = useMutation({
    mutationFn: () => generateAvatars(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-avatars'] });
      toast.success('12 New avatars generated!');
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: (id: string) => deleteAvatar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-avatars'] });
      toast.success('Avatar removed.');
    },
  });

  // ─── HANDLERS ──────────────────────────────────────────────────────────────

  const handleModalSubmit = (data: FormData | LandingItem) => {
    if (modalState.data) {
      updateMutation.mutate({
        type: modalState.type!,
        id: (modalState.data as { _id?: string })._id as string,
        data,
      });
    } else {
      createMutation.mutate({ type: modalState.type!, data });
    }
  };

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>, ogImageFile?: File | null) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ogImageUrl = formData.get('seoImage')?.toString() || '';

    // If a file was selected, send as multipart FormData so the server
    // can process the image upload (same pattern as banners/services)
    if (ogImageFile) {
      const fd = new FormData();
      fd.append('ogImage', ogImageFile);
      fd.append('merchantSection[title]', formData.get('title')?.toString() || '');
      fd.append('merchantSection[description]', formData.get('description')?.toString() || '');
      fd.append(
        'merchantSection[ctaText]',
        formData.get('ctaText')?.toString() || 'Become a Merchant',
      );
      fd.append('merchantSection[ctaLink]', formData.get('ctaLink')?.toString() || '/register');
      (formData.get('benefits')?.toString() || '')
        .split(',')
        .map((b) => b.trim())
        .forEach((b) => fd.append('merchantSection[benefits][]', b));
      fd.append('contactInfo[address]', formData.get('address')?.toString() || '');
      fd.append('contactInfo[phone]', formData.get('phone')?.toString() || '');
      fd.append('contactInfo[whatsapp]', formData.get('whatsapp')?.toString() || '');
      fd.append('contactInfo[email]', formData.get('email')?.toString() || '');
      fd.append('socialLinks[twitter]', formData.get('twitter')?.toString() || '');
      fd.append('socialLinks[facebook]', formData.get('facebook')?.toString() || '');
      fd.append('socialLinks[linkedin]', formData.get('linkedin')?.toString() || '');
      fd.append('socialLinks[instagram]', formData.get('instagram')?.toString() || '');
      fd.append('socialLinks[youtube]', formData.get('youtube')?.toString() || '');
      fd.append('seo[title]', formData.get('seoTitle')?.toString() || '');
      fd.append('seo[description]', formData.get('seoDescription')?.toString() || '');
      fd.append('seo[keywords]', formData.get('seoKeywords')?.toString() || '');
      updateConfigMutation.mutate(fd);
      return;
    }

    const newData: LandingConfig = {
      merchantSection: {
        title: formData.get('title')?.toString() || '',
        description: formData.get('description')?.toString() || '',
        benefits:
          formData
            .get('benefits')
            ?.toString()
            .split(',')
            .map((b) => b.trim()) ||
          config?.merchantSection?.benefits ||
          [],
        ctaText: formData.get('ctaText')?.toString() || 'Become a Merchant',
        ctaLink: formData.get('ctaLink')?.toString() || '/register',
      },
      contactInfo: {
        address: formData.get('address')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        whatsapp: formData.get('whatsapp')?.toString() || '',
        email: formData.get('email')?.toString() || '',
      },
      socialLinks: {
        twitter: formData.get('twitter')?.toString() || '',
        facebook: formData.get('facebook')?.toString() || '',
        linkedin: formData.get('linkedin')?.toString() || '',
        instagram: formData.get('instagram')?.toString() || '',
        youtube: formData.get('youtube')?.toString() || '',
      },
      seo: {
        title: formData.get('seoTitle')?.toString() || '',
        description: formData.get('seoDescription')?.toString() || '',
        keywords: formData.get('seoKeywords')?.toString() || '',
        image: ogImageUrl,
      },
    };
    updateConfigMutation.mutate(newData);
  };

  // ─── BULK SELECTION ────────────────────────────────────────────────────────

  const getActiveTabItems = () => {
    switch (activeTab) {
      case 'banners':
        return banners;
      case 'services':
        return services;
      case 'features':
        return features;
      case 'testimonials':
        return testimonials;
      case 'partners':
        return partners;
      case 'steps':
        return processSteps;
      case 'avatars':
        return avatars;
      default:
        return [];
    }
  };

  const activeItems = getActiveTabItems();
  const activeIds = activeItems.map((item: { _id?: string }) => item._id as string).filter(Boolean);
  const allSelected =
    activeIds.length > 0 && activeIds.every((id: string) => selectedItems.includes(id));
  const someSelected = activeIds.some((id: string) => selectedItems.includes(id)) && !allSelected;

  const handleSelectAllToggle = () => {
    if (allSelected) {
      setSelectedItems((prev) => prev.filter((id: string) => !activeIds.includes(id)));
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...activeIds])]);
    }
  };

  const handleBulkDelete = () => {
    const activeSelectedIds = selectedItems.filter((id: string) => activeIds.includes(id));
    if (activeSelectedIds.length === 0) return;
    const deleteType = activeTab === 'steps' ? 'processSteps' : activeTab;
    deleteMultipleMutation.mutate({
      type: deleteType,
      ids: activeSelectedIds,
    });
  };

  const renderBulkActionsBar = () => {
    if (activeTab === 'config' || activeItems.length === 0) return null;
    const currentTabSelectedCount = selectedItems.filter((id) => activeIds.includes(id)).length;

    return (
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={handleSelectAllToggle}
            className="checkbox checkbox-primary checkbox-sm rounded-lg"
          />
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {currentTabSelectedCount} / {activeItems.length} Selected
          </span>
        </div>
        {currentTabSelectedCount > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleteMultipleMutation.isPending}
            className="btn btn-sm bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl gap-2 shadow-md transition-all border-none cursor-pointer"
          >
            {deleteMultipleMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} /> Delete Selected ({currentTabSelectedCount})
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  // ─── SHARED SUB-COMPONENTS ─────────────────────────────────────────────────

  const TabButton = ({
    id,
    label,
    icon: Icon,
  }: {
    id: string;
    label: string;
    icon: React.ElementType;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
        activeTab === id
          ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="btn bg-primary hover:bg-primary/90 text-white border-none rounded-xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 px-6 cursor-pointer"
    >
      <Plus size={20} />
      {label}
    </button>
  );

  // ─── LOADING ────────────────────────────────────────────────────────────────

  if (
    bannersLoading ||
    servicesLoading ||
    configLoading ||
    avatarsLoading ||
    stepsLoading ||
    featuresLoading ||
    testimonialsLoading ||
    partnersLoading
  ) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#2E7D32]" size={40} />
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-20 font-outfit">
      {/* Tab Bar */}
      <div className="flex flex-wrap gap-3 pb-2">
        <TabButton id="banners" label="Hero Banners" icon={ImageIcon} />
        <TabButton id="services" label="Services" icon={Zap} />
        <TabButton id="features" label="Features" icon={Star} />
        <TabButton id="testimonials" label="Testimonials" icon={MessageSquare} />
        <TabButton id="partners" label="Partners" icon={Building2} />
        <TabButton id="steps" label="Process Steps" icon={RefreshCcw} />
        <TabButton id="avatars" label="Avatars" icon={UserCircle} />
        <TabButton id="config" label="Config" icon={Layout} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm min-h-100"
        >
          {activeTab === 'banners' && (
            <BannersTab
              banners={banners as Banner[]}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              onEdit={(banner) => setModalState({ type: 'banners', data: banner })}
              onDelete={(id) => deleteMutation.mutate({ type: 'banners', id })}
              onAdd={() => setModalState({ type: 'banners', data: null })}
              renderBulkActionsBar={renderBulkActionsBar}
              AddButton={AddButton}
            />
          )}

          {activeTab === 'services' && (
            <ServicesTab
              services={services as Service[]}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              onEdit={(service) => setModalState({ type: 'services', data: service })}
              onDelete={(id) => deleteMutation.mutate({ type: 'services', id })}
              onAdd={() => setModalState({ type: 'services', data: null })}
              renderBulkActionsBar={renderBulkActionsBar}
              AddButton={AddButton}
            />
          )}

          {activeTab === 'features' && (
            <FeaturesTab
              features={features as Feature[]}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              onEdit={(feature) => setModalState({ type: 'features', data: feature })}
              onDelete={(id) => deleteMutation.mutate({ type: 'features', id })}
              onAdd={() => setModalState({ type: 'features', data: null })}
              renderBulkActionsBar={renderBulkActionsBar}
              AddButton={AddButton}
            />
          )}

          {activeTab === 'testimonials' && (
            <TestimonialsTab
              testimonials={testimonials as Testimonial[]}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              onEdit={(t) => setModalState({ type: 'testimonials', data: t })}
              onDelete={(id) => deleteMutation.mutate({ type: 'testimonials', id })}
              onAdd={() => setModalState({ type: 'testimonials', data: null })}
              renderBulkActionsBar={renderBulkActionsBar}
              AddButton={AddButton}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersTab
              partners={partners as Partner[]}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              onEdit={(p) => setModalState({ type: 'partners', data: p })}
              onDelete={(id) => deleteMutation.mutate({ type: 'partners', id })}
              onAdd={() => setModalState({ type: 'partners', data: null })}
              renderBulkActionsBar={renderBulkActionsBar}
              AddButton={AddButton}
            />
          )}

          {activeTab === 'steps' && (
            <StepsTab
              processSteps={processSteps as ProcessStep[]}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              onEdit={(step) => setModalState({ type: 'processSteps', data: step })}
              onDelete={(id) => deleteMutation.mutate({ type: 'processSteps', id })}
              onAdd={() => setModalState({ type: 'processSteps', data: null })}
              renderBulkActionsBar={renderBulkActionsBar}
              AddButton={AddButton}
            />
          )}

          {activeTab === 'avatars' && (
            <AvatarsTab
              avatars={avatars}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              onDelete={(id) => deleteAvatarMutation.mutate(id)}
              onBulkDelete={(ids) => deleteMultipleMutation.mutate({ type: 'avatars', ids })}
              isBulkDeleting={deleteMultipleMutation.isPending}
              onMagicGenerate={() => generateAvatarsMutation.mutate()}
              generatePending={generateAvatarsMutation.isPending}
            />
          )}

          {activeTab === 'config' && (
            <ConfigTab
              config={config as LandingConfig}
              onSubmit={handleSaveConfig}
              isSaving={updateConfigMutation.isPending}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <BannerModal
        isOpen={modalState.type === 'banners'}
        onClose={() => setModalState({ type: null, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data as Banner | undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      <ServiceModal
        isOpen={modalState.type === 'services'}
        onClose={() => setModalState({ type: null, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data as Service | undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      <ProcessStepModal
        isOpen={modalState.type === 'processSteps'}
        onClose={() => setModalState({ type: null, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data as ProcessStep | undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      <FeatureModal
        isOpen={modalState.type === 'features'}
        onClose={() => setModalState({ type: null, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data as Feature | undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      <TestimonialModal
        isOpen={modalState.type === 'testimonials'}
        onClose={() => setModalState({ type: null, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data as Testimonial | undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      <PartnerModal
        isOpen={modalState.type === 'partners'}
        onClose={() => setModalState({ type: null, data: null })}
        onSubmit={handleModalSubmit}
        initialData={modalState.data as Partner | undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default LandingPageManager;
