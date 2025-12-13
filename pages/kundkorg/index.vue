<template>
  <div class="cart-page">
    <h1>Kundkorg</h1>

    <div v-if="cartStore.cartItemCount === 0" class="empty-cart">
      <div class="empty-cart__icon">
        <ShoppingCart :size="64" :stroke-width="1.5" />
      </div>
      <h2 class="empty-cart__title">Din kundkorg är tom</h2>
      <p class="empty-cart__text">
        Utforska våra upplevelser och hitta något spännande att boka!
      </p>
      <NuxtLink to="/" class="btn btn--primary">
        <Compass :size="18" />
        Utforska upplevelser
      </NuxtLink>
    </div>

    <div v-else>
      <div class="cart-items">
        <div
          v-for="(item, index) in cartStore.items"
          :key="`${item.id}-${index}`"
          class="cart-item">
          <!-- container for all -->
          <div @click="handleEditItem(index)" class="cart-item__container">
            <!-- container for img -->
            <div class="cart-item__image-container">
              <img
                :src="item.image"
                :alt="item.title"
                class="cart-item__image" />
            </div>
            <!-- /container for img -->

            <!-- container for event details -->
            <div class="cart-item__details">
              <div>
                <h3>{{ item.title }}</h3>

                <!-- from feature branch -->
                <p v-if="item.owner" class="owner">
                  med {{ capitalize(item.owner) }}
                </p>

                <!-- <p class="description">
                  {{ item.description || "Ingen beskrivning tillgänglig" }}
                </p> -->
                <p class="description">Ingen beskrivning tillgänglig</p>
                <p class="duration">{{ item.duration }}</p>

                <div class="addons">
                  <span class="addons-label">Tillval:</span>
                  <span v-if="item.selectedAddons?.length" class="addons-list">
                    <span
                      v-for="addon in item.selectedAddons"
                      :key="addon.slug"
                      class="addon-item">
                      {{ capitalize(addon.title)
                      }}{{
                        addon.quantity > 1 ? ` ×${addon.quantity}` : ""
                      }}
                      (+{{ addon.price * addon.quantity }} kr)
                    </span>
                  </span>
                  <span v-else class="no-addons">Inga tillval</span>
                </div>
              </div>

              <p v-if="item.bookingDate" class="booking-date">
                <Calendar :size="16" />
                {{ formatDate(item.bookingDate) }}
                <span v-if="item.bookingTime">
                  • kl {{ item.bookingTime }}</span
                >
              </p>
            </div>
            <!-- /container for event details -->

            <!-- container for guest details -->
            <div v-if="item.guestCounts" class="guest-details">
              <p class="guest-counts-label">Antal gäster:</p>
              <ul class="guest-list">
                <li>Vuxna: {{ item.guestCounts.adults || 0 }}</li>
                <li>Barn: {{ item.guestCounts.children || 0 }}</li>
                <li>Pensionärer: {{ item.guestCounts.seniors || 0 }}</li>
              </ul>
              <p class="total-guests">
                Totalt: {{ getTotalGuests(item) }} gäster
              </p>
            </div>
            <!-- /container for guest details -->
          </div>
          <!-- /container for all -->

          <div class="cart-item__actions">
            <p class="item-price">{{ itemTotal(item) }} kr</p>

            <div class="action-buttons">
              <button
                @click.stop="handleEditItem(index)"
                class="btn-edit"
                title="Redigera">
                <Edit :size="20" />
              </button>
              <button
                @click.stop="cartStore.removeFromCart(index)"
                class="btn-remove"
                title="Ta bort">
                <Trash2 :size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Antal bokningar:</span>
          <span>{{ cartStore.cartItemCount }}</span>
        </div>
        <div class="summary-row total">
          <span>Totalt:</span>
          <span class="total-price">{{ cartStore.totalPrice }} kr</span>
        </div>

        <button class="btn btn--primary" @click="handleCheckout">
          Gå till betalning
        </button>
      </div>
    </div>

    <!-- Edit Booking Modal -->
    <!-- <BookingModal
      v-if="editingExperience && editingItemIndex !== null"
      :show="showEditModal"
      :experience="editingExperience"
      :initialDate="cartStore.items[editingItemIndex]?.bookingDate || ''"
      :adults="cartStore.items[editingItemIndex]?.guestCounts?.adults || 1"
      :children="cartStore.items[editingItemIndex]?.guestCounts?.children || 0"
      :seniors="cartStore.items[editingItemIndex]?.guestCounts?.seniors || 0"
      :editMode="true"
      :cartItemIndex="editingItemIndex"
      @update="handleUpdateBooking"
      @close="handleCloseEditModal" /> -->

    <EditBookingModal
      v-if="editingExperience && editingItemIndex !== null"
      :show="showEditModal"
      :experience="editingExperience"
      :cartItem="cartStore.items[editingItemIndex]"
      :cartItemIndex="editingItemIndex"
      :slot="editingSlot"
      @update="handleUpdateBooking"
      @close="handleCloseEditModal" />
  </div>
</template>

<script setup lang="ts">
import { toRaw } from "vue";

import { Calendar, ShoppingCart, Compass, Trash2, Edit } from "lucide-vue-next";
import { useCartStore } from "~/stores/useCartStore";
import { useExperiences } from "~/composables/useExperiences";
// import BookingModal from "~/components/BookingModal.vue";
import EditBookingModal from "~/components/EditBookingModal.vue";

const cartStore = useCartStore();
const { getExperienceById } = useExperiences();

// Edit state
const editingItemIndex = ref<number | null>(null);
const editingExperience = ref<any>(null);
const showEditModal = ref(false);
const editingSlot = ref<{
  time: string;
  capacity: number;
  booked: number;
} | null>(null);

const handleEditItem = (index: number) => {
  const item = cartStore.items[index];
  if (!item) return;

  const experience = getExperienceById(item.id);
  if (!experience) return;

  editingItemIndex.value = index;
  editingExperience.value = experience;

  const date = item.bookingDate;
  const time = item.bookingTime;

  const scheduleForDate = date
    ? (experience.schedule?.[date] as any[] | undefined)
    : undefined;
  editingSlot.value = scheduleForDate?.find((s) => s.time === time) ?? null;

  showEditModal.value = true;
};

// const handleUpdateBooking = (payload: {
//   index: number;
//   date: string;
//   adults: number;
//   children: number;
//   seniors: number;
//   bookingTime?: string;
//   addons: Array<{
//     slug: string;
//     title: string;
//     price: number;
//     quantity: number;
//   }>;
// }) => {
//   cartStore.updateCartItem(
//     payload.index,
//     payload.date,
//     payload.adults,
//     payload.children,
//     payload.seniors,
//     payload.addons,
//     payload.bookingTime
//   );
//   handleCloseEditModal();
// };

const handleUpdateBooking = (payload: {
  index: number;
  guests: { adults: number; children: number; seniors: number };
}) => {
  const item = cartStore.items[payload.index];
  if (!item || !item.bookingDate) return;

  cartStore.updateCartItem(
    payload.index,
    item.bookingDate,
    payload.guests.adults,
    payload.guests.children,
    payload.guests.seniors,
    item.selectedAddons || [],
    item.bookingTime
  );

  handleCloseEditModal();
};

const handleCloseEditModal = () => {
  showEditModal.value = false;
  editingItemIndex.value = null;
  editingExperience.value = null;
  editingSlot.value = null;
};

// ✅ merged pricing logic (from feature branch) + supports addon.quantity
const itemTotal = (item: any) => {
  const guestCounts = item.guestCounts || {
    adults: item.quantity ?? 1,
    children: 0,
    seniors: 0,
  };

  const cp = item.categoryPrices;
  const adultPrice = cp?.adults ?? item.price;
  const childPrice = cp?.children ?? item.price;
  const seniorPrice = cp?.seniors ?? item.price;

  const adultsTotal = (guestCounts.adults || 0) * adultPrice;
  const childrenTotal = (guestCounts.children || 0) * childPrice;
  const seniorsTotal = (guestCounts.seniors || 0) * seniorPrice;

  const guestsTotal = adultsTotal + childrenTotal + seniorsTotal;

  const totalGuests =
    (guestCounts.adults || 0) +
    (guestCounts.children || 0) +
    (guestCounts.seniors || 0);

  const addonsPerGuest = (item.selectedAddons || []).reduce(
    (sum: number, addon: any) => sum + addon.price * (addon.quantity || 1),
    0
  );
  const addonsTotal = addonsPerGuest * totalGuests;

  return guestsTotal + addonsTotal;
};

const getTotalGuests = (item: any) => {
  if (!item.guestCounts) return 0;
  return (
    (item.guestCounts.adults || 0) +
    (item.guestCounts.children || 0) +
    (item.guestCounts.seniors || 0)
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const capitalize = (value: string) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const handleCheckout = () => {
  alert(
    `Tack! Du har blivit debiterad ${cartStore.totalPrice} SEK för din bokning.`
  );
  cartStore.clearCart();
};
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 400px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-cart__icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  color: #9ca3af;
  animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-cart__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.empty-cart__text {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  max-width: 400px;
  line-height: 1.6;
}

.empty-cart .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  gap: 1.5rem;
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.cart-item__container {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  align-items: stretch;
  cursor: pointer;
}

.cart-item__image-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  width: 166px;
  height: 166px;
}

.cart-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  aspect-ratio: 1 / 1;
}

.cart-item__details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
}

.cart-item__details h3 {
  margin: 0;
  font-size: 1.25rem;
}

.duration,
.booking-date,
.description,
.owner {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.booking-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.booking-date :deep(svg) {
  flex-shrink: 0;
}

.addons {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.addons-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0;
}

.addons-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.addon-item {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #6b7280;
}

.no-addons {
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
}

.guest-details {
  flex-shrink: 0;
  min-width: 200px;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  align-self: flex-start;
}

.guest-counts-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.guest-list {
  margin: 0;
  padding-left: 0;
  font-size: 0.875rem;
  color: #6b7280;
  list-style: none;
}

.guest-list li {
  padding: 0.25rem 0;
}

.total-guests {
  margin: 0.5rem 0 0 0;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a1a1a;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
  justify-content: space-between;
  padding-top: 1rem;
  min-width: 80px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.btn-edit {
  padding: 0.5rem;
  border: 1px solid #3b82f6;
  background: transparent;
  color: #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit:hover {
  background: #3b82f6;
  color: white;
}

.btn-remove {
  padding: 0.5rem;
  border: 1px solid #ef4444;
  background: transparent;
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #ef4444;
  color: white;
}

.cart-summary {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row.total {
  border-bottom: none;
  padding-top: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.total-price {
  font-size: 1.5rem;
  color: #1a1a1a;
}

.btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn--primary {
  background: #1a1a1a;
  color: white;
}

.btn--primary:hover {
  background: #000;
  transform: translateY(-2px);
}

/* ✅ Responsive cart layout overrides */
.cart-page {
  padding: 1.25rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 166px 1fr 220px 120px; /* image | details | guests | actions */
  gap: 1rem;
  align-items: start;
}

.cart-item__container {
  display: contents; /* let children participate in grid */
  cursor: default; /* avoid whole row feeling clickable on mobile */
}

.cart-item__image-container {
  grid-column: 1;
  width: 166px;
  height: 166px;
}

.cart-item__details {
  grid-column: 2;
  min-width: 0; /* prevents overflow */
}

.guest-details {
  grid-column: 3;
  min-width: 0;
}

.cart-item__actions {
  grid-column: 4;
  align-items: flex-end;
  padding-top: 0;
  min-width: 0;
}

/* Price + buttons align nicely */
.item-price {
  white-space: nowrap;
}

/* Keep long titles from breaking layout */
.cart-item__details h3 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .cart-item {
    grid-template-columns: 120px 1fr;
    grid-template-areas:
      "img details"
      "guests guests"
      "actions actions";
  }

  .cart-item__image-container {
    grid-area: img;
    width: 120px;
    height: 120px;
  }

  .cart-item__details {
    grid-area: details;
  }

  .guest-details {
    grid-area: guests;
    min-width: 100%;
  }

  .cart-item__actions {
    grid-area: actions;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-width: 100%;
    padding-top: 0.5rem;
  }

  .action-buttons {
    gap: 0.75rem;
  }
}

@media (max-width: 520px) {
  .cart-page {
    padding: 1rem;
  }

  .cart-item {
    grid-template-columns: 1fr;
    grid-template-areas:
      "img"
      "details"
      "guests"
      "actions";
    padding: 1rem;
  }

  .cart-item__image-container {
    grid-area: img;
    width: 100%;
    height: 180px;
  }

  .cart-item__image {
    border-radius: 10px;
  }

  .cart-item__details {
    grid-area: details;
    padding: 0.9rem;
  }

  .guest-details {
    grid-area: guests;
    width: 100%;
  }

  .cart-item__actions {
    grid-area: actions;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .btn-edit,
  .btn-remove {
    padding: 0.6rem;
    border-radius: 10px;
  }

  .item-price {
    font-size: 1.1rem;
  }

  /* Summary goes full width on mobile */
  .cart-summary {
    max-width: 100%;
    margin-left: 0;
    padding: 1.25rem;
  }
}

@media (min-width: 1200px) {
  .cart-item {
    grid-template-columns: 180px 1fr 240px 140px;
    gap: 1.25rem;
  }

  .cart-item__image-container {
    width: 180px;
    height: 180px;
  }
}
</style>
