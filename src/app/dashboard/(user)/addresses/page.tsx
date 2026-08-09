'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosSecure } from '@/api/axios';
import { useAuthStore } from '@/features/auth/authStore';
import {
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiHome,
  FiBriefcase,
  FiMap,
  FiStar,
  FiXCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import SkeletonLoader from '@/components/Shared/SkeletonLoader/SkeletonLoader';
import { usePageHeader } from '@/hooks/usePageHeader';

import { Address, NewAddressInput } from '@/types';

const AddressBook = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  usePageHeader('Address Book', 'Manage your frequent delivery points for faster booking');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    fullName: user?.displayName || '',
    phone: '',
    address: '',
    district: '',
    region: '',
    isDefault: false,
  });

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/addresses');
      return res.data.data;
    },
    enabled: !!user?.email,
  });

  const addMutation = useMutation({
    mutationFn: (data: NewAddressInput) => axiosSecure.post('/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsAddModalOpen(false);
      toast.success('New location saved!', { icon: '📍' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosSecure.delete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
  });

  if (isLoading)
    return (
      <div className="space-y-8 pb-12">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </div>
    );

  return (
    <div className="space-y-8 pb-20 font-outfit">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-sm bg-secondary hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20 px-8 rounded-xl font-black uppercase tracking-widest h-11 flex items-center gap-2 cursor-pointer"
        >
          <FiPlus /> New Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((addr: Address) => (
          <div
            key={addr._id}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group hover:shadow-xl transition-all"
          >
            {addr.isDefault && (
              <div className="absolute top-6 right-6 text-amber-500 text-lg">
                <FiStar fill="currentColor" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl">
                {addr.label === 'Home' ? (
                  <FiHome />
                ) : addr.label === 'Office' ? (
                  <FiBriefcase />
                ) : (
                  <FiMapPin />
                )}
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100">{addr.label}</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {addr.district}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="text-sm font-black text-slate-700 dark:text-slate-200">
                {addr.fullName}
              </div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {addr.phone}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed font-medium">
                {addr.address}
              </p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                {addr.region}
              </span>
              <button
                onClick={() => {
                  if (confirm('Delete this address?')) deleteMutation.mutate(addr._id);
                }}
                className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-100 dark:border-slate-800">
            <FiMap className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={64} />
            <p className="text-slate-400 dark:text-slate-500 font-bold italic">
              Your address book is empty.
            </p>
            <p className="text-slate-300 dark:text-slate-600 text-xs mt-1 font-medium">
              Save your frequent shipping points for a faster checkout experience.
            </p>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-100 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 w-full max-w-lg mx-4 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Add New Location
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <FiXCircle size={32} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Label
                  </label>
                  <select
                    className="select bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100 rounded-xl outline-none cursor-pointer"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  >
                    <option className="bg-white dark:bg-slate-900">Home</option>
                    <option className="bg-white dark:bg-slate-900">Office</option>
                    <option className="bg-white dark:bg-slate-900">Warehouse</option>
                    <option className="bg-white dark:bg-slate-900">Other</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    className="input bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  className="input bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl outline-none"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Street Address
                </label>
                <textarea
                  className="textarea bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl min-h-25 outline-none resize-none"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    District
                  </label>
                  <input
                    type="text"
                    className="input bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Division/Region
                  </label>
                  <input
                    type="text"
                    className="input bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100 rounded-xl outline-none"
                    value={newAddress.region}
                    onChange={(e) => setNewAddress({ ...newAddress, region: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary rounded-lg cursor-pointer"
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: e.target.checked,
                    })
                  }
                />
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Set as default address
                </span>
              </div>

              <button
                onClick={() => addMutation.mutate(newAddress)}
                disabled={addMutation.isPending}
                className="btn w-full bg-secondary hover:bg-blue-700 text-white border-none rounded-2xl h-16 font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 cursor-pointer"
              >
                {addMutation.isPending ? 'Saving...' : 'Save to Address Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
