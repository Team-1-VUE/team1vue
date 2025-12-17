<script setup lang="ts">
import { computed } from "vue";
import type { Experience } from "~/composables/useExperiences";
import {
  getSlotsForDate,
  checkSlotAvailability,
  type DecoratedTimeSlot,
} from "~/utils/scheduleHelpers";
import { useCartStore } from "~/stores/useCartStore";

const props = defineProps<{
  experience: Experience;
  selectedDate: string | null;
  selectedTime?: string;
  guestCount?: number;
  editMode?: boolean;
  cartItemIndex?: number;
}>();

const emit = defineEmits<{
  (e: "select", slot: DecoratedTimeSlot): void;
}>();

const cartStore = useCartStore();

const slots = computed<DecoratedTimeSlot[]>(() => {
  if (!props.selectedDate) return [];

  const guests = props.guestCount ?? 1;

  // Get base slots from schedule
  const baseSlots = getSlotsForDate(
    props.experience,
    props.selectedDate,
    guests
  );

  return baseSlots.map((slot) => {
    // Use centralized availability checking
    const availability = checkSlotAvailability(
      props.experience,
      props.selectedDate!,
      slot.time,
      guests,
      cartStore.items,
      props.editMode ? props.cartItemIndex : undefined
    );

    const { remaining, isFull, hasEnoughSpace } = availability;

    let status: DecoratedTimeSlot["status"] = "available";
    if (isFull) {
      status = "full";
    } else if (!hasEnoughSpace) {
      status = "tooSmall";
    } else if (remaining <= 2) {
      status = "few";
    }

    return {
      ...slot,
      remaining,
      isFull,
      cannotFitGroup: !hasEnoughSpace,
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
              'time-slot-list__button--selected': slot.time === selectedTime,
            }"
            :disabled="slot.isFull || slot.cannotFitGroup"
            @click="handleClick(slot)">
            <span class="time-slot-list__time">
              {{ slot.time }}
            </span>

            <span class="time-slot-list__status" v-if="slot.isFull">
              Fullbokat
            </span>
            <span class="time-slot-list__status" v-else-if="slot.cannotFitGroup">
              Inte tillräckligt med platser
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
  border-color: #3b82f6;
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

.time-slot-list__button--selected {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #2563eb;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
  transform: scale(1.02);
}

.time-slot-list__button--selected:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-color: #1d4ed8;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.time-slot-list__button--selected .time-slot-list__time,
.time-slot-list__button--selected .time-slot-list__status {
  color: #ffffff;
  font-weight: 600;
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
