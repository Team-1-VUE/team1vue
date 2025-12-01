<template>
<h1>Kundkorg</h1>
<p>Här ser du alla upplevelser du lagt i kundkorgen.</p>

<hr />

<div v-for="item in cartItems" :key="item.id" class="cart-item">
  <h3>{{ item.title }}</h3>
  <p>Antal: {{ item.quantity }}</p>
  <p>Pris: {{ item.price * item.quantity }} kr</p>
</div>

<hr />

<p><strong>Totalpris:</strong> {{ totalSum }} kr</p>

<button
  class="btn-pay"
  @click="handlePay()"
>
  $ Gå till betalning
</button>
</template>

<script setup lang="ts">
const cartItems = ref([
  { id: '1', title: 'Skidåkning i Åre', price: 1200, quantity: 2 },
  { id: '2', title: 'Spa-weekend', price: 800, quantity: 1 }
])

const totalSum = computed(() =>
  cartItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
)

const handlePay = () => {
  alert(`Tack! Du har blivit debiterad ${totalSum.value} SEK för din bokning.`)
}
</script>

<style scoped>
  .btn-pay {
    border: none;
    cursor: pointer;
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 5px;
  }
</style>