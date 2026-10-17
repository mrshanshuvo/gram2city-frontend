import { axiosSecure } from '../../api/axios';

export const fetchUserParcels = async (email: string) => {
  const res = await axiosSecure.get(`/parcels?email=${email}`);
  const data = res.data;
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

export const fetchRiderParcels = async (email: string, status?: string) => {
  const url = status
    ? `/parcels?rider_email=${email}&delivery_status=${status}`
    : `/parcels?rider_email=${email}`;
  const res = await axiosSecure.get(url);
  const data = res.data;
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.parcels)
        ? data.parcels
        : [];
};

export const fetchAssignedParcels = async () => {
  const res = await axiosSecure.get('/rider/parcels');
  return res.data.data;
};

export const deleteParcel = async (parcelId: string) => {
  const res = await axiosSecure.delete(`/parcels/${parcelId}`);
  return res.data;
};

export const fetchParcelById = async (id: string) => {
  const res = await axiosSecure.get(`/parcels/${id}`);
  return res.data.data;
};

import { ParcelFormValues } from './schema';

export const updateParcelDetails = async (id: string, data: ParcelFormValues) => {
  const res = await axiosSecure.patch(`/parcels/${id}`, data);
  return res.data;
};

export const updateParcelStatus = async (parcelId: string, status: string) => {
  const res = await axiosSecure.patch(`/parcels/${parcelId}`, { delivery_status: status });
  return res.data;
};

export const fetchParcelTracking = async (trackingId: string) => {
  const res = await axiosSecure.get(`/trackings/${trackingId}`);
  return res.data;
};

export const fetchPublicTracking = async (trackingId: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/tracking/${trackingId}`).then(
    (r) => r.json(),
  );
  return res.history;
};

export const updateRiderParcelStatus = async (parcelId: string, status: string) => {
  const res = await axiosSecure.patch(`/rider/parcels/${parcelId}/status`, {
    delivery_status: status,
  });
  return res.data;
};

export const markParcelAsPicked = async (parcelId: string) => {
  const res = await axiosSecure.patch(`/parcels/${parcelId}/pick`);
  return res.data;
};

export const markParcelAsDelivered = async (parcelId: string) => {
  const res = await axiosSecure.patch(`/parcels/${parcelId}/deliver`);
  return res.data;
};

export const assignRider = async (parcelId: string, riderId: string) => {
  const res = await axiosSecure.patch(`/parcels/${parcelId}/assign`, {
    riderId,
    delivery_status: 'assigned',
  });
  return res.data;
};
