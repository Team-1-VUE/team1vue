<script setup lang="ts">
import { computed } from "vue";
import type { Experience } from "~/composables/useExperiences";
import {
  getSlotsForDate,
  type DecoratedTimeSlot,
} from "~/utils/scheduleHelpers";
import { useCartStore } from "~/stores/useCartStore";

const props = defineProps<{
  experience: Experience;
  selectedDate: string | null;
  guestCount?: number;
  editMode?: boolean;
  currentBookingGuests?: number;
}>();

const emit = defineEmits<{
  (e: "select", slot: DecoratedTimeSlot): void;
}>();

const cartStore = useCartStore();

const slots = computed<DecoratedTimeSlot[]>(() => {
  if (!props.selectedDate) return [];

  const guests = props.guestCount ?? 1;

  // Bas-slots från schemat (utan hänsyn till kundkorg)
  const baseSlots = getSlotsForDate(
    props.experience,
    props.selectedDate,
    guests
  );

  return baseSlots.map((slot) => {
    // 🔹 Räkna hur många gäster som redan är bokade för just denna experience + datum + tid
    const bookedForSlot = cartStore.items.reduce((sum, item) => {
      if (
        item.id !== props.experience.id ||
        item.bookingDate !== props.selectedDate ||
        item.bookingTime !== slot.time
      ) {
        return sum;
      }

      if (item.guestCounts) {
        const g = item.guestCounts;
        return sum + g.adults + g.children + g.seniors;
      }

      return sum + item.quantity;
    }, 0);

    // In edit mode, add back the current booking's guests since they'll be freed up
    const adjustedBooked = props.editMode && props.currentBookingGuests
      ? Math.max(bookedForSlot - props.currentBookingGuests, 0)
      : bookedForSlot;

    const remaining = Math.max(slot.remaining - adjustedBooked, 0);
    const cannotFitGroup = remaining < guests;
    const isFull = remaining === 0;

    let status = slot.status;
    if (isFull) status = "full";
    else if (cannotFitGroup) status = "tooSmall";
    else if (remaining <= 2) status = "few";

    return {
      ...slot,
      remaining,
      isFull,
      cannotFitGroup,
      status,
    };
  });
});

const hasAnyUsableSlots = computed(() =>
  slots.value.some((s) => !s.isFull && !s.cannotFitGroup)
);

const handleClick = (slot: DecoratedTimeSlot) => {
  if (slot.isFull || slot.cannotFitGroup) return;
  emit("select", slot);
};
</script>

<template>
  <div class="time-slot-list">
    <p v-if="!selectedDate" class="info">
      Välj ett datum för att se tillgängliga tider.
    </p>

    <template v-else>
      <p v-if="!slots.length" class="info">
        Inga tider hittades för valt datum.
      </p>

      <p v-else-if="!hasAnyUsableSlots" class="info">
        Alla tider för detta datum är antingen fullbokade eller har för få
        platser för din grupp.
      </p>

      <ul v-else class="time-slot-list__items">
        <li v-for="slot in slots" :key="slot.time" class="time-slot-list__item">
          <button
            type="button"
            class="time-slot-list__button"
            :class="{
              'time-slot-list__button--full': slot.isFull,
              'time-slot-list__button--few': slot.status === 'few',
              'time-slot-list__button--too-small': slot.cannotFitGroup,
            }"
            :disabled="slot.isFull || slot.cannotFitGroup"
            @click="handleClick(slot)">
            <span class="time-slot-list__time">
              {{ slot.time }}
            </span>

            <span class="time-slot-list__status" v-if="slot.isFull">
              Fullbokat
            </span>
            <span class="time-slot-list__status" v-else>
              {{ slot.remaining }} platser kvar
              <span v-if="slot.status === 'few'">(få kvar)</span>
            </span>
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.time-slot-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info {
  font-size: 0.9rem;
  color: #6b7280;
}

.time-slot-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.time-slot-list__item {
}

.time-slot-list__button {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s ease;
}

.time-slot-list__button:hover:not(:disabled) {
  border-color: #d97706;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.time-slot-list__button--full,
.time-slot-list__button--too-small {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f3f4f6;
  color: #9ca3af;
}

.time-slot-list__button--too-small .time-slot-list__time,
.time-slot-list__button--full .time-slot-list__time {
  color: #9ca3af;
}

.time-slot-list__button--few {
  border-color: #f59e0b;
}

.time-slot-list__time {
  font-weight: 600;
  color: #111827;
}

.time-slot-list__status {
  font-size: 0.8rem;
  color: #4b5563;
}
</style>
