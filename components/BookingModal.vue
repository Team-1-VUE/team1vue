<template>
  <Teleport to="body">
    <div
      v-if="show && experience"
      class="modal-overlay"
      @click="$emit('close')"
    >
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="$emit('close')">×</button>

        <div class="modal-header">
          <h2>Boka upplevelse</h2>
          <p class="modal-subtitle">{{ experience?.title }}</p>
        </div>

        <div class="modal-body">
        <!-- SECTION 1: Calendar (Date Picker) -->
        <div class="collapsible-section">
          <div 
            class="section-header"
            @click="toggleCalendar"
            @keydown.enter="toggleCalendar"
            @keydown.space.prevent="toggleCalendar"
            role="button"
            tabindex="0"
            :aria-expanded="calendarExpanded"
            aria-controls="calendar-content"
          >
            <div class="section-header-left">
              <Calendar :size="20" />
              <span class="section-title">Datum</span>
            </div>
            <div class="section-header-right">
              <span class="section-preview">{{ calendarPreview }}</span>
              <ChevronDown v-if="!calendarExpanded" :size="20" />
              <ChevronUp v-else :size="20" />
            </div>
          </div>

          <Transition name="collapse">
            <div v-show="calendarExpanded" id="calendar-content" class="section-content">
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
          </Transition>
        </div>

        <!-- SECTION 2: Time Slots - Always shown but disabled if no date -->
        <div class="collapsible-section" :class="{ 'section-disabled': !selectedDate }">
          <div 
            class="section-header"
            @click="toggleTimeSlots"
            @keydown.enter="toggleTimeSlots"
            @keydown.space.prevent="toggleTimeSlots"
            role="button"
            tabindex="0"
            :aria-expanded="timeSlotsExpanded"
            aria-controls="timeslots-content"
          >
            <div class="section-header-left">
              <Clock :size="20" />
              <span class="section-title">Tid</span>
            </div>
            <div class="section-header-right">
              <span class="section-preview">{{ timeSlotsPreview }}</span>
              <ChevronDown v-if="!timeSlotsExpanded" :size="20" />
              <ChevronUp v-else :size="20" />
            </div>
          </div>

          <Transition name="collapse">
            <div v-show="timeSlotsExpanded" id="timeslots-content" class="section-content">
              <TimeSlotList
                v-if="selectedDate"
                :experience="experience"
                :selectedDate="selectedDate"
                :guestCount="totalGuests"
                @select="onTimeSelect"
              />
              <p v-else class="no-date-message">
                Välj ett datum först för att se tillgängliga tider
              </p>
            </div>
          </Transition>
        </div>

        <!-- SECTION 3: Guests & Addons (Combined) -->
        <div class="collapsible-section">
          <div 
            class="section-header"
            @click="toggleGuestAndAddons"
            @keydown.enter="toggleGuestAndAddons"
            @keydown.space.prevent="toggleGuestAndAddons"
            role="button"
            tabindex="0"
            :aria-expanded="guestAndAddonsExpanded"
            aria-controls="guests-addons-content"
          >
            <div class="section-header-left">
              <Users :size="20" />
              <span class="section-title">Gäster & Tillval</span>
            </div>
            <div class="section-header-right">
              <span class="section-preview">{{ guestAndAddonsPreview }}</span>
              <ChevronDown v-if="!guestAndAddonsExpanded" :size="20" />
              <ChevronUp v-else :size="20" />
            </div>
          </div>

          <Transition name="collapse">
            <div v-show="guestAndAddonsExpanded" id="guests-addons-content" class="section-content">
              <!-- Guest Editor -->
              <div class="guest-editor">
                <h4 class="subsection-title">Antal gäster</h4>

                <div class="guest-row" v-if="allowsAdults">
                  <div class="guest-row__info">
                    <span class="guest-row__label">Vuxna ({{ unitPrices.adults }} kr/person)</span>
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
                    <span class="guest-row__label">Barn ({{ unitPrices.children }} kr/person)</span>
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
                    <span class="guest-row__label">Seniorer ({{ unitPrices.seniors }} kr/person)</span>
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

                <div class="guest-total-row">
                  <span class="guest-total-label">Totalt antal gäster:</span>
                  <span class="guest-total-value">{{ totalGuests }}</span>
                </div>

                <!-- Capacity indicator -->
                <div v-if="selectedSlot" class="slot-capacity-hint-inline">
                  Platser kvar: {{ Math.max(maxGuestsForSelection - totalGuests, 0) }}
                </div>
              </div>

              <!-- Addon Editor -->
              <div
                v-if="experience?.addons?.length"
                class="addon-editor"
              >
                <h4 class="subsection-title">Tillval (valfritt)</h4>
                <p class="addon-hint">Du kan välja upp till {{ totalGuests }} av varje tillval</p>

                <div
                  v-for="(addon, index) in experience.addons"
                  :key="index"
                  class="guest-row"
                >
                  <div class="guest-row__info">
                    <span class="guest-row__label">{{ capitalize(addon.title) }} (+{{ addon.price }} kr/st)</span>
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
                        totalGuests === 0 ||
                        (selectedAddonQuantities[addon.title] || 0) >= totalGuests
                      "
                      type="button"
                      class="guest-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        </div>

        <!-- Footer with validation, price, and actions -->
        <div class="modal-footer">
          <div v-if="validationError" class="validation-error-footer">
            {{ validationError }}
          </div>

          <div class="price-footer">
            <span class="price-label">Totalt pris:</span>
            <span class="price-value">{{ totalPrice }} kr</span>
          </div>

          <div class="modal-actions">
            <button @click="$emit('close')" class="btn btn--secondary">
              Avbryt
            </button>

            <button
              @click="handleConfirm"
              :disabled="!selectedDate || totalGuests === 0 || !selectedTime || !!validationError"
              class="btn btn--primary"
            >
              {{ editMode ? "Uppdatera bokning" : "Bekräfta bokning" }}
            </button>
          </div>
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
import { Calendar, Clock, Users, ChevronDown, ChevronUp } from "lucide-vue-next";

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

// Track if modal has been initialized with query params
const hasInitialized = ref(false);
// Track if we're setting date from query params (to prevent auto-expand)
const isSettingFromQueryParams = ref(false);

// Accordion collapse state - initialize based on whether we have query params
const hasQueryParams = !!props.initialDate;
const calendarExpanded = ref(!hasQueryParams); // Collapsed if query params exist
const timeSlotsExpanded = ref(hasQueryParams);  // Expanded if query params exist
const guestAndAddonsExpanded = ref(false);

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

// Toggle functions with accordion behavior and staggered animations
const toggleCalendar = () => {
  if (calendarExpanded.value) {
    // Just close
    calendarExpanded.value = false;
  } else {
    // Close others first, then open after animation
    timeSlotsExpanded.value = false;
    guestAndAddonsExpanded.value = false;
    setTimeout(() => {
      calendarExpanded.value = true;
    }, 300);
  }
};

const toggleTimeSlots = () => {
  if (!selectedDate.value) return; // Prevent opening if no date selected
  
  if (timeSlotsExpanded.value) {
    // Just close
    timeSlotsExpanded.value = false;
  } else {
    // Close others first, then open after animation
    calendarExpanded.value = false;
    guestAndAddonsExpanded.value = false;
    setTimeout(() => {
      timeSlotsExpanded.value = true;
    }, 300);
  }
};

const toggleGuestAndAddons = () => {
  // Prevent collapse if there are validation errors
  if (guestAndAddonsExpanded.value && validationError.value) {
    return; // Don't allow collapse when there's an error
  }
  
  if (guestAndAddonsExpanded.value) {
    // Just close
    guestAndAddonsExpanded.value = false;
  } else {
    // Close others first, then open after animation
    calendarExpanded.value = false;
    timeSlotsExpanded.value = false;
    setTimeout(() => {
      guestAndAddonsExpanded.value = true;
    }, 300);
  }
};

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

// Preview text for collapsed sections
const calendarPreview = computed(() => {
  if (!selectedDate.value) return "Välj datum";
  const date = new Date(selectedDate.value);
  return date.toLocaleDateString("sv-SE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const timeSlotsPreview = computed(() => {
  if (!selectedTime.value) return "Välj tid";
  return `Kl ${selectedTime.value}`;
});

const guestAndAddonsPreview = computed(() => {
  const parts: string[] = [];
  if (localAdults.value) parts.push(`${localAdults.value} vuxna`);
  if (localChildren.value) parts.push(`${localChildren.value} barn`);
  if (localSeniors.value) parts.push(`${localSeniors.value} seniorer`);
  
  const addonCount = Object.values(selectedAddonQuantities.value).reduce((sum, qty) => sum + qty, 0);
  if (addonCount > 0) parts.push(`${addonCount} tillval`);
  
  return parts.length ? parts.join(", ") : "Ange antal gäster";
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

  // Calculate addons based on actual selected quantities
  const addonsTotal = Object.entries(selectedAddonQuantities.value).reduce(
    (sum, [addonTitle, quantity]) => {
      const addon = normalizedAddons.value.find(
        (a) => a.slug === addonTitle || a.title === addonTitle
      );
      return sum + (addon?.price || 0) * quantity;
    },
    0
  );

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

  // Auto-adjust addon quantities if guests decreased - clamp each to new guest count
  if (delta < 0 && totalGuests.value > 0) {
    const newQuantities: Record<string, number> = {};
    Object.entries(selectedAddonQuantities.value).forEach(([title, qty]) => {
      const adjusted = Math.min(qty, totalGuests.value);
      if (adjusted > 0) {
        newQuantities[title] = adjusted;
      }
    });
    selectedAddonQuantities.value = newQuantities;
  } else if (totalGuests.value === 0) {
    // No guests = no addons
    selectedAddonQuantities.value = {};
  }
};

// Update addon quantities - each addon can have up to numberOfGuests independently
const updateAddonQuantity = (title: string, delta: number) => {
  if (totalGuests.value === 0) return; // No guests, no addons

  const currentQuantity = selectedAddonQuantities.value[title] || 0;
  
  // Each addon can have up to totalGuests quantity independently
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

// Modal open watcher with smart initial state
watch(
  () => props.show,
  (open) => {
    if (!open) return;

    // Smart initial expand state - SET BEFORE initializeModalState to prevent watch conflicts
    const hasDateParam = !!props.initialDate;
    
    if (props.editMode) {
      // Edit mode: start with all sections expanded
      calendarExpanded.value = true;
      timeSlotsExpanded.value = true;
      guestAndAddonsExpanded.value = true;
    } else if (hasDateParam) {
      // Query params with date: close calendar, open time slots
      isSettingFromQueryParams.value = true; // Set flag to prevent auto-expand
      calendarExpanded.value = false;
      timeSlotsExpanded.value = true;
      guestAndAddonsExpanded.value = false;
    } else {
      // Default: start with calendar
      calendarExpanded.value = true;
      timeSlotsExpanded.value = false;
      guestAndAddonsExpanded.value = false;
    }

    // Initialize modal state after setting expand states
    initializeModalState();

    // Reset flag after initialization
    nextTick(() => {
      isSettingFromQueryParams.value = false;
    });

    // Auto-select first available date if none selected (only for non-param opens)
    if (!hasDateParam && !selectedDateObj.value) {
      const first = availableDates.value.at(0);
      if (first) selectedDateObj.value = new Date(`${first}T12:00:00`);
    }

    // Mark as initialized after first open
    hasInitialized.value = true;
  }
);

const initializeModalState = () => {
  // Always set date from props.initialDate if provided
  if (props.initialDate) {
    selectedDateObj.value = new Date(`${props.initialDate}T12:00:00`);
  } else if (!hasInitialized.value) {
    selectedDateObj.value = null;
  }

  // Only apply other props on first initialization
  if (!hasInitialized.value) {
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
        const q: Record<string, number> = {};
        cartItem.selectedAddons.forEach((a: any) => {
          // Use title as key to match normalizedAddons
          const key = a.title;
          q[key] = a.quantity ?? 1;
        });
        selectedAddonQuantities.value = q;
      } else {
        selectedAddonQuantities.value = {};
      }

      // if cart has time
      selectedTime.value = cartItem?.bookingTime ?? undefined;
    } else {
      selectedAddonQuantities.value = {};
    }
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

// Auto-collapse calendar and open time slots when date is selected
watch(selectedDate, (newDate) => {
  // Don't auto-expand if we're setting from query params
  if (isSettingFromQueryParams.value) return;
  
  if (newDate && calendarExpanded.value) {
    // Date was just selected, auto-progress to time slots
    calendarExpanded.value = false;
    setTimeout(() => {
      timeSlotsExpanded.value = true;
    }, 300);
  }
});

const onTimeSelect = (slot: DecoratedTimeSlot) => {
  selectedSlot.value = slot;
  selectedTime.value = slot.time;

  // Auto-collapse time slots and open guests+addons with stagger
  calendarExpanded.value = false;
  timeSlotsExpanded.value = false;
  setTimeout(() => {
    guestAndAddonsExpanded.value = true;
  }, 300);
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

  // map addons with quantities (using title as key)
  const addons = Object.entries(selectedAddonQuantities.value)
    .map(([title, quantity]) => {
      const addon = normalizedAddons.value.find(
        (a) => a.title === title || a.slug === title
      );
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
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.modal-header {
  padding: 2rem 2rem 0 2rem;
  flex-shrink: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem;
  margin: 1rem 0;
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

/* Collapsible Section Styles */
.collapsible-section {
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.collapsible-section.section-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  background: #f9fafb;
  transition: all 0.2s;
  user-select: none;
}

.section-header:hover {
  background: #f3f4f6;
}

.section-header:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1a1a1a;
}

.section-header-left svg {
  flex-shrink: 0;
  color: #6b7280;
}

.section-title {
  font-weight: 600;
  font-size: 1rem;
}

.section-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-preview {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.section-header-right svg {
  flex-shrink: 0;
  color: #9ca3af;
  transition: transform 0.3s;
}

.section-content {
  padding: 1.25rem;
  background: white;
}

.no-date-message {
  text-align: center;
  color: #6b7280;
  padding: 1rem;
  font-size: 0.875rem;
}

/* Collapse Transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* Guest Editor Styles */
.guest-editor {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.subsection-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.addon-editor {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
}

.addon-hint {
  font-size: 0.875rem;
  color: #6b7280;
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

.guest-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  /* padding-top: 1rem; */
  /* border-top: 2px solid #e5e7eb; */
  font-weight: 600;
}

.guest-total-label {
  font-size: 0.9375rem;
  color: #374151;
}

.guest-total-value {
  font-size: 1.125rem;
  color: #1a1a1a;
}

.slot-capacity-hint-inline {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

/* Footer Styles */
.modal-footer {
  flex-shrink: 0;
  padding: 1.5rem 2rem 2rem 2rem;
  border-top: 2px solid #e5e7eb;
  background: white;
  border-radius: 0 0 20px 20px;
}

.validation-error-footer {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.price-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.price-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
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

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .modal-content {
    padding: 1.5rem;
    max-width: 100%;
    border-radius: 16px;
  }

  .section-header {
    padding: 0.875rem 1rem;
  }

  .section-content {
    padding: 1rem;
  }

  .section-preview {
    display: none;
  }

  .guest-editor,
  .addon-editor {
    padding: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
