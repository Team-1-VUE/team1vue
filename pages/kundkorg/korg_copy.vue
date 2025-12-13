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
          <img :src="item.image" :alt="item.title" class="cart-item__image" />

          <div class="cart-item__details">
            <h3>{{ item.title }}</h3>
            <p class="owner">med {{ capitalize(item.owner) }}</p>
            <p class="duration">{{ item.duration }}</p>

            <p v-if="item.bookingDate" class="booking-date">
              <Calendar :size="16" />
              {{ formatDate(item.bookingDate) }}
              <span v-if="item.bookingTime"> kl {{ item.bookingTime }}</span>
              <span v-if="item.bookingTime"> • {{ item.bookingTime }} </span>
            </p>

            <!-- gäster -->
            <p v-if="item.guestCounts" class="owner">
              {{ item.guestCounts.adults }} vuxna
              <span v-if="item.guestCounts.children">
                , {{ item.guestCounts.children }} barn
              </span>
              <span v-if="item.guestCounts.seniors">
                , {{ item.guestCounts.seniors }} seniorer
              </span>
            </p>

            <div v-if="item.selectedAddons.length" class="addons">
              <p class="addons-label">Tillval:</p>
              <ul>
                <li v-for="addon in item.selectedAddons" :key="addon.slug">
                  {{ addon.title }} (+{{ addon.price }} kr)
                </li>
              </ul>
            </div>
          </div>

          <div class="cart-item__actions">
            <div class="quantity-control">
              <button
                @click="cartStore.updateQuantity(index, item.quantity - 1)">
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button
                @click="cartStore.updateQuantity(index, item.quantity + 1)">
                +
              </button>
            </div>

            <p class="item-price">{{ itemTotal(item) }} kr</p>

            <button @click="cartStore.removeFromCart(index)" class="btn-remove">
              Ta bort
            </button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Antal artiklar:</span>
          <span>{{ cartStore.totalItems }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { Calendar, ShoppingCart, Compass } from "lucide-vue-next";
import { useCartStore } from "~/stores/useCartStore";

const cartStore = useCartStore();

const itemTotal = (item: any) => {
  const guestCounts = item.guestCounts || {
    adults: item.quantity,
    children: 0,
    seniors: 0,
  };

  const cp = item.categoryPrices;
  const adultPrice = cp?.adults ?? item.price;
  const childPrice = cp?.children ?? item.price;
  const seniorPrice = cp?.seniors ?? item.price;

  const adultsTotal = guestCounts.adults * adultPrice;
  const childrenTotal = guestCounts.children * childPrice;
  const seniorsTotal = guestCounts.seniors * seniorPrice;

  const guestsTotal = adultsTotal + childrenTotal + seniorsTotal;

  const addonsPerGuest = item.selectedAddons.reduce(
    (sum: number, addon: any) => sum + addon.price,
    0
  );
  const totalGuests =
    guestCounts.adults + guestCounts.children + guestCounts.seniors;
  const addonsTotal = addonsPerGuest * totalGuests;

  return guestsTotal + addonsTotal;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

.cart-item__image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.cart-item__details {
  flex: 1;
}

.cart-item__details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.owner,
.duration,
.booking-date {
  margin: 0.25rem 0;
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
  margin-top: 1rem;
}

.addons-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.addons ul {
  margin: 0;
  padding-left: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 8px;
}

.quantity-control button {
  width: 32px;
  height: 32px;
  border: none;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.quantity-control button:hover {
  background: #e5e7eb;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.btn-remove {
  padding: 0.5rem 1rem;
  border: 1px solid #ef4444;
  background: transparent;
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
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
</style>
