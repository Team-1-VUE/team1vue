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

/**
 * Hämta alla tider för ett visst datum, med status + sortering
 */
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

/**
 * Finns det minst en slot denna dag där gruppen får plats?
 */
export function hasAvailableSlotForDate(
  experience: Experience,
  date: string,
  guestCount: number
): boolean {
  const slots = getSlotsForDate(experience, date, guestCount);
  return slots.some((slot) => !slot.isFull && !slot.cannotFitGroup);
}

/**
 * Liten helper för att räkna totala gäster från filters
 */
export function getTotalGuestsFromFilters(filters: {
  adults: number;
  children: number;
  seniors: number;
}): number {
  return (
    (filters.adults || 0) + (filters.children || 0) + (filters.seniors || 0)
  );
}
