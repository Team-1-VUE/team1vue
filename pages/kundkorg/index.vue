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
          class="cart-item"
        >
          <div class="cart-item__container" @click="handleEditItem(index)">
            <!-- Image -->
            <div class="cart-item__image-container">
              <img
                :src="item.image"
                :alt="item.title"
                class="cart-item__image"
              />
            </div>

            <!-- Details -->
            <div class="cart-item__details">
              <!-- Title & Owner -->
              <div class="details-header">
                <h3 class="item-title">{{ item.title }}</h3>
                <span class="badge-owner"
                  >med {{ capitalize(item.owner) }}</span
                >
              </div>

              <!-- Date & Time -->
              <div v-if="item.bookingDate" class="booking-info">
                <span class="booking-info__item">
                  <Calendar :size="16" />
                  {{ formatDate(item.bookingDate) }}
                </span>
                <span v-if="item.bookingTime" class="booking-info__item">
                  <Clock :size="16" />
                  {{ item.bookingTime }}
                </span>
              </div>

              <!-- Guest Badges -->
              <div v-if="item.guestCounts" class="guest-badges">
                <span
                  v-if="item.guestCounts.adults > 0"
                  class="badge badge-guest"
                >
                  {{ item.guestCounts.adults }} × Vuxna
                </span>
                <span
                  v-if="item.guestCounts.children > 0"
                  class="badge badge-guest"
                >
                  {{ item.guestCounts.children }} × Barn
                </span>
                <span
                  v-if="item.guestCounts.seniors > 0"
                  class="badge badge-guest"
                >
                  {{ item.guestCounts.seniors }} × Senior
                </span>
              </div>

              <!-- Addon Badges (always rendered for consistent spacing) -->
              <div class="addon-badges">
                <template
                  v-if="item.selectedAddons && item.selectedAddons.length > 0"
                >
                  <span
                    v-for="(addon, addonIndex) in item.selectedAddons"
                    :key="`addon-${addonIndex}-${addon.title}`"
                    class="badge badge-addon"
                  >
                    {{ addon.quantity }} x {{ capitalize(addon.title) }}
                  </span>
                </template>
                <span v-else class="badge badge-addon badge-placeholder"
                  >&nbsp;</span
                >
              </div>
            </div>

            <!-- Price & Actions -->
            <div class="cart-item__actions">
              <!-- Price Breakdown (Desktop) -->
              <div class="price-breakdown">
                <div v-if="item.guestCounts" class="price-details">
                  <div v-if="item.guestCounts.adults > 0" class="price-line">
                    <span>{{ item.guestCounts.adults }} vuxna</span>
                    <span
                      >{{
                        (item.categoryPrices?.adults ?? item.price) *
                        item.guestCounts.adults
                      }}
                      kr</span
                    >
                  </div>
                  <div v-if="item.guestCounts.children > 0" class="price-line">
                    <span>{{ item.guestCounts.children }} barn</span>
                    <span
                      >{{
                        (item.categoryPrices?.children ?? item.price) *
                        item.guestCounts.children
                      }}
                      kr</span
                    >
                  </div>
                  <div v-if="item.guestCounts.seniors > 0" class="price-line">
                    <span>{{ item.guestCounts.seniors }} senior</span>
                    <span
                      >{{
                        (item.categoryPrices?.seniors ?? item.price) *
                        item.guestCounts.seniors
                      }}
                      kr</span
                    >
                  </div>
                  <div
                    v-if="item.selectedAddons && item.selectedAddons.length > 0"
                    class="price-line"
                  >
                    <span>Tillval</span>
                    <span
                      >{{
                        item.selectedAddons.reduce(
                          (sum, a) => sum + a.price * (a.quantity || 1),
                          0
                        )
                      }}
                      kr</span
                    >
                  </div>
                </div>
                <div class="price-total">
                  <span>Totalt</span>
                  <span class="total-amount">{{ itemTotal(item) }} kr</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button
                  @click.stop="handleEditItem(index)"
                  class="btn-edit"
                  title="Redigera"
                >
                  <Edit :size="20" />
                </button>
                <button
                  @click.stop="cartStore.removeFromCart(index)"
                  class="btn-remove"
                  title="Ta bort"
                >
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
      <BookingModal
        v-if="editingExperience && editingItemIndex !== null"
        :show="showEditModal"
        :experience="editingExperience"
        :initialDate="cartStore.items[editingItemIndex]?.bookingDate || ''"
        :initialTime="cartStore.items[editingItemIndex]?.bookingTime || ''"
        :adults="cartStore.items[editingItemIndex]?.guestCounts?.adults || 1"
        :children="
          cartStore.items[editingItemIndex]?.guestCounts?.children || 0
        "
        :seniors="cartStore.items[editingItemIndex]?.guestCounts?.seniors || 0"
        :initialAddons="
          cartStore.items[editingItemIndex]?.selectedAddons?.map((a) => ({
            title: a.title,
            quantity: a.quantity,
          })) || []
        "
        :editMode="true"
        :cartItemIndex="editingItemIndex"
        @update="handleUpdateBooking"
        @close="handleCloseEditModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRaw } from "vue";

import {
  Calendar,
  ShoppingCart,
  Compass,
  Trash2,
  Edit,
  Clock,
} from "lucide-vue-next";
import { useCartStore } from "~/stores/useCartStore";
import { useExperiences } from "~/composables/useExperiences";
import BookingModal from "~/components/BookingModal.vue";

const cartStore = useCartStore();
const { getExperienceById } = useExperiences();

// Edit state
const editingItemIndex = ref<number | null>(null);
const editingExperience = ref<any>(null);
const showEditModal = ref(false);

const handleEditItem = (index: number) => {
  const item = cartStore.items[index];
  if (!item) return;

  const experience = getExperienceById(item.id);
  if (!experience) return;

  editingItemIndex.value = index;
  editingExperience.value = experience;
  showEditModal.value = true;
};

const handleUpdateBooking = (payload: {
  index: number;
  date: string;
  time?: string;
  adults: number;
  children: number;
  seniors: number;
  addons: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
}) => {
  const item = cartStore.items[payload.index];
  if (!item) return;

  // Find the experience by ID
  const experience = getExperienceById(item.id);

  if (!experience) {
    // Experience not found - remove invalid cart item
    console.warn(`Experience with id ${item.id} not found, removing from cart`);
    cartStore.removeFromCart(payload.index);
    handleCloseEditModal();
    return;
  }

  // Update with experience object
  cartStore.updateCartItem(
    experience,
    payload.index,
    payload.date,
    payload.adults,
    payload.children,
    payload.seniors,
    payload.addons,
    payload.time
  );
  handleCloseEditModal();
};

const handleCloseEditModal = () => {
  showEditModal.value = false;
  editingItemIndex.value = null;
  editingExperience.value = null;
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
    day: "numeric",
    month: "short",
    year: "numeric",
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
  box-shadow: var(--shadow);
}

.empty-cart__icon {
  width: 120px;
  height: 120px;
  background: var(--background-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
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
  color: var(--text-color);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.empty-cart__text {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0 0 2rem 0;
  max-width: 480px;
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
  background: var(--gradient-bg);
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
  display: grid;
  grid-template-columns: 166px 1fr auto;
  gap: 1.5rem;
  align-items: start;
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 166px;
  height: 166px;
  justify-content: space-between;
}

.details-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.badge-owner {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid var(--text-color2);
  border-radius: 6px;
  font-size: 0.813rem;
  color: var(--text-color2);
  width: fit-content;
}

.booking-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.booking-info__item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color2);
}

.booking-info__item :deep(svg) {
  flex-shrink: 0;
  color: #6b7280;
}

.guest-badges,
.addon-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge-guest {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.badge-addon {
  background: transparent;
  border: 1px solid #10b981;
  color: #10b981;
}

.badge-placeholder {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 200px;
  height: 166px;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.price-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.813rem;
  color: var(--text-color2);
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
  color: var(--text-color);
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
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
  padding: 1.5rem;
  border-radius: 12px;
  min-width: 240px;
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
  color: var(--primary-color);
  font-family: var(--font-heading);
  
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
  background: var(--gradient-bg);
  color: white;
}

.btn--primary:hover {
  transform: translateY(-2px);
}

/* ✅ Responsive cart layout overrides */
.cart-page {
  padding: 1.25rem;
}

.cart-item {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item__container {
  display: grid;
  grid-template-columns: 166px 1fr auto;
  gap: 1.5rem;
  align-items: start;
}

.cart-item__image-container {
  width: 166px;
  height: 166px;
}

.cart-item__details {
  min-width: 0;
}

.cart-item__actions {
  min-width: 200px;
}

/* Hide price details on mobile, show only total */
@media (max-width: 767px) {
  .price-details {
    display: none;
  }

  .price-breakdown {
    align-items: flex-end;
  }

  .price-total {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
  }
}

@media (max-width: 900px) {
  .cart-item__container {
    grid-template-columns: 120px 1fr;
    gap: 1rem;
  }

  .cart-item__image-container {
    width: 120px;
    height: 120px;
  }

  .cart-item__details {
    grid-column: 2;
    min-height: 120px;
    height: 120px;
  }

  .cart-item__actions {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-width: 100%;
    height: auto;
  }

  .price-breakdown {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex: 1;
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
    padding: 1rem;
  }

  .cart-item__container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .cart-item__image-container {
    width: 100%;
    height: 180px;
  }

  .cart-item__image {
    border-radius: 10px;
  }

  .cart-item__details {
    grid-column: 1;
    height: auto;
    min-height: auto;
  }

  .cart-item__actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    height: auto;
  }

  .price-breakdown {
    order: -1;
    margin-bottom: 0.5rem;
  }

  .action-buttons {
    width: 100%;
    justify-content: center;
  }

  .btn-edit,
  .btn-remove {
    flex: 1;
    padding: 0.75rem;
    border-radius: 10px;
  }

  /* Summary goes full width on mobile */
  .cart-summary {
    max-width: 100%;
    margin-left: 0;
    padding: 1.25rem;
  }
}

@media (min-width: 1200px) {
  .cart-item__container {
    grid-template-columns: 180px 1fr auto;
    gap: 2rem;
  }

  .cart-item__image-container {
    width: 180px;
    height: 180px;
  }

  .cart-item__details {
    height: 180px;
    min-height: 180px;
  }

  .cart-item__actions {
    min-width: 240px;
    height: 180px;
  }
}
</style>
