/**
 * Mock data fixtures for Playwright E2E testing in Gram2City.
 * Provides deterministic, isolated test fixtures matching backend schemas.
 */

export const mockSystemSettings = {
  base_delivery_fee: 50,
  cost_per_kg: 20,
  same_district_fare: 30,
  inter_district_fare: 100,
  express_multiplier: 1.5,
};

export const mockWarehouses = [
  {
    _id: 'wh-1',
    region: 'Dhaka',
    district: 'Dhaka',
    covered_area: ['Mirpur', 'Dhanmondi', 'Gulshan', 'Uttara'],
  },
  {
    _id: 'wh-2',
    region: 'Chittagong',
    district: 'Chittagong',
    covered_area: ['Agrabad', 'Panchlaish', 'Nasirabad'],
  },
  {
    _id: 'wh-3',
    region: 'Rajshahi',
    district: 'Rajshahi',
    covered_area: ['Boalia', 'Motihar', 'Rajpara'],
  },
];

export const mockCustomerUser = {
  _id: 'user-cust-001',
  email: 'customer@gram2city.com',
  displayName: 'Shuvo Customer',
  name: 'Shuvo Customer',
  role: 'user',
  photoURL: 'https://i.pravatar.cc/150?u=customer',
};

export const mockAdminUser = {
  _id: 'user-admin-001',
  email: 'admin@gram2city.com',
  displayName: 'Chief Dispatcher',
  name: 'Chief Dispatcher',
  role: 'admin',
  photoURL: 'https://i.pravatar.cc/150?u=admin',
};

export const mockRiderUser = {
  _id: 'user-rider-001',
  email: 'rider@gram2city.com',
  displayName: 'Rahim Uddin',
  name: 'Rahim Uddin',
  role: 'rider',
  photoURL: 'https://i.pravatar.cc/150?u=rider',
};

export const mockPendingParcel = {
  _id: 'parcel-pending-01',
  trackingId: 'G2C-TEST1234',
  parcelName: 'Handloom Cotton Sarees',
  parcelType: 'Not-Document',
  weight: '2.5',
  requiredVehicle: 'bike',
  cost: 80,
  senderName: 'Shuvo Customer',
  senderContact: '01712345678',
  senderPhone: '01712345678',
  senderRegion: 'Dhaka',
  senderDistrict: 'Dhaka',
  senderServiceCenter: 'Mirpur',
  senderAddress: 'House 12, Road 5, Mirpur-10',
  receiverName: 'Karim Ahmed',
  receiverContact: '01812345678',
  receiverPhone: '01812345678',
  receiverRegion: 'Dhaka',
  receiverDistrict: 'Dhaka',
  receiverServiceCenter: 'Dhanmondi',
  receiverAddress: 'Plot 45, Dhanmondi 27',
  cashOnDelivery: false,
  codAmount: 0,
  payment_status: 'unpaid',
  delivery_status: 'pending',
  creation_date: '2026-10-17T10:00:00.000Z',
  createdAt: '2026-10-17T10:00:00.000Z',
  created_by: 'customer@gram2city.com',
};

export const mockAssignedParcel = {
  ...mockPendingParcel,
  _id: 'parcel-assigned-01',
  trackingId: 'G2C-ASSIGN01',
  delivery_status: 'assigned',
  assigned_rider: 'rider@gram2city.com',
  rider_name: 'Rahim Uddin',
  rider_phone: '01912345678',
};

export const mockAvailableRiders = [
  {
    _id: 'rider-001',
    name: 'Rahim Uddin',
    email: 'rider@gram2city.com',
    phone: '01912345678',
    status: 'approved',
    vehicleType: 'bike',
    is_available: true,
    rating: 4.9,
    totalDeliveries: 142,
  },
  {
    _id: 'rider-002',
    name: 'Kamal Hossain',
    email: 'kamal@gram2city.com',
    phone: '01987654321',
    status: 'approved',
    vehicleType: 'bicycle',
    is_available: true,
    rating: 4.8,
    totalDeliveries: 98,
  },
];

export const mockTrackingTimeline = [
  {
    status: 'not_collected',
    details: 'Parcel booked by Shuvo Customer',
    location: 'Mirpur Hub, Dhaka',
    timestamp: '2026-10-17T10:00:00.000Z',
    updated_by: 'customer@gram2city.com',
  },
  {
    status: 'assigned',
    details: 'Assigned to Rider Rahim Uddin',
    location: 'Mirpur Hub, Dhaka',
    timestamp: '2026-10-17T10:15:00.000Z',
    updated_by: 'admin@gram2city.com',
  },
  {
    status: 'picked_up',
    details: 'Collected from sender',
    location: 'Mirpur, Dhaka',
    timestamp: '2026-10-17T10:45:00.000Z',
    updated_by: 'rider@gram2city.com',
  },
  {
    status: 'on_the_way',
    details: 'Rider is en route to Dhanmondi',
    location: 'Kalyanpur, Dhaka',
    timestamp: '2026-10-17T11:00:00.000Z',
    updated_by: 'rider@gram2city.com',
  },
  {
    status: 'delivered',
    details: 'Handed over to Karim Ahmed',
    location: 'Dhanmondi, Dhaka',
    timestamp: '2026-10-17T11:30:00.000Z',
    updated_by: 'rider@gram2city.com',
  },
];
