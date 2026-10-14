export interface ParcelFormData {
  parcelType: 'Document' | 'Not-Document';
  weight: string;
  parcelName: string;
  senderName: string;
  senderContact: string;
  senderRegion: string;
  senderDistrict: string;
  senderServiceCenter: string;
  senderAddress: string;
  pickupInstruction?: string;
  receiverName: string;
  receiverContact: string;
  receiverPhoneNumber?: string; // Alias used in some places
  receiverRegion: string;
  receiverDistrict: string;
  receiverServiceCenter: string;
  deliveryAddress: string;
  deliveryInstruction?: string;
  senderPhone?: string; // Legacy alias support
  requiredVehicle?: 'bike' | 'car' | 'mini_pickup' | 'large_pickup';
  codAmount?: number;
}

export interface Parcel extends ParcelFormData {
  _id: string;
  cost: number;
  parcelWeight?: number; // Used in PendingDeliveries
  created_by?: string | null;
  payment_status: 'paid' | 'unpaid';
  delivery_status:
    | 'pending'
    | 'not_collected'
    | 'collected'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'assigned'
    | 'on_the_way';
  creation_date: string;
  trackingId: string;
  rider_email?: string | null;
  rider_name?: string | null;
  assigned_rider_email?: string | null;
  assigned_rider_name?: string | null;
  assigned_rider_phone?: string | null;
  delivery_date?: string;
  delivered_at?: string;
  picked_at?: string;
  rider_earning?: number;
  total_cost?: number;
  createdAt?: string;
  merchantId?: string;
}

export interface TrackingUpdate {
  _id: string;
  trackingId: string;
  status: string;
  details: string;
  location: string;
  time: string;
  updated_by: string;
}

export interface Area {
  region: string;
  district: string;
  covered_area: string[];
}
