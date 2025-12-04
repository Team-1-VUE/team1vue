<template>
  <div class="cart-page">
    <h1>Kundkorg</h1>
    
    <div v-if="cartStore.cartItemCount === 0" class="empty-cart">
      <p>Din kundkorg är tom</p>
      <NuxtLink to="/" class="btn btn--primary">Utforska upplevelser</NuxtLink>
    </div>

    <div v-else>
      <div class="cart-items">
        <div v-for="(item, index) in cartStore.items" :key="`${item.id}-${index}`" class="cart-item">
          <img :src="item.image" :alt="item.title" class="cart-item__image" />
          
          <div class="cart-item__details">
            <h3>{{ item.title }}</h3>
            <p class="owner">med {{ capitalize(item.owner) }}</p>
            <p class="duration">{{ item.duration }}</p>
            
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
              <button @click="cartStore.updateQuantity(index, item.quantity - 1)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="cartStore.updateQuantity(index, item.quantity + 1)">+</button>
            </div>
            
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
import { useCartStore } from '~/stores/useCartStore'

const cartStore = useCartStore()

const itemTotal = (item: any) => {
  const addonsPrice = item.selectedAddons.reduce((sum: number, addon: any) => sum + addon.price, 0)
  return (item.price + addonsPrice) * item.quantity
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
  text-align: center;
  padding: 4rem 2rem;
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

.owner, .duration {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
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