import { axiosSecure } from '../../api/axios';

export const fetchPaymentHistory = async (email: string) => {
  const res = await axiosSecure.get(`/payments?email=${email}`);
  return Array.isArray(res.data.data) ? res.data.data : [];
};

export const fetchRiderCashouts = async (email: string) => {
  const res = await axiosSecure.get(`/cashouts?rider_email=${email}`);
  return res.data;
};

export const requestCashout = async (parcelId: string) => {
  const res = await axiosSecure.post('/riders/payout', { parcelId });
  return res.data;
};
