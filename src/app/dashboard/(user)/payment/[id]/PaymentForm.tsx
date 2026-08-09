'use client';

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { axiosSecure } from '@/api/axios';
import { useAuthStore } from '@/features/auth/authStore';
import Swal from 'sweetalert2';
import { useTrackingLogger } from '@/features/parcels/hooks';
import { Parcel } from '@/features/parcels/types';

const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const params = useParams();
  const id = params?.id as string;

  const { user } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { logTracking } = useTrackingLogger();

  const { isPending, data: parcel } = useQuery<Parcel>({
    queryKey: ['parcel', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isPending || !parcel) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <progress className="progress progress-primary w-56"></progress>
      </div>
    );
  }

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    // Step 1: Create Payment Intent
    try {
      const { data } = await axiosSecure.post('/create-payment-intent', {
        amount: parcel.cost,
        parcelId: id,
      });

      const clientSecret = data.clientSecret;

      // Step 2: Confirm Card Payment
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.displayName || 'Unknown',
            email: user?.email || 'Unknown',
          },
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentResult.paymentIntent.status === 'succeeded') {
        const paymentIntent = paymentResult.paymentIntent;

        // Step 3: Save to DB
        const paymentData = {
          parcelId: id,
          email: user?.email,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount,
          paymentTime: paymentIntent.created,
          paymentMethod: paymentIntent.payment_method,
        };

        const paymentRes = await axiosSecure.post('/payments', paymentData);

        if (paymentRes.data.data.paymentInsertResult.insertedId) {
          // Step 4: Show SweetAlert and Redirect
          queryClient.invalidateQueries({
            queryKey: ['payment-history', user?.email],
          });
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            html: `
            <p>Your payment has been completed.</p>
            <p><strong>Transaction ID:</strong> ${paymentIntent.id}</p>
          `,
            confirmButtonText: 'Go to My Parcels',
          }).then(async () => {
            // Log tracking update
            await logTracking({
              trackingId: parcel.trackingId || '',
              status: 'paid',
              details: `Parcel booked by ${user?.displayName}`,
              location: parcel.senderServiceCenter,
              updated_by: user?.email || '',
            });
            router.push('/dashboard/myParcels'); // Adjust the route if necessary
          });
        }
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 grid lg:grid-cols-2 gap-8 p-8 md:p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 font-outfit">
      {/* Parcel Details */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Parcel Summary
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Order details prior to payment
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Parcel Name
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
              {parcel.parcelName}
            </p>
          </div>
          <div>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Weight
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
              {parcel.parcelWeight || parcel.weight} kg
            </p>
          </div>
          <div>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Sender
            </p>
            <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {parcel.senderName} ({parcel.senderContact || parcel.senderPhone})
            </p>
          </div>
          <div>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Receiver
            </p>
            <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {parcel.receiverName} ({parcel.receiverPhoneNumber || parcel.receiverContact})
            </p>
          </div>
          <div className="col-span-2">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Pickup From
            </p>
            <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {parcel.senderAddress}
            </p>
          </div>
          <div className="col-span-2">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Deliver To
            </p>
            <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {parcel.deliveryAddress}
            </p>
          </div>
          <div>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Cost
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-black text-base mt-0.5">
              ৳ {parcel.cost}
            </p>
          </div>
          <div>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
              Tracking ID
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5">
              {parcel.trackingId}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Checkout
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Secure Stripe Gateway
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-xs font-bold">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-6">
          <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#f8fafc',
                    '::placeholder': {
                      color: '#64748b',
                    },
                  },
                  invalid: {
                    color: '#f43f5e',
                  },
                },
              }}
            />
          </div>

          <button
            type="submit"
            className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 cursor-pointer"
            disabled={!stripe || !elements || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing Payment...
              </>
            ) : (
              `Pay ৳${parcel.cost}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
