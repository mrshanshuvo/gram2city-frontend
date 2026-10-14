import { z } from 'zod';

// Base Response Structure
export const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// User Sync / Auth Response
export const userResponseSchema = baseResponseSchema.extend({
  user: z
    .object({
      _id: z.string().optional(),
      email: z.string().email(),
      role: z.enum(['user', 'admin', 'rider', 'merchant', 'superAdmin']),
      name: z.string().optional().nullable(),
      photoURL: z.string().optional().nullable(),
      isProfileComplete: z.boolean().optional(),
    })
    .optional()
    .nullable(),
});

// System Settings Response
export const systemSettingsSchema = z.object({
  base_delivery_fee: z.number(),
  cost_per_kg: z.number(),
  rider_commission_percentage: z.number(),
});

export const systemSettingsResponseSchema = baseResponseSchema.extend({
  settings: systemSettingsSchema.optional().nullable(),
});

// Parcel Response
export const parcelSchema = z.object({
  _id: z.string(),
  trackingId: z.string(),
  parcelName: z.string(),
  weight: z.number(),
  cost: z.number(),
  delivery_status: z.enum([
    'pending',
    'assigned',
    'on_the_way',
    'delivered',
    'cancelled',
    'returned',
    'picked_up',
    'collected',
    'not_collected',
  ]),
  payment_status: z.enum(['paid', 'unpaid']),
  receiverName: z.string(),
  receiverPhone: z.string(),
  deliveryAddress: z.string(),
  receiverDistrict: z.string(),
  createdAt: z.string(),
});

export const parcelListResponseSchema = baseResponseSchema.extend({
  data: z.array(parcelSchema).optional(),
  count: z.number().optional(),
});

export const parcelDetailResponseSchema = baseResponseSchema.extend({
  data: parcelSchema.optional().nullable(),
});
