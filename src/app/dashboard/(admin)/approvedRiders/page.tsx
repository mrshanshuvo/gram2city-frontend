'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { fetchRidersByStatus, updateRiderStatus } from '@/features/riders/api';
import { Rider } from '@/features/riders/types';

const ApprovedRiders = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<{
    data: Rider[];
    pagination: {
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>({
    queryKey: ['approvedRiders', page, size],
    queryFn: () => fetchRidersByStatus('approved', { page, size }),
  });

  const riders = data?.data || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const totalPages = pagination.totalPages;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const startRange = (page - 1) * size + 1;
  const endRange = Math.min(page * size, pagination.totalItems);

  const handleDeactivate = async (id: string) => {
    Swal.fire({
      title: 'Deactivate Rider?',
      text: 'This rider will no longer be able to access the system',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const dataRes = await updateRiderStatus(id, 'inactive');

          if (dataRes.modifiedCount > 0) {
            Swal.fire('Deactivated!', 'Rider has been deactivated.', 'success');
            refetch();
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          Swal.fire('Error!', errorMessage, 'error');
        }
      }
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPpp');
    } catch {
      return 'N/A';
    }
  };

  const filteredRiders = riders.filter(
    (rider) =>
      rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.phone?.includes(searchTerm),
  );

  if (isLoading)
    return (
      <div className="text-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (error) return <div className="alert alert-error">Error loading riders</div>;

  const downloadCSV = () => {
    if (filteredRiders.length === 0) return;

    const headers = ['Rider Name', 'Phone', 'Email', 'Vehicle', 'Reg No', 'District', 'Status'];
    const rows = filteredRiders.map((r) => [
      r.name,
      r.phone || '',
      r.email,
      r.bikeBrand || '',
      r.bikeRegNo || '',
      r.district || '',
      'Approved',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gram2city_riders_report_${new Date().getTime()}.csv`);
    link.click();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 font-outfit">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Rider Management
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Manage approved active field couriers
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
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
          <input
            type="text"
            placeholder="Search riders..."
            className="input input-bordered w-full md:w-64 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {filteredRiders.length === 0 ? (
        <div className="alert alert-info bg-blue-50 dark:bg-slate-900 border-blue-100 dark:border-slate-800 text-blue-700 dark:text-blue-400 font-bold rounded-2xl p-6 text-center">
          {searchTerm ? 'No matching riders found' : 'No approved riders found'}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
                  <th className="py-4 px-6">Rider Info</th>
                  <th>Contact</th>
                  <th>Vehicle</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="text-right px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {filteredRiders.map((rider) => (
                  <tr
                    key={rider._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800 dark:text-slate-100">
                        {rider.name}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                        NID: {rider.nid}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-gray-700 dark:text-slate-200 text-sm">
                        {rider.phone}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        {rider.email}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-gray-800 dark:text-slate-200 text-sm">
                        {rider.bikeBrand}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                        {rider.bikeRegNo}
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
                    <td>
                      <span className="badge badge-success badge-sm font-bold border-none py-3 px-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-xl">
                        Approved
                      </span>
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
                          Details
                        </button>
                        <button
                          onClick={() => handleDeactivate(rider._id)}
                          className="btn btn-xs bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-none hover:bg-red-100 dark:hover:bg-red-900 font-bold rounded-lg cursor-pointer"
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Smart Pagination Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 gap-4">
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Showing <span className="text-gray-800 dark:text-slate-200">{startRange}</span> to{' '}
              <span className="text-gray-800 dark:text-slate-200">{endRange}</span> of{' '}
              <span className="text-gray-800 dark:text-slate-200">{pagination.totalItems}</span>{' '}
              riders
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

      {/* Rider Details Modal */}
      {isModalOpen && selectedRider && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">
              Rider Details: {selectedRider.name}
            </h3>

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
                  <p>
                    <strong className="text-slate-400 dark:text-slate-500">NID:</strong>{' '}
                    {selectedRider.nid}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-widest text-[10px] text-primary">
                    Location & Status
                  </p>
                  <p>
                    <strong className="text-slate-400 dark:text-slate-500">Region:</strong>{' '}
                    {selectedRider.region}
                  </p>
                  <p>
                    <strong className="text-slate-400 dark:text-slate-500">District:</strong>{' '}
                    {selectedRider.district}
                  </p>
                  <p className="mt-2">
                    <span className="badge badge-success text-[9px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-none">
                      {selectedRider.status}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-400 dark:text-slate-500">Since:</strong>{' '}
                    {formatDate(selectedRider.createdAt)}
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
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="btn btn-sm bg-rose-500 hover:bg-rose-600 text-white border-none rounded-xl font-bold px-4 cursor-pointer"
                onClick={() => {
                  if (selectedRider?._id) {
                    handleDeactivate(selectedRider._id);
                  }
                  setIsModalOpen(false);
                }}
              >
                Deactivate Rider
              </button>
              <button
                className="btn btn-sm btn-ghost text-slate-500 dark:text-slate-400 font-bold cursor-pointer"
                onClick={() => setIsModalOpen(false)}
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

export default ApprovedRiders;
