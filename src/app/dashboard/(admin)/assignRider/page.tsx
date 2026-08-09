'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTrackingLogger } from '@/features/parcels/hooks';
import { useAuthStore } from '@/features/auth/authStore';
import { Parcel } from '@/features/parcels/types';
import { assignRider } from '@/features/parcels/api';
import { fetchAllParcels } from '@/features/admin/api';

import { Rider } from '@/features/riders/types';
import { fetchAvailableRiders } from '@/features/riders/api';

const AssignRider: React.FC = () => {
  const queryClient = useQueryClient();
  const { logTracking } = useTrackingLogger();
  const { user } = useAuthStore();

  // State for assignment modal
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedRider, setSelectedRider] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch parcels
  const {
    data: parcels = [],
    isLoading: parcelsLoading,
    error: parcelsError,
  } = useQuery<Parcel[]>({
    queryKey: ['assignableParcels'],
    queryFn: async () => {
      // Admins need to see ALL parcels, so we use the admin endpoint
      const res = await fetchAllParcels({
        status: 'pending',
        size: 100,
        page: 1,
        startDate: '',
        endDate: '',
      });
      // Backend returns { success: true, parcels: [...] } or { data: [...] }
      const data = res.parcels || res.data || [];
      return data.sort(
        (a: Parcel, b: Parcel) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    },
  });

  // Fetch available riders
  const { data: riders = [], isLoading: ridersLoading } = useQuery<Rider[]>({
    queryKey: ['availableRiders'],
    queryFn: () => fetchAvailableRiders(),
  });

  // Assignment mutation
  const assignRiderMutation = useMutation({
    mutationFn: ({ parcelId, riderId }: { parcelId: string; riderId: string }) =>
      assignRider(parcelId, riderId),
    onSuccess: async () => {
      const parcel = selectedParcel;
      if (!parcel) return;

      // Now safe to reset state
      setIsModalOpen(false);
      setSelectedParcel(null);
      setSelectedRider('');

      const toastId = toast.loading('Logging assignment...');

      try {
        queryClient.invalidateQueries({ queryKey: ['assignableParcels'] });
        queryClient.invalidateQueries({ queryKey: ['availableRiders'] });

        await logTracking({
          trackingId: parcel.trackingId || '',
          status: 'assigned',
          details: `Assigned rider ${selectedRider} to parcel ${parcel.trackingId}`,
          location: parcel.senderServiceCenter,
          updated_by: user?.email || '',
        });

        toast.success('Rider assigned successfully!', { id: toastId });
      } catch (err) {
        console.error('Tracking log failed:', err);
        toast.error('Rider assigned, but tracking log failed.', {
          id: toastId,
        });
      }
    },
    onError: (error) => {
      console.error('Assignment failed:', error);
      toast.error('Failed to assign rider. Please try again.');
    },
  });

  const handleAssignClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsModalOpen(true);
    setSelectedRider(''); // Reset rider selection
  };

  const handleConfirmAssignment = () => {
    if (!selectedRider || !selectedParcel) {
      toast.error('Please select a rider');
      return;
    }

    assignRiderMutation.mutate({
      parcelId: selectedParcel._id,
      riderId: selectedRider,
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedParcel(null);
    setSelectedRider('');
  };

  if (parcelsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (parcelsError) {
    return <p className="text-red-500">Failed to load parcels.</p>;
  }

  return (
    <div className="space-y-8 pb-12 font-outfit">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Dispatch Center
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Assign pending parcels to available field riders
          </p>
        </div>
      </div>

      {parcels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 dark:text-slate-500 font-bold italic">
          No pending parcels awaiting dispatch assignment.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
                  <th className="py-5 px-6">#</th>
                  <th>Tracking ID</th>
                  <th>Parcel Name</th>
                  <th>Sender Info</th>
                  <th>Receiver Info</th>
                  <th>Route (From → To)</th>
                  <th>Weight</th>
                  <th>Cost</th>
                  <th className="text-right px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {parcels.map((parcel, index) => (
                  <tr
                    key={parcel._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-5 px-6 font-bold text-slate-400 dark:text-slate-500">
                      {index + 1}
                    </td>
                    <td className="font-mono text-primary font-bold">#{parcel.trackingId}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100">
                      {parcel.parcelName}
                    </td>
                    <td>
                      <div className="text-xs">
                        <div className="font-black text-slate-800 dark:text-slate-100">
                          {parcel.senderName}
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                          {parcel.senderContact}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <div className="font-black text-slate-800 dark:text-slate-100">
                          {parcel.receiverName}
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                          {parcel.receiverPhoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="text-xs">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {parcel.senderRegion}
                      </div>
                      <div className="text-[10px] text-primary font-black">
                        → {parcel.receiverRegion}
                      </div>
                    </td>
                    <td className="font-bold text-slate-600 dark:text-slate-400">
                      {parcel.parcelWeight} kg
                    </td>
                    <td className="font-black text-slate-800 dark:text-slate-100">
                      ৳{parcel.cost}
                    </td>
                    <td className="text-right px-6">
                      <button
                        className="btn btn-sm bg-primary hover:bg-primary/90 text-white border-none rounded-xl font-bold px-4 shadow-sm shadow-primary/20 cursor-pointer"
                        onClick={() => handleAssignClick(parcel)}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {isModalOpen && selectedParcel && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Assign Rider
              </h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                Select an active courier for dispatch
              </p>
            </div>

            {/* Parcel Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Shipment
              </p>
              <p className="font-black text-slate-800 dark:text-slate-100 text-base">
                {selectedParcel.parcelName}
              </p>
              <p className="text-xs font-mono text-primary font-bold">
                ID: #{selectedParcel.trackingId}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                {selectedParcel.senderRegion} → {selectedParcel.receiverRegion}
              </p>
            </div>

            {/* Rider Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Select Available Rider
              </label>
              {ridersLoading ? (
                <div className="flex items-center justify-center py-4 text-slate-400 font-bold text-xs">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="ml-2">Loading riders...</span>
                </div>
              ) : (
                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="select select-bordered w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl"
                >
                  <option
                    value=""
                    className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  >
                    Choose a rider
                  </option>
                  {riders.map((rider) => (
                    <option
                      key={rider._id}
                      value={rider._id}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      {rider.name} - {rider.phone} ({rider.district})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                className="btn btn-sm btn-ghost text-slate-500 dark:text-slate-400 font-bold cursor-pointer"
                onClick={handleModalClose}
                disabled={assignRiderMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm bg-primary hover:bg-primary/90 text-white border-none rounded-xl font-bold px-6 cursor-pointer shadow-md shadow-primary/20"
                onClick={handleConfirmAssignment}
                disabled={assignRiderMutation.isPending || !selectedRider}
              >
                {assignRiderMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Assigning...
                  </>
                ) : (
                  'Confirm Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignRider;
