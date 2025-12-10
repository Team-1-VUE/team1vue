<template>
  <div class="cart-page">
    <h1>Kundkorg</h1>
    
    <div v-if="cartStore.cartItemCount === 0" class="empty-cart">
      <div class="empty-cart__icon">
        <ShoppingCart :size="64" :stroke-width="1.5" />
      </div>
      <h2 class="empty-cart__title">Din kundkorg är tom</h2>
      <p class="empty-cart__text">Utforska våra upplevelser och hitta något spännande att boka!</p>
      <NuxtLink to="/" class="btn btn--primary">
        <Compass :size="18" />
        Utforska upplevelser
      </NuxtLink>
    </div>

    <div v-else>
      <div class="cart-items">
        <div v-for="(item, index) in cartStore.items" :key="`${item.id}-${index}`" class="cart-item">
          <!-- container for all -->
          <div class="cart-item__container">
            <!-- container for img -->
            <div class="cart-item__image-container">
              <img :src="item.image" :alt="item.title" class="cart-item__image" />
            </div>
            <!-- /container for img -->
            
            <!-- container for event details -->
            <div class="cart-item__details">
              <h3>{{ item.title }}</h3>
              <p class="owner">med {{ capitalize(item.owner) }}</p>
              <p class="duration">{{ item.duration }}</p>
              
              <!-- addons included here -->
              <div class="addons">
                <span class="addons-label">Tillval:</span>
                <span v-if="item.selectedAddons.length" class="addons-list">
                  <span v-for="addon in item.selectedAddons" :key="addon.slug" class="addon-item">
                    {{ addon.title }} (+{{ addon.price }} kr)
                  </span>
                </span>
                <span v-else class="no-addons">Inga tillval</span>
              </div>
              
              <p v-if="item.bookingDate" class="booking-date">
                <Calendar :size="16" />
                {{ formatDate(item.bookingDate) }}
              </p>
            </div>
            <!-- /container for event details -->
            
            <!-- container for guest details -->
            <div v-if="item.guestCounts" class="guest-details">
              <p class="guest-counts-label">Antal gäster:</p>
              <ul class="guest-list">
                <li>
                  Vuxna: {{ item.guestCounts.adults || 0 }}
                </li>
                <li>
                  Barn: {{ item.guestCounts.children || 0 }}
                </li>
                <li>
                  Pensionärer: {{ item.guestCounts.seniors || 0 }}
                </li>
              </ul>
              <p class="total-guests">Totalt: {{ getTotalGuests(item) }} gäster</p>
            </div>
            <!-- /container for guest details -->
          </div>
          <!-- /container for all -->

          <div class="cart-item__actions">
            <p class="item-price">
              {{ itemTotal(item) }} kr
            </p>
            
            <button @click="cartStore.removeFromCart(index)" class="btn-remove">
              Ta bort
            </button>
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
  </div>
</template>

<script setup lang="ts">
import { Calendar, ShoppingCart, Compass } from 'lucide-vue-next'
import { useCartStore } from '~/stores/useCartStore'

const cartStore = useCartStore()

const itemTotal = (item: any) => {
  const addonsPrice = item.selectedAddons.reduce((sum: number, addon: any) => sum + addon.price, 0)
  return (item.price + addonsPrice) * item.quantity
}

const getTotalGuests = (item: any) => {
  if (!item.guestCounts) return 0
  return item.guestCounts.adults + item.guestCounts.children + item.guestCounts.seniors
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handleCheckout = () => {
  alert(`Tack! Du har blivit debiterad ${cartStore.totalPrice} SEK för din bokning.`)
  cartStore.clearCart()
}
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
  0%, 100% {
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
}

.cart-item__image-container {
  flex-shrink: 0;
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

.owner, .duration, .booking-date {
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