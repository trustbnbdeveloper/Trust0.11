
import { Property } from '../types';

export interface PriceBreakdown {
  nights: number;
  nightlyTotal: number;
  basePriceTotal: number;
  extraGuestFee: number;
  cleaningFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  avgNightlyRate: number;
  appliedMultiplier: boolean;
  appliedSeason?: string;
  demandFactor?: number;
}

export const calculatePricing = (
  property: Property,
  checkIn: Date,
  checkOut: Date,
  guestCount: number,
  options?: { isFirstBooking?: boolean }
): PriceBreakdown & { firstBookingDiscount?: number } => {
  // Constants
  const CLEANING_FEE = 85;
  const SERVICE_FEE_PERCENT = 0.12;

  // Rules with defaults
  const rules = property.pricing || {
    basePrice: property.pricePerNight || 100,
    baseGuests: 2,
    extraGuestFee: 25,
    weekendMultiplier: 1.0,
    weeklyDiscount: 0,
    seasonalRules: [],
    dynamicConfig: {
      enabled: false,
      occupancyPremium: 1.0,
      occupancyThreshold: 80,
      lastMinuteDiscount: 1.0,
      earlyBirdDiscount: 1.0
    }
  };

  const oneDay = 24 * 60 * 60 * 1000;
  const nights = Math.round(Math.abs((checkOut.getTime() - checkIn.getTime()) / oneDay));

  if (nights <= 0) {
    return {
      nights: 0, nightlyTotal: 0, basePriceTotal: 0, extraGuestFee: 0,
      cleaningFee: 0, serviceFee: 0, discount: 0, total: 0, avgNightlyRate: 0, appliedMultiplier: false
    };
  }

  /* ------------------------------------------------------------- */
  /*                    DYNAMIC FACTOR CALCULATION                 */
  /* ------------------------------------------------------------- */
  let demandMultiplier = 1.0;
  let leadTimeMultiplier = 1.0;

  if (rules.dynamicConfig?.enabled) {
    // 1. Demand Factor (Occupancy)
    if (property.occupancyRate >= rules.dynamicConfig.occupancyThreshold) {
      demandMultiplier = rules.dynamicConfig.occupancyPremium;
    }

    // 2. Lead Time Factor
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - today.getTime()) / oneDay);

    if (daysUntilCheckIn < 3) {
      leadTimeMultiplier = rules.dynamicConfig.lastMinuteDiscount;
    } else if (daysUntilCheckIn > 60) {
      leadTimeMultiplier = rules.dynamicConfig.earlyBirdDiscount;
    }
  }

  /* ------------------------------------------------------------- */
  /*                    NIGHTLY LOOP                               */
  /* ------------------------------------------------------------- */
  let basePriceTotal = 0;
  let hasWeekend = false;
  let appliedSeasonName: string | undefined = undefined;

  for (let i = 0; i < nights; i++) {
    const currentNight = new Date(checkIn);
    currentNight.setDate(checkIn.getDate() + i);
    const dayOfWeek = currentNight.getDay();

    // 1. Base Price
    let nightlyRate = rules.basePrice;

    // 2. Seasonal Logic (Highest Priority Base Modifier)
    // Check if date falls in any season
    const month = currentNight.getMonth(); // 0-11
    const day = currentNight.getDate(); // 1-31

    if (rules.seasonalRules && rules.seasonalRules.length > 0) {
      for (const season of rules.seasonalRules) {
        // Simple range check (assuming start < end for same year, ignoring wrap for MVP simplicity)
        // A more robust date check handles month wrapping
        const isStart = month > season.startMonth || (month === season.startMonth && day >= season.startDay);
        const isEnd = month < season.endMonth || (month === season.endMonth && day <= season.endDay);

        if (isStart && isEnd) {
          nightlyRate *= season.multiplier;
          appliedSeasonName = season.name;
          // Only apply first matching season for now
          break;
        }
      }
    }

    // 3. Weekend (Fri/Sat)
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    if (isWeekend) {
      hasWeekend = true;
      nightlyRate *= rules.weekendMultiplier;
    }

    // 4. Apply Dynamic Factors (Demand & Lead Time)
    nightlyRate *= demandMultiplier;
    nightlyRate *= leadTimeMultiplier; // Applied on top

    basePriceTotal += nightlyRate;
  }

  // Calculate Extra Guest Fee
  const extraGuests = Math.max(0, guestCount - rules.baseGuests);
  const extraGuestFeeTotal = extraGuests * rules.extraGuestFee * nights;

  // Initial Nightly Total
  let nightlyTotal = basePriceTotal + extraGuestFeeTotal;

  // Apply Weekly Discount
  let discount = 0;
  if (nights >= 7 && rules.weeklyDiscount > 0) {
    discount = nightlyTotal * (rules.weeklyDiscount / 100);
  }

  const discountedNightlyTotal = nightlyTotal - discount;

  // Apply First Booking Discount (10% on Nightly Total) - NEW logic
  let firstBookingDiscount = 0;
  if (options?.isFirstBooking) {
    firstBookingDiscount = discountedNightlyTotal * 0.10;
  }

  const finalNightlyTotal = discountedNightlyTotal - firstBookingDiscount;


  // Service Fee
  const serviceFee = finalNightlyTotal * SERVICE_FEE_PERCENT;

  // Grand Total
  const total = finalNightlyTotal + CLEANING_FEE + serviceFee;

  return {
    nights,
    nightlyTotal: discountedNightlyTotal,
    basePriceTotal,
    extraGuestFee: extraGuestFeeTotal,
    cleaningFee: CLEANING_FEE,
    serviceFee,
    discount,
    firstBookingDiscount, // Verify this field is handled by consumer
    total,
    avgNightlyRate: nightlyTotal / nights,
    appliedMultiplier: hasWeekend && rules.weekendMultiplier > 1,
    appliedSeason: appliedSeasonName,
    demandFactor: demandMultiplier * leadTimeMultiplier
  };
};
