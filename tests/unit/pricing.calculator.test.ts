import { describe, it, expect } from 'vitest';

export interface PricingSettings {
  base_delivery_fee: number;
  cost_per_kg: number;
}

export const defaultSettings: PricingSettings = {
  base_delivery_fee: 50,
  cost_per_kg: 20,
};

export const vehicleMultipliers: Record<string, number> = {
  bike: 1.0,
  car: 1.5,
  mini_pickup: 2.2,
  large_pickup: 3.5,
};

export const calculateParcelCost = (
  weight: number,
  vehicle: string = 'bike',
  settings: PricingSettings = defaultSettings,
): number => {
  const multiplier = vehicleMultipliers[vehicle] || 1.0;
  const baseCost =
    settings.base_delivery_fee + (weight > 1 ? (weight - 1) * settings.cost_per_kg : 0);
  return Math.round(baseCost * multiplier);
};

export const calculateHomeShippingCost = (
  weight: number,
  serviceType: 'regular' | 'express',
  settings: PricingSettings = defaultSettings,
): number => {
  let cost =
    settings.base_delivery_fee + Math.max(0, weight - 1) * settings.cost_per_kg;
  if (serviceType === 'express') {
    cost *= 1.5;
  }
  return Math.round(cost);
};

describe('Pricing Calculation Engine (Client & Server Parity)', () => {
  describe('calculateParcelCost (addParcel & editParcel)', () => {
    it('returns exact base fee for parcels weighing 1kg or less', () => {
      expect(calculateParcelCost(0.5, 'bike')).toBe(50);
      expect(calculateParcelCost(1.0, 'bike')).toBe(50);
    });

    it('calculates incremental cost for weight above 1kg', () => {
      // 50 + (2 - 1) * 20 = 70
      expect(calculateParcelCost(2, 'bike')).toBe(70);
      // 50 + (5 - 1) * 20 = 130
      expect(calculateParcelCost(5, 'bike')).toBe(130);
      // 50 + (10 - 1) * 20 = 230
      expect(calculateParcelCost(10, 'bike')).toBe(230);
    });

    it('applies vehicle multipliers correctly', () => {
      const weight = 5; // Base cost = 130 BDT
      expect(calculateParcelCost(weight, 'bike')).toBe(130); // 130 * 1.0
      expect(calculateParcelCost(weight, 'car')).toBe(195); // 130 * 1.5
      expect(calculateParcelCost(weight, 'mini_pickup')).toBe(286); // 130 * 2.2
      expect(calculateParcelCost(weight, 'large_pickup')).toBe(455); // 130 * 3.5
    });

    it('falls back to multiplier 1.0 for unknown vehicle types', () => {
      expect(calculateParcelCost(5, 'helicopter')).toBe(130);
    });

    it('rounds results to nearest whole integer to prevent IEEE 754 floating-point artifacts', () => {
      // 50 + (1.35 - 1) * 20 = 50 + 7 = 57. Car multiplier (1.5) -> 85.5 -> rounds to 86
      const cost = calculateParcelCost(1.35, 'car');
      expect(cost).toBe(86);
      expect(Number.isInteger(cost)).toBe(true);
    });

    it('respects dynamic custom settings received from /public/settings', () => {
      const customSettings: PricingSettings = {
        base_delivery_fee: 70,
        cost_per_kg: 30,
      };
      // 70 + (4 - 1) * 30 = 160
      expect(calculateParcelCost(4, 'bike', customSettings)).toBe(160);
      // 160 * 1.5 = 240
      expect(calculateParcelCost(4, 'car', customSettings)).toBe(240);
    });
  });

  describe('calculateHomeShippingCost (CostCalculator)', () => {
    it('calculates regular service costs accurately', () => {
      expect(calculateHomeShippingCost(1, 'regular')).toBe(50);
      expect(calculateHomeShippingCost(3, 'regular')).toBe(90); // 50 + 2 * 20
      expect(calculateHomeShippingCost(10, 'regular')).toBe(230);
    });

    it('applies 1.5x multiplier for express service', () => {
      // 1kg express: 50 * 1.5 = 75
      expect(calculateHomeShippingCost(1, 'express')).toBe(75);
      // 2kg express: 70 * 1.5 = 105
      expect(calculateHomeShippingCost(2, 'express')).toBe(105);
      // 5kg express: 130 * 1.5 = 195
      expect(calculateHomeShippingCost(5, 'express')).toBe(195);
    });

    it('never produces fractional cents', () => {
      const cost = calculateHomeShippingCost(1, 'express');
      expect(Number.isInteger(cost)).toBe(true);
    });
  });
});
