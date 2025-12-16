<template>
  <Teleport to="body">
    <div
      v-if="show && experience"
      class="modal-overlay"
      @click="$emit('close')"
    >
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
                class="guest-btn"
              >
                −
              </button>
              <span class="guest-count">{{ localAdults }}</span>
              <button
                @click="updateGuests('adults', 1)"
                type="button"
                class="guest-btn"
                :disabled="totalGuests >= maxGuestsForSelection"
              >
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
                class="guest-btn"
              >
                −
              </button>
              <span class="guest-count">{{ localChildren }}</span>
              <button
                @click="updateGuests('children', 1)"
                type="button"
                class="guest-btn"
                :disabled="totalGuests >= maxGuestsForSelection"
              >
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
                class="guest-btn"
              >
                −
              </button>
              <span class="guest-count">{{ localSeniors }}</span>
              <button
                @click="updateGuests('seniors', 1)"
                type="button"
                class="guest-btn"
                :disabled="totalGuests >= maxGuestsForSelection"
              >
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

          <div v-if="validationError" class="validation-error">
            {{ validationError }}
          </div>
        </div>

        <!-- Addon Editor -->
        <div
          v-if="experience?.addons?.length"
          class="guest-editor addon-editor"
        >
          <h3 class="guest-editor__title">Tillval (valfritt)</h3>

          <div
            v-for="(addon, index) in experience.addons"
            :key="index"
            class="guest-row"
          >
            <div class="guest-row__info">
              <span class="guest-row__label">{{
                capitalize(addon.title)
              }}</span>
              <span class="guest-row__desc">+{{ addon.price }} kr/gäst</span>
            </div>
            <div class="guest-row__controls">
              <button
                @click="updateAddonQuantity(addon.title, -1)"
                :disabled="
                  !selectedAddonQuantities[addon.title] ||
                  selectedAddonQuantities[addon.title] === 0
                "
                type="button"
                class="guest-btn"
              >
                −
              </button>
              <span class="guest-count">{{
                selectedAddonQuantities[addon.title] || 0
              }}</span>
              <button
                @click="updateAddonQuantity(addon.title, 1)"
                :disabled="
                  (selectedAddonQuantities[addon.title] || 0) >= totalGuests ||
                  totalGuests === 0
                "
                type="button"
                class="guest-btn"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Date picker (V-Calendar) -->
        <div class="calendar-container">
          <h3 class="timeslot-title">Välj datum</h3>

          <VDatePicker
            v-model="selectedDateObj"
            :min-date="minDateObj"
            :available-dates="availableDateObjects"
            :attributes="calendarAttrs"
            is-required
            expanded
          />

          <p
            v-if="!availableDates.length"
            class="validation-error"
            style="margin-top: 0.75rem"
          >
            Inga tillgängliga datum för denna upplevelse.
          </p>
        </div>

        <!-- Time slots -->
        <div v-if="selectedDate" class="timeslot-section">
          <h3 class="timeslot-title">Välj tid</h3>

          <TimeSlotList
            :experience="experience"
            :selectedDate="selectedDate"
            :guestCount="totalGuests"
            @select="onTimeSelect"
          />

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
            class="btn btn--primary"
          >
            {{ editMode ? "Uppdatera bokning" : "Bekräfta bokning" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/useCartStore";
import { useExperiences } from "~/composables/useExperiences";
import TimeSlotList from "~/components/TimeSlotList.vue";
import { type DecoratedTimeSlot } from "~/utils/scheduleHelpers";

interface Props {
  show: boolean;
  experience: any;
  initialDate?: string;
  adults?: number;
  children?: number;
  seniors?: number;
  editMode?: boolean;
  cartItemIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialDate: "",
  adults: 1,
  children: 0,
  seniors: 0,
  editMode: false,
  cartItemIndex: undefined,
});
const emit = defineEmits<{
  close: [];
  update: [
    payload: {
      index: number;
      date: string;
      time?: string;
      adults: number;
      children: number;
      seniors: number;
      addons: Array<{
        slug: string;
        title: string;
        price: number;
        quantity: number;
      }>;
    }
  ];
}>();

const cartStore = useCartStore();
const { getAddon } = useExperiences();

const selectedDateObj = ref<Date | null>(
  props.initialDate ? new Date(`${props.initialDate}T12:00:00`) : null
);

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMDLocal = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const selectedDate = computed(() =>
  selectedDateObj.value ? toYMDLocal(selectedDateObj.value) : ""
);

const dateInput = ref<HTMLInputElement | null>(null);
const selectedTime = ref<string | undefined>(undefined);

// vi sparar hela slot-objektet här
const selectedSlot = ref<DecoratedTimeSlot | null>(null);

// Local guest counts that can be edited
const localAdults = ref(props.adults);
const localChildren = ref(props.children);
const localSeniors = ref(props.seniors);

// Addon quantities management
const selectedAddonQuantities = ref<Record<string, number>>({});

// Computed total guests
const totalGuests = computed(
  () => localAdults.value + localChildren.value + localSeniors.value
);

const allowsAdults = computed(() => {
  return props.experience?.allowedCategories?.adults ?? true;
});

const allowsChildren = computed(() => {
  return props.experience?.allowedCategories?.children ?? true;
});

const allowsSeniors = computed(() => {
  return props.experience?.allowedCategories?.seniors ?? true;
});

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

// normalize addons so it works whether experience.addons is ["slug"] or [{title,price}]
const normalizedAddons = computed(() => {
  const raw = props.experience?.addons ?? [];
  // slugs
  if (raw.length && typeof raw[0] === "string") {
    return raw
      .map((slug: string) => getAddon(slug))
      .filter(Boolean)
      .map((a: any) => ({
        slug: a.slug ?? a.title,
        title: a.title,
        price: a.price,
      })) as Array<{ slug: string; title: string; price: number }>;
  }
  // objects
  if (raw.length && typeof raw[0] === "object") {
    return raw.map((a: any) => ({
      slug: a.slug ?? a.title,
      title: a.title,
      price: a.price,
    })) as Array<{ slug: string; title: string; price: number }>;
  }
  return [];
});

// Unit prices for categories
const unitPrices = computed(() => {
  const cp = props.experience?.categoryPrices;
  const base = props.experience?.price ?? 0;
  return {
    adults: cp?.adults ?? base,
    children: cp?.children ?? base,
    seniors: cp?.seniors ?? base,
  };
});

// Validation based on experience constraints
const validationError = computed(() => {
  if (!props.experience) return null;

  const total = totalGuests.value;

  // slot capacity check (only meaningful after selecting a time)
  if (selectedTime.value && total > maxGuestsForSelection.value) {
    return `För många gäster för vald tid (max ${maxGuestsForSelection.value})`;
  }

  // Check total guest count
  if (total < props.experience.minGuests) {
    return `Minst ${props.experience.minGuests} gäst${
      props.experience.minGuests > 1 ? "er" : ""
    } krävs`;
  }
  if (total > props.experience.maxGuests) {
    return `Maximalt ${props.experience.maxGuests} gäster tillåtna`;
  }

  // Check category restrictions
  if (
    localChildren.value > 0 &&
    !props.experience.allowedCategories?.children
  ) {
    return "Barn inte tillåtna för denna upplevelse";
  }
  if (localAdults.value > 0 && !props.experience.allowedCategories?.adults) {
    return "Vuxna inte tillåtna för denna upplevelse";
  }
  if (localSeniors.value > 0 && !props.experience.allowedCategories?.seniors) {
    return "Seniorer inte tillåtna för denna upplevelse";
  }

  return null;
});

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

// Update addon quantities with zero-cleanup
const updateAddonQuantity = (title: string, delta: number) => {
  const currentQuantity = selectedAddonQuantities.value[title] || 0;
  const newQuantity = Math.max(
    0,
    Math.min(totalGuests.value, currentQuantity + delta)
  );

  if (newQuantity === 0) {
    // Zero-cleanup: remove from object
    const { [title]: _, ...rest } = selectedAddonQuantities.value;
    selectedAddonQuantities.value = rest;
  } else {
    selectedAddonQuantities.value[title] = newQuantity;
  }
};

// Set minimum date to today, autoimports from utils/date.ts
const minDate = getTodayString();

// --- AVAILABLE DATES FOR CALENDAR ---
const minDateObj = computed(() => new Date(`${minDate}T12:00:00`));

// Available dates from experience (your JSON)
const availableDates = computed<string[]>(() => {
  const schedule = props.experience?.schedule ?? {};

  return Object.entries(schedule)
    .filter(
      ([_, slots]: any) =>
        Array.isArray(slots) &&
        slots.some((s) => (s.capacity ?? 0) > (s.booked ?? 0))
    )
    .map(([date]) => date)
    .sort(); // "YYYY-MM-DD" sorts correctly
});

// const availableDates = computed<string[]>(
//   () => props.experience?.availableDates ?? []
// );

const availableDateObjects = computed(() =>
  availableDates.value.map((d) => new Date(`${d}T12:00:00`))
);

// Highlight available dates
const calendarAttrs = computed(() => [
  {
    key: "available",
    dates: availableDateObjects.value,
    highlight: true,
  },
]);

// Optional: auto-pick first available date when opening modal
watch(
  () => props.show,
  (open) => {
    if (!open) return;

    initializeModalState();

    // if (!selectedDate.value) {
    //   const first = availableDates.value.at(0);
    //   if (first) selectedDate.value = first;
    // }
    if (!selectedDateObj.value) {
      const first = availableDates.value.at(0);
      if (first) selectedDateObj.value = new Date(`${first}T12:00:00`);
    }
  }
);

const initializeModalState = () => {
  // selectedDate.value = props.initialDate ?? "";
  selectedDateObj.value = props.initialDate
    ? new Date(`${props.initialDate}T12:00:00`)
    : null;
  selectedTime.value = undefined;
  selectedSlot.value = null;

  localAdults.value = props.adults;
  localChildren.value = props.children;
  localSeniors.value = props.seniors;

  // zero categories not allowed
  if (!allowsAdults.value) localAdults.value = 0;
  if (!allowsChildren.value) localChildren.value = 0;
  if (!allowsSeniors.value) localSeniors.value = 0;

  // init addon quantities in edit mode
  if (props.editMode && props.cartItemIndex !== undefined) {
    const cartItem = cartStore.items[props.cartItemIndex];
    if (cartItem?.selectedAddons?.length) {
      const q = cartItem.selectedAddons.reduce(
        (acc: Record<string, number>, a: any) => {
          const key = a.slug ?? a.title;
          acc[key] = a.quantity ?? 0;
          return acc;
        },
        {}
      );
      selectedAddonQuantities.value = { ...q };
    } else {
      selectedAddonQuantities.value = {};
    }

    // if cart has time
    selectedTime.value = cartItem?.bookingTime ?? undefined;
  } else {
    selectedAddonQuantities.value = {};
  }
};

// watch(
//   () => props.show,
//   (open) => {
//     if (open) initializeModalState();
//   }
// );
// watch(
//   () => props.show,
//   (open) => {
//     if (open) initializeModalState();
//   }
// );

watch(selectedDate, () => {
  selectedTime.value = undefined;
  selectedSlot.value = null;
});

const onTimeSelect = (slot: DecoratedTimeSlot) => {
  selectedSlot.value = slot;
  selectedTime.value = slot.time;

  // reset guests per selected slot (feature behavior)
  const defaultAdults = props.adults ?? 1;
  const remaining = slot.remaining ?? Infinity;
  const safeAdults = Math.min(defaultAdults, remaining);

  localAdults.value = allowsAdults.value ? safeAdults || 1 : 0;
  localChildren.value = allowsChildren.value ? 0 : 0;
  localSeniors.value = allowsSeniors.value ? 0 : 0;

  if (totalGuests.value > maxGuestsForSelection.value) {
    const overflow = totalGuests.value - maxGuestsForSelection.value;
    localAdults.value = Math.max(0, localAdults.value - overflow);
  }
};

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
  if (!selectedDate.value || !props.experience || totalGuests.value === 0)
    return;

  // map addons with quantities
  const addons = Object.entries(selectedAddonQuantities.value)
    .map(([slug, quantity]) => {
      const addon = normalizedAddons.value.find((a) => a.slug === slug);
      return addon
        ? { slug: addon.slug, title: addon.title, price: addon.price, quantity }
        : null;
    })
    .filter(Boolean) as Array<{
    slug: string;
    title: string;
    price: number;
    quantity: number;
  }>;

  if (props.editMode && props.cartItemIndex !== undefined) {
    emit("update", {
      index: props.cartItemIndex,
      date: selectedDate.value,
      time: selectedTime.value,
      adults: localAdults.value,
      children: localChildren.value,
      seniors: localSeniors.value,
      addons,
    });
  } else {
    // NOTE: this assumes addToCart supports bookingTime as last arg (your feature does).
    cartStore.addToCart(
      props.experience,
      addons,
      selectedDate.value,
      localAdults.value,
      localChildren.value,
      localSeniors.value,
      selectedTime.value
    );
  }
  // Reset and close
  // selectedDate.value = "";
  // selectedTime.value = null;
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

.addon-editor {
  margin-top: 1.5rem;
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
