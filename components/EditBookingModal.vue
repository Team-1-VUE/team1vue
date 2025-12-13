<script setup lang="ts">
import { computed, reactive, watch } from "vue";

type Guests = { adults: number; children: number; seniors: number };
type Slot = { time: string; capacity: number; booked: number };

const props = defineProps<{
  show: boolean;
  experience: any;
  cartItem: any;
  cartItemIndex: number;
  slot?: Slot | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", payload: { index: number; guests: Guests }): void;
}>();

// local editable copy
const localGuests = reactive<Guests>({
  adults: 0,
  children: 0,
  seniors: 0,
});

// init when modal opens / booking changes
watch(
  () => [props.show, props.cartItem],
  ([show]) => {
    if (!show || !props.cartItem) return;

    const g = props.cartItem.guestCounts ?? {};
    localGuests.adults = g.adults ?? 0;
    localGuests.children = g.children ?? 0;
    localGuests.seniors = g.seniors ?? 0;
  },
  { immediate: true, deep: true }
);

const totalGuests = computed(
  () => localGuests.adults + localGuests.children + localGuests.seniors
);

const originalTotalGuests = computed(() => {
  const g = props.cartItem?.guests ?? {};
  return (g.adults ?? 0) + (g.children ?? 0) + (g.seniors ?? 0);
});

// IMPORTANT: "give back" your own seats before validating
const effectiveAvailableSeats = computed(() => {
  if (!props.slot) return Infinity; // if slot not provided, don't block update

  const capacity = props.slot?.capacity ?? 0;
  const booked = props.slot?.booked ?? 0;
  // seats already owned by this booking:
  const yours = originalTotalGuests.value;

  return Math.max(0, capacity - (booked - yours));
});

const allowsAdults = computed(
  () => !!props.experience?.allowedCategories?.adults
);
const allowsChildren = computed(
  () => !!props.experience?.allowedCategories?.children
);
const allowsSeniors = computed(
  () => !!props.experience?.allowedCategories?.seniors
);

function clampToValid() {
  // optional: keep values >= 0
  localGuests.adults = Math.max(0, localGuests.adults);
  localGuests.children = Math.max(0, localGuests.children);
  localGuests.seniors = Math.max(0, localGuests.seniors);
}

function updateGuests(key: keyof Guests, delta: number) {
  localGuests[key] += delta;
  clampToValid();
}

const hasChanges = computed(
  () => totalGuests.value !== originalTotalGuests.value
);

const meetsMinMax = computed(() => {
  const min = props.experience?.minGuests ?? 1;
  const max = props.experience?.maxGuests ?? Infinity;
  return totalGuests.value >= min && totalGuests.value <= max;
});

const fitsSlot = computed(
  () => totalGuests.value <= effectiveAvailableSeats.value
);

const canUpdate = computed(() => {
  return hasChanges.value && meetsMinMax.value && fitsSlot.value;
});

function submit() {
  if (!canUpdate.value) return;

  emit("update", {
    index: props.cartItemIndex,
    guests: {
      adults: localGuests.adults,
      children: localGuests.children,
      seniors: localGuests.seniors,
    },
  });
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="emit('close')">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="emit('close')">×</button>

        <h2>Ändra bokning</h2>
        <p class="modal-subtitle">{{ experience?.title }}</p>

        <!-- locked context -->
        <div class="edit-context">
          <div><strong>Datum:</strong> {{ cartItem?.bookingDate }}</div>
          <div><strong>Tid:</strong> {{ cartItem?.bookingTime }}</div>
        </div>

        <!-- capacity hint -->
        <p class="capacity-hint">
          Tillgängliga platser för just den här tiden:
          <strong>{{ effectiveAvailableSeats }}</strong>
        </p>

        <!-- guest editor -->
        <div class="guest-editor">
          <h3>Antal gäster</h3>

          <div class="guest-row" v-if="allowsAdults">
            <div class="guest-row__info">
              <span class="guest-row__label">Vuxna</span>
            </div>
            <div class="guest-row__controls">
              <button
                type="button"
                class="guest-btn"
                @click="updateGuests('adults', -1)"
                :disabled="localGuests.adults <= 0">
                −
              </button>
              <span class="guest-count">{{ localGuests.adults }}</span>
              <button
                type="button"
                class="guest-btn"
                @click="updateGuests('adults', 1)">
                +
              </button>
            </div>
          </div>

          <div class="guest-row" v-if="allowsChildren">
            <div class="guest-row__info">
              <span class="guest-row__label">Barn</span>
            </div>
            <div class="guest-row__controls">
              <button
                type="button"
                class="guest-btn"
                @click="updateGuests('children', -1)"
                :disabled="localGuests.children <= 0">
                −
              </button>
              <span class="guest-count">{{ localGuests.children }}</span>
              <button
                type="button"
                class="guest-btn"
                @click="updateGuests('children', 1)">
                +
              </button>
            </div>
          </div>

          <div class="guest-row" v-if="allowsSeniors">
            <div class="guest-row__info">
              <span class="guest-row__label">Seniorer</span>
            </div>
            <div class="guest-row__controls">
              <button
                type="button"
                class="guest-btn"
                @click="updateGuests('seniors', -1)"
                :disabled="localGuests.seniors <= 0">
                −
              </button>
              <span class="guest-count">{{ localGuests.seniors }}</span>
              <button
                type="button"
                class="guest-btn"
                @click="updateGuests('seniors', 1)">
                +
              </button>
            </div>
          </div>

          <!-- validation messages -->
          <p v-if="!meetsMinMax" class="error">
            Antal gäster måste vara mellan {{ experience?.minGuests }} och
            {{ experience?.maxGuests }}.
          </p>

          <p v-else-if="!fitsSlot" class="error">
            För många gäster för den här tiden. Max:
            {{ effectiveAvailableSeats }}.
          </p>
        </div>

        <button class="primary-btn" :disabled="!canUpdate" @click="submit">
          Uppdatera bokning
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Copy-paste your BookingModal styles here (modal-overlay, modal-content, modal-close, etc.) */

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #9ca3af;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.modal-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-subtitle {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.primary-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* guest UI */
.guest-editor {
  margin-top: 16px;
}
.guest-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}
.guest-row__controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.guest-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}
.guest-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.guest-count {
  min-width: 24px;
  text-align: center;
  font-weight: 700;
}

.error {
  margin-top: 10px;
  color: #b91c1c;
  font-weight: 600;
}
</style>
