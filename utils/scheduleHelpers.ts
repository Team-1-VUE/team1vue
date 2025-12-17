// utils/scheduleHelpers.ts
import type {
  Experience,
  TimeSlot,
  ExperienceSchedule,
} from "~/composables/useExperiences";

export type DecoratedTimeSlot = TimeSlot & {
  remaining: number;
  isFull: boolean;
  cannotFitGroup: boolean;
  status: "full" | "few" | "available" | "tooSmall";
};

// * Hämta alla tider för ett visst datum, med status + sortering */
export function getSlotsForDate(
  experience: Experience,
  date: string,
  guestCount: number = 1
): DecoratedTimeSlot[] {
  const schedule: ExperienceSchedule | undefined = experience.schedule;
  if (!schedule) return [];

  const rawSlots = schedule[date] ?? [];
  if (!rawSlots.length) return [];

  return rawSlots
    .map<DecoratedTimeSlot>((slot) => {
      const remaining = slot.capacity - slot.booked;
      const isFull = remaining <= 0;
      const cannotFitGroup = remaining < guestCount;

      let status: DecoratedTimeSlot["status"] = "available";

      if (isFull) {
        status = "full";
      } else if (cannotFitGroup) {
        status = "tooSmall";
      } else if (remaining <= 2) {
        status = "few";
      }

      return {
        ...slot,
        remaining,
        isFull,
        cannotFitGroup,
        status,
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));
}

/** Finns det minst en slot denna dag där gruppen får plats? */
export function hasAvailableSlotForDate(
  experience: Experience,
  date: string,
  guestCount: number
): boolean {
  const slots = getSlotsForDate(experience, date, guestCount);
  return slots.some((slot) => !slot.isFull && !slot.cannotFitGroup);
}

/** Liten helper för att räkna totala gäster från filters */
export function getTotalGuestsFromFilters(filters: {
  adults: number;
  children: number;
  seniors: number;
}): number {
  return (
    (filters.adults || 0) + (filters.children || 0) + (filters.seniors || 0)
  );
}

/**
 * Check slot availability considering cart bookings
 * @param experience - The experience to check
 * @param date - The date to check (YYYY-MM-DD)
 * @param time - The time slot to check (HH:MM)
 * @param requestedGuests - Number of guests to book
 * @param cartItems - Current cart items
 * @param excludeCartIndex - Cart item index to exclude (for edit mode)
 * @returns Object with remaining capacity and availability status
 */
export function checkSlotAvailability(
  experience: Experience,
  date: string,
  time: string,
  requestedGuests: number,
  cartItems: Array<{
    id: string;
    bookingDate?: string;
    bookingTime?: string;
    quantity: number;
    guestCounts?: {
      adults: number;
      children: number;
      seniors: number;
    };
  }>,
  excludeCartIndex?: number
): {
  remaining: number;
  isFull: boolean;
  hasEnoughSpace: boolean;
} {
  // Find the slot in the experience schedule
  const schedule = experience.schedule;
  if (!schedule || !schedule[date]) {
    return { remaining: 0, isFull: true, hasEnoughSpace: false };
  }

  const slot = schedule[date].find((s) => s.time === time);
  if (!slot) {
    return { remaining: 0, isFull: true, hasEnoughSpace: false };
  }

  // Calculate total booked from cart for this specific experience/date/time
  const totalBookedInCart = cartItems.reduce((sum, item, index) => {
    // Skip this item if it's being excluded (edit mode)
    if (excludeCartIndex !== undefined && index === excludeCartIndex) {
      return sum;
    }

    // Only count items matching this experience, date, and time
    if (
      item.id !== experience.id ||
      item.bookingDate !== date ||
      item.bookingTime !== time
    ) {
      return sum;
    }

    // Sum up guests from guestCounts or fallback to quantity
    if (item.guestCounts) {
      return (
        sum +
        item.guestCounts.adults +
        item.guestCounts.children +
        item.guestCounts.seniors
      );
    }

    return sum + item.quantity;
  }, 0);

  const remaining = Math.max(slot.capacity - slot.booked - totalBookedInCart, 0);
  const isFull = remaining === 0;
  const hasEnoughSpace = remaining >= requestedGuests;

  return {
    remaining,
    isFull,
    hasEnoughSpace,
  };
}
