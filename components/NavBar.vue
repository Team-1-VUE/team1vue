<template>
  <nav class="navbar">
    <div class="navbar-container">
      <NuxtLink to="/" class="navbar-logo">Team uno</NuxtLink>
      <ul class="navbar-menu">
        <li v-for="link in navLinks" :key="link.path">
          <NuxtLink :to="link.path" exact-active-class="active">
            <template v-if="link.name !== 'Kundkorg'">{{ link.name }}</template>
            <ShoppingCart v-else :size="24" :stroke-width="1.5" />
            <span
              v-if="link.path === '/kundkorg' && cartStore.cartItemCount > 0"
              class="cart-badge"
            >
              {{ cartStore.cartItemCount }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "~/stores/useCartStore";
import { ShoppingCart } from "lucide-vue-next";

type Profile = { slug: string; name: string };

const route = useRoute();
const profiles = ref<Profile[]>([]);
const cartStore = useCartStore();

const navLinks = computed(() => [
  { name: "Home", path: "/" },
  ...profiles.value.map((p) => ({ name: p.name, path: `/profil/${p.slug}` })),
  { name: "Kundkorg", path: "/kundkorg" },
]);

onMounted(async () => {
  const res = await fetch("/data.json");
  const json = await res.json();

  profiles.value = Object.keys(json.profiles).map((slug) => ({
    slug,
    name: capitalize(slug),
  }));
});
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  background-color: var(--background-color);
  box-shadow: var(--shadow);
  padding: var(--spacing-sm);
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;

  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-menu {
  display: flex;
  gap: var(--spacing-lg);
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-menu li a {
  position: relative;
  display: inline-block;
  padding: 5px;
  border-radius: 5px;
  text-decoration: none;
  color: var(--text-color);
  font-style: normal;
  font-weight: 600;
  transition: all 0.3s ease;
}
.navbar-menu li a:hover,
.navbar-menu li a.active {
  background-color: var(--hover-color);
  cursor: pointer;
  color: white;
  background-color: var(--secondary-color);
  scale: 1.05;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -10px;
  display: inline-block;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  text-align: center;
  line-height: 20px;
  font-weight: 700;
  transition: all 0.3s ease;
}
</style>
