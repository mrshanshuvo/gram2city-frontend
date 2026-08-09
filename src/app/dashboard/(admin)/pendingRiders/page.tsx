'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { format, parseISO } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchRidersByStatus, updateRiderStatus } from '@/features/riders/api';
import { Rider } from '@/features/riders/types';

const PendingRiders = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pendingRiders', page, size],
    queryFn: () => fetchRidersByStatus('pending', { page, size }),
    staleTime: 60000,
  });

  const riders = data?.data || [];
  const pagination = data?.pagination || { totalItems: 0, totalPages: 1 };
  const totalPages = pagination.totalPages;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const startRange = (page - 1) * size + 1;
  const endRange = Math.min(page * size, pagination.totalItems);

  const handleDecision = async (id: string, decision: string, email?: string) => {
    const isApproving = decision === 'approve';
    const actionText = isApproving ? 'approve' : 'reject';

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${actionText} this rider`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isApproving ? '#3085d6' : '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, ${actionText}!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const dataRes = await updateRiderStatus(id, isApproving ? 'approved' : 'rejected', email);

          if (dataRes.modifiedCount > 0) {
            Swal.fire(
              `${isApproving ? 'Approved' : 'Rejected'}!`,
              `Rider has been ${actionText}d.`,
              'success',
            );
            refetch();
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
          Swal.fire('Error!', errorMsg, 'error');
        }
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRider(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PP');
    } catch (e) {
      console.error('Invalid date format:', e, dateString);
      return 'N/A';
    }
  };

  if (isLoading)
    return (
      <div className="text-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (error) return <div className="alert alert-error">Error: {error.message}</div>;

  const downloadCSV = () => {
    if (riders.length === 0) return;

    const headers = [
      'Applicant Name',
      'Email',
      'Vehicle',
      'Reg No',
      'NID',
      'Age',
      'District',
      'Status',
    ];
    const rows = riders.map((r: Rider) => [
      r.name,
      r.email,
      r.bikeBrand,
      r.bikeRegNo,
      r.nid,
      r.age,
      r.district,
      'Pending',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gram2city_applications_report_${new Date().getTime()}.csv`);
    link.click();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 font-outfit">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Onboarding Applications
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Review and verify incoming rider applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="btn btn-sm bg-primary text-white border-none hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 rounded-xl font-bold cursor-pointer"
          >
            Download Report
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 h-10">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-tight">
              Rows:
            </span>
            <select
              className="select select-ghost select-xs focus:bg-transparent outline-none border-none text-gray-700 dark:text-slate-200 font-bold bg-transparent"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option
                value={10}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                10
              </option>
              <option
                value={25}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                25
              </option>
              <option
                value={50}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              >
                50
              </option>
            </select>
          </div>
          <div className="badge badge-warning font-black py-3 px-4 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40 rounded-xl text-xs uppercase tracking-wider">
            {pagination.totalItems} Applications
          </div>
        </div>
      </div>

      {riders.length === 0 ? (
        <div className="alert alert-info bg-blue-50 dark:bg-slate-900 border-blue-100 dark:border-slate-800 text-blue-700 dark:text-blue-400 font-bold rounded-2xl p-6 text-center">
          No pending applications at the moment.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
                  <th className="py-4 px-6">Applicant</th>
                  <th>Vehicle Info</th>
                  <th>Documents</th>
                  <th>Region</th>
                  <th className="text-right px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {riders.map((rider: Rider) => (
                  <tr
                    key={rider._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800 dark:text-slate-100">
                        {rider.name}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono tracking-tighter">
                        {rider.email}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-gray-800 dark:text-slate-200 text-sm">
                        {rider.bikeBrand}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                        {rider.bikeRegNo}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tight">
                          NID: {rider.nid}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tight">
                          Age: {rider.age}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-bold text-gray-600 dark:text-slate-300">
                        {rider.district}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500">
                        {rider.region}
                      </div>
                    </td>
                    <td className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRider(rider);
                            setIsModalOpen(true);
                          }}
                          className="btn btn-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-none hover:bg-blue-100 dark:hover:bg-blue-900 font-bold rounded-lg cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleDecision(rider._id, 'approve', rider.email)}
                          className="btn btn-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-none hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold rounded-lg cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(rider._id, 'reject')}
                          className="btn btn-xs bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-none hover:bg-red-100 dark:hover:bg-red-900 font-bold rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 gap-4">
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Showing <span className="text-gray-800 dark:text-slate-200">{startRange}</span> to{' '}
              <span className="text-gray-800 dark:text-slate-200">{endRange}</span> of{' '}
              <span className="text-gray-800 dark:text-slate-200">{pagination.totalItems}</span>{' '}
              applicants
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm bg-white dark:bg-slate-800 border-none shadow-sm hover:bg-primary hover:text-white transition-all text-gray-400 dark:text-slate-400 cursor-pointer disabled:opacity-40"
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <FiChevronLeft />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`btn btn-sm w-9 h-9 min-h-0 border-none shadow-sm transition-all cursor-pointer ${
                          page === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span
                        key={pageNum}
                        className="text-gray-300 dark:text-slate-600 font-bold px-1"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                className="btn btn-sm bg-white dark:bg-slate-800 border-none shadow-sm hover:bg-primary hover:text-white transition-all text-gray-400 dark:text-slate-400 cursor-pointer disabled:opacity-40"
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNextPage}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">
              Rider Application Details
            </h3>

            {selectedRider && (
              <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-widest text-[10px] text-primary">
                      Personal Information
                    </p>
                    <p>
                      <strong className="text-slate-400 dark:text-slate-500">Name:</strong>{' '}
                      {selectedRider.name}
                    </p>
                    <p>
                      <strong className="text-slate-400 dark:text-slate-500">Email:</strong>{' '}
                      {selectedRider.email}
                    </p>
                    <p>
                      <strong className="text-slate-400 dark:text-slate-500">Phone:</strong>{' '}
                      {selectedRider.phone}
                    </p>
                    <p>
                      <strong className="text-slate-400 dark:text-slate-500">Age:</strong>{' '}
                      {selectedRider.age}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-widest text-[10px] text-primary">
                      Identification
                    </p>
                    <p>
                      <strong className="text-slate-400 dark:text-slate-500">NID:</strong>{' '}
                      {selectedRider.nid}
                    </p>
                    <p>
                      <strong className="text-slate-400 dark:text-slate-500">Region:</strong>{' '}
                      {selectedRider.region}
                    </p>
                    <p>
                      <strong className="text-slate-400 dark:text-slate-500">District:</strong>{' '}
                      {selectedRider.district}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <p className="font-black uppercase tracking-widest text-[10px] text-primary">
                    Vehicle Information
                  </p>
                  <p>
                    <strong className="text-slate-400 dark:text-slate-500">Brand:</strong>{' '}
                    {selectedRider.bikeBrand}
                  </p>
                  <p>
                    <strong className="text-slate-400 dark:text-slate-500">Registration:</strong>{' '}
                    {selectedRider.bikeRegNo}
                  </p>
                </div>

                {selectedRider.additionalInfo && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <p className="font-black uppercase tracking-widest text-[10px] text-primary">
                      Additional Information
                    </p>
                    <p className="whitespace-pre-line text-slate-500 dark:text-slate-400 font-medium">
                      {selectedRider.additionalInfo}
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <p className="font-black uppercase tracking-widest text-[10px] text-primary">
                    Application Details
                  </p>
                  <p>
                    <strong className="text-slate-400 dark:text-slate-500">Applied On:</strong>{' '}
                    {formatDate(selectedRider.createdAt)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all cursor-pointer"
                onClick={() => {
                  if (selectedRider) {
                    handleDecision(selectedRider._id, 'approve', selectedRider.email);
                  }
                  closeModal();
                }}
              >
                Approve
              </button>
              <button
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all cursor-pointer"
                onClick={() => {
                  if (selectedRider) {
                    handleDecision(selectedRider._id, 'reject', selectedRider.email);
                  }
                  closeModal();
                }}
              >
                Reject
              </button>
              <button
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRiders;
