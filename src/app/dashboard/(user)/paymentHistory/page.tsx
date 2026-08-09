'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/authStore';
import moment from 'moment';
import { fetchPaymentHistory } from '@/features/finance/api';
import { Payment } from '@/features/finance/types';

const PaymentHistory = () => {
  const { user } = useAuthStore();

  const {
    data: paymentHistoryRaw,
    isLoading,
    error,
  } = useQuery({
    enabled: !!user?.email,
    queryKey: ['payment-history', user?.email],
    queryFn: () => {
      if (!user?.email) return [];
      return fetchPaymentHistory(user.email);
    },
  });

  const paymentHistory = paymentHistoryRaw || [];

  const downloadCSV = () => {
    if (paymentHistory.length === 0) return;

    const headers = ['Transaction ID', 'Amount (৳)', 'Payment Method', 'Paid At'];
    const rows = (paymentHistory as Payment[]).map((p) => [
      p.transactionId,
      p.amount,
      p.paymentMethod,
      moment(p.paid_at).format('YYYY-MM-DD HH:mm'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_history_${moment().format('YYYYMMDD')}.csv`);
    link.click();
  };

  if (isLoading) return <div>Loading payment history...</div>;
  if (error) return <div>Error loading payment history</div>;

  return (
    <div className="space-y-6 pb-12 font-outfit">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Payment Invoices & Receipts
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Historical transaction ledger and billing receipts
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="btn btn-sm bg-primary text-white border-none hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 rounded-xl font-bold cursor-pointer"
        >
          Download CSV Report
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
                <th className="px-8 py-5">Transaction ID</th>
                <th className="px-6 py-5">Amount (৳)</th>
                <th className="px-6 py-5">Payment Method</th>
                <th className="px-8 py-5">Paid At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {(paymentHistory as Payment[]).map((payment) => (
                <tr
                  key={payment._id}
                  className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-8 py-5 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {payment.transactionId}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ৳{payment.amount}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="badge badge-ghost border-none bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-tight py-3 px-4 rounded-xl">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {moment(payment.paid_at).format('MMM D, YYYY h:mm A')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paymentHistory.length === 0 && (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-bold italic">
              No payment transactions found on record.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
