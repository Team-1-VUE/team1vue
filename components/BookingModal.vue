<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="$emit('close')">×</button>

        <h2>Välj datum och gäster</h2>
        <p class="modal-subtitle">{{ experience?.title }}</p>

        <!-- Guest Editor -->
        <div class="guest-editor">
          <h3 class="guest-editor__title">Antal gäster</h3>

          <div class="guest-row" v-if="allowsAdults">
            <div class="guest-row__info">
              <span class="guest-row__label">Vuxna</span>
              <span class="guest-row__desc">13+ år</span>
            </div>
            <div class="guest-row__controls">
              <button
                @click="updateGuests('adults', -1)"
                :disabled="localAdults <= 0"
                type="button"
                class="guest-btn">
                −
              </button>
              <span class="guest-count">{{ localAdults }}</span>
              <button
                @click="updateGuests('adults', 1)"
                type="button"
                class="guest-btn"
                :disabled="totalGuests >= maxGuestsForSelection">
                +
              </button>
            </div>
          </div>

          <div class="guest-row" v-if="allowsChildren">
            <div class="guest-row__info">
              <span class="guest-row__label">Barn</span>
              <span class="guest-row__desc">0-12 år</span>
            </div>
            <div class="guest-row__controls">
              <button
                @click="updateGuests('children', -1)"
                :disabled="localChildren <= 0"
                type="button"
                class="guest-btn">
                −
              </button>
              <span class="guest-count">{{ localChildren }}</span>
              <button
                @click="updateGuests('children', 1)"
                type="button"
                class="guest-btn"
                :disabled="totalGuests >= maxGuestsForSelection">
                +
              </button>
            </div>
          </div>

          <div class="guest-row" v-if="allowsSeniors">
            <div class="guest-row__info">
              <span class="guest-row__label">Seniorer</span>
              <span class="guest-row__desc">65+ år</span>
            </div>
            <div class="guest-row__controls">
              <button
                @click="updateGuests('seniors', -1)"
                :disabled="localSeniors <= 0"
                type="button"
                class="guest-btn">
                −
              </button>
              <span class="guest-count">{{ localSeniors }}</span>
              <button
                @click="updateGuests('seniors', 1)"
                type="button"
                class="guest-btn"
                :disabled="totalGuests >= maxGuestsForSelection">
                +
              </button>
            </div>
          </div>

          <div class="guest-total-section">
            <p class="guest-total">
              Totalt: {{ totalGuests }} gäst{{ totalGuests !== 1 ? "er" : "" }}
            </p>

            <p v-if="selectedSlot" class="slot-capacity-hint">
              Platser kvar:
              {{
                Math.max(
                  (selectedSlot.remaining ?? maxGuestsForSelection) -
                    totalGuests,
                  0
                )
              }}
            </p>

            <!-- breakdown per kategori (om categoryPrices finns) -->
            <p v-if="experience?.categoryPrices" class="price-breakdown">
              <span v-if="localAdults">
                {{ localAdults }} × {{ unitPrices.adults }} kr (vuxen)
              </span>
              <span v-if="localChildren">
                <br v-if="localAdults" />
                {{ localChildren }} × {{ unitPrices.children }} kr (barn)
              </span>
              <span v-if="localSeniors">
                <br v-if="localAdults || localChildren" />
                {{ localSeniors }} × {{ unitPrices.seniors }} kr (senior)
              </span>
            </p>

            <p class="price-total">{{ totalPrice }} kr</p>
          </div>
        </div>

        <div class="calendar-container">
          <div class="date-picker-wrapper" @click="dateInput?.showPicker()">
            <div class="date-label">
              <Calendar :size="18" />
              Välj datum för bokning
            </div>
            <div class="date-display">
              <span v-if="!selectedDate" class="placeholder"
                >Klicka för att välja datum</span
              >
              <span v-else class="selected-date">{{
                formatDate(selectedDate)
              }}</span>
            </div>
            <input
              ref="dateInput"
              type="date"
              v-model="selectedDate"
              :min="minDate"
              class="date-picker-hidden" />
          </div>
        </div>

        <!-- Time slots -->
        <div v-if="selectedDate" class="timeslot-section">
          <h3 class="timeslot-title">Välj tid</h3>
          <TimeSlotList
            :experience="experience"
            :selectedDate="selectedDate"
            :guestCount="totalGuests"
            @select="onTimeSelect" />

          <p v-if="selectedTime" class="selected-time-label">
            Vald tid: <strong>{{ selectedTime }}</strong>
          </p>
        </div>

        <div class="modal-actions">
          <button @click="$emit('close')" class="btn btn--secondary">
            Avbryt
          </button>
          <button
            @click="handleConfirm"
            :disabled="!selectedDate || totalGuests === 0 || !selectedTime"
            class="btn btn--primary">
            Bekräfta bokning
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Calendar } from "lucide-vue-next";
import { useCartStore } from "~/stores/useCartStore";
import { useExperiences } from "~/composables/useExperiences";
import TimeSlotList from "~/components/TimeSlotList.vue";
import {
  getSlotsForDate,
  type DecoratedTimeSlot,
} from "~/utils/scheduleHelpers";

interface Props {
  show: boolean;
  experience: any;
  initialDate?: string;
  adults?: number;
  children?: number;
  seniors?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialDate: "",
  adults: 1,
  children: 0,
  seniors: 0,
});
const emit = defineEmits<{
  close: [];
}>();

const cartStore = useCartStore();
const { getAddon } = useExperiences();

const selectedDate = ref("");
const dateInput = ref<HTMLInputElement | null>(null);
const selectedTime = ref<string | null>(null);

// vi sparar hela slot-objektet här
const selectedSlot = ref<DecoratedTimeSlot | null>(null);

const maxGuestsForSelection = computed(() => {
  if (!props.experience) return Infinity;

  // Försök använda remaining från DEN slotten du klickade på
  // annars capacity
  // annars fall back till experience.maxGuests
  const slotLimit =
    selectedSlot.value?.remaining ??
    selectedSlot.value?.capacity ??
    props.experience.maxGuests ??
    Infinity;

  return slotLimit;
});

// Local guest counts that can be edited
const localAdults = ref(props.adults);
const localChildren = ref(props.children);
const localSeniors = ref(props.seniors);

// Computed total guests
const totalGuests = computed(
  () => localAdults.value + localChildren.value + localSeniors.value
);

// Computed total price
const totalPrice = computed(() => {
  if (!props.experience) return 0;

  const cp = props.experience.categoryPrices;

  // Om categoryPrices finns → använd dem, annars fall back till experience.price
  const adultPrice = cp?.adults ?? props.experience.price;
  const childPrice = cp?.children ?? props.experience.price;
  const seniorPrice = cp?.seniors ?? props.experience.price;

  const adultsTotal = localAdults.value * adultPrice;
  const childrenTotal = localChildren.value * childPrice;
  const seniorsTotal = localSeniors.value * seniorPrice;

  const guestsTotal = adultsTotal + childrenTotal + seniorsTotal;

  // addons: vi räknar dem per person (vill du ha per bokning kan vi ändra sen)
  const perGuestAddons =
    props.experience.addons?.reduce((sum: number, slug: string) => {
      const addon = getAddon(slug);
      return sum + (addon?.price || 0);
    }, 0) || 0;

  const totalGuests =
    localAdults.value + localChildren.value + localSeniors.value;

  const addonsTotal = perGuestAddons * totalGuests;

  return guestsTotal + addonsTotal;
});

// Unit prices for each category (vuxen, barn, senior)
const unitPrices = computed(() => {
  if (!props.experience) {
    return { adults: 0, children: 0, seniors: 0 };
  }

  const cp = props.experience.categoryPrices;
  const base = props.experience.price;

  return {
    adults: cp?.adults ?? base,
    children: cp?.children ?? base,
    seniors: cp?.seniors ?? base,
  };
});

const allowsAdults = computed(() => {
  return props.experience?.allowedCategories?.adults ?? true;
});

const allowsChildren = computed(() => {
  return props.experience?.allowedCategories?.children ?? true;
});

const allowsSeniors = computed(() => {
  return props.experience?.allowedCategories?.seniors ?? true;
});

const updateGuests = (
  type: "adults" | "children" | "seniors",
  delta: number
) => {
  if (delta === 0) return;

  const currentTotal = totalGuests.value;

  // Om vi försöker ÖKA men redan är på max → gör inget
  if (delta > 0 && currentTotal >= maxGuestsForSelection.value) {
    return;
  }

  if (type === "adults") {
    localAdults.value = Math.max(0, localAdults.value + delta);
  } else if (type === "children") {
    localChildren.value = Math.max(0, localChildren.value + delta);
  } else if (type === "seniors") {
    localSeniors.value = Math.max(0, localSeniors.value + delta);
  }

  // Safety: om vi ändå skulle passera max (edge case) → clamp tillbaka
  const newTotal = totalGuests.value;
  if (newTotal > maxGuestsForSelection.value) {
    const overflow = newTotal - maxGuestsForSelection.value;
    // enklast: dra av overflow från vuxna
    localAdults.value = Math.max(0, localAdults.value - overflow);
  }
};

// Set minimum date to today, autoimports from utils/date.ts
const minDate = getTodayString();

// Initialize selectedDate and guest counts when modal opens
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      selectedDate.value = props.initialDate || "";
      localAdults.value = props.adults;
      localChildren.value = props.children;
      localSeniors.value = props.seniors;
      selectedTime.value = null;

      // Nolla kategorier som inte är tillåtna
      const ac = props.experience?.allowedCategories;
      if (ac) {
        if (!ac.children) localChildren.value = 0;
        if (!ac.seniors) localSeniors.value = 0;
        if (!ac.adults) localAdults.value = 0;
      }
    } else {
      selectedDate.value = "";
      selectedTime.value = null;
    }
  }
);

watch(selectedDate, () => {
  selectedTime.value = null;
  selectedSlot.value = null;
});

const onTimeSelect = (slot: DecoratedTimeSlot) => {
  selectedSlot.value = slot; // spara hela slotten
  selectedTime.value = slot.time;

  // 🔁 Nollställ gäster när man byter tid
  // starta om från “standard”
  const defaultAdults = props.adults ?? 1;
  const safeAdults = Math.min(defaultAdults, slot.remaining ?? defaultAdults);

  localAdults.value = slot.remaining ? safeAdults || 1 : 0;
  localChildren.value = 0;
  localSeniors.value = 0;

  // Safety: om nuvarande gästantal råkar vara större än den här slotens max → klampa ner
  if (totalGuests.value > maxGuestsForSelection.value) {
    const overflow = totalGuests.value - maxGuestsForSelection.value;
    // enklast: dra av overflow från vuxna först
    localAdults.value = Math.max(0, localAdults.value - overflow);
  }
};

// Sync with props when they change
watch(
  () => [props.adults, props.children, props.seniors],
  () => {
    if (props.show) {
      localAdults.value = props.adults;
      localChildren.value = props.children;
      localSeniors.value = props.seniors;
    }
  }
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

const handleConfirm = () => {
  if (
    !selectedDate.value ||
    !selectedTime.value ||
    !props.experience ||
    totalGuests.value === 0
  )
    return;

  // Get all addons for this experience
  const selectedAddons =
    (props.experience.addons
      ?.map((slug: string) => {
        const addon = getAddon(slug);
        return addon
          ? { slug: addon.slug, title: addon.title, price: addon.price }
          : null;
      })
      .filter(Boolean) as Array<{
      slug: string;
      title: string;
      price: number;
    }>) || [];

  // Add to cart with quantities for each category
  cartStore.addToCart(
    props.experience,
    selectedAddons,
    selectedDate.value,
    localAdults.value,
    localChildren.value,
    localSeniors.value,
    selectedTime.value
  );

  // Reset and close
  selectedDate.value = "";
  selectedTime.value = null;
  emit("close");
};
</script>

<style scoped>
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

/* Guest Editor Styles */
.guest-editor {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.guest-editor__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.guest-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.guest-row__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.guest-row__label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1a1a1a;
}

.guest-row__desc {
  font-size: 0.8125rem;
  color: #6b7280;
}

.guest-row__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.guest-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.guest-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.guest-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.guest-count {
  min-width: 2rem;
  text-align: center;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.guest-total-section {
  margin-top: 1rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guest-total {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.slot-capacity-hint {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.price-breakdown {
  margin: 0.25rem 0 0.35rem;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
}

.price-total {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
}

.calendar-container {
  margin-bottom: 2rem;
}

.date-picker-wrapper {
  display: block;
  width: 100%;
  cursor: pointer;
  position: relative;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.date-picker-wrapper:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.date-picker-wrapper:active {
  transform: scale(0.99);
}

.date-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.date-label :deep(svg) {
  color: #6b7280;
  flex-shrink: 0;
}

.date-display {
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  color: #9ca3af;
  font-size: 0.9375rem;
}

.selected-date {
  color: #1a1a1a;
  font-weight: 600;
  font-size: 0.9375rem;
}

.date-picker-hidden {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

/* Time Slot Styles */
.timeslot-section {
  margin-bottom: 1.5rem;
}

.timeslot-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
}

.selected-time-label {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions .btn {
  flex: 1;
}

.btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn--secondary {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn--secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn--primary {
  background: #1a1a1a;
  color: #fff;
  box-shadow: 0 4px 12px rgba(26, 26, 26, 0.15);
}

.btn--primary:hover:not(:disabled) {
  background: #000;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(26, 26, 26, 0.25);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
