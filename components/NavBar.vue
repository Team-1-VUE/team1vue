<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar-logo" @click="closeMenu">
        Team uno
      </NuxtLink>

      <!-- ================= DESKTOP NAV ================= -->
      <div class="nav-desktop">
        <ul class="navbar-menu">
          <li v-for="link in navLinks" :key="link.path">
            <NuxtLink :to="link.path" exact-active-class="active">
              {{ link.name }}
              <span
                v-if="link.path === '/kundkorg' && cartStore.cartItemCount > 0"
                class="cart-badge">
                {{ cartStore.cartItemCount }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- ================= MOBILE BURGER ================= -->
      <div class="nav-mobile">
        <button
          class="menu-wow"
          type="button"
          @click="toggleMenu"
          :aria-expanded="isOpen"
          aria-controls="mobile-menu"
          aria-label="Öppna meny">
          <span class="menu-wow__ring" :class="{ on: isOpen }"></span>
          <span class="menu-wow__icon" :class="{ on: isOpen }">
            <i></i><i></i><i></i>
          </span>
        </button>
      </div>
    </div>

    <!-- ================= MOBILE OVERLAY + DRAWER ================= -->
    <div class="nav-mobile">
      <div v-if="isOpen" class="overlay" @click="closeMenu" />

      <aside
        id="mobile-menu"
        class="drawer"
        :class="{ open: isOpen }"
        @click.stop>
        <div class="drawer-header">
          <span class="drawer-title">Meny</span>
          <button
            class="drawer-close"
            type="button"
            @click="closeMenu"
            aria-label="Stäng meny">
            ×
          </button>
        </div>

        <ul class="drawer-list">
          <li v-for="link in navLinks" :key="link.path">
            <NuxtLink
              :to="link.path"
              exact-active-class="active"
              @click="closeMenu">
              <span class="link-text">{{ link.name }}</span>

              <span
                v-if="link.path === '/kundkorg' && cartStore.cartItemCount > 0"
                class="cart-badge">
                {{ cartStore.cartItemCount }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </aside>
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
const cartStore = useCartStore();

const profiles = ref<Profile[]>([]);
const isOpen = ref(false);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const navLinks = computed(() => [
  { name: "Home", path: "/" },
  ...profiles.value.map((p) => ({ name: p.name, path: `/profil/${p.slug}` })),
  { name: "Kundkorg", path: "/kundkorg" },
]);

const closeMenu = () => (isOpen.value = false);
const toggleMenu = () => (isOpen.value = !isOpen.value);

// Stäng menyn när man navigerar
watch(
  () => route.fullPath,
  () => closeMenu()
);

// Lås scroll när drawer är öppen (bra UX på mobil)
watch(isOpen, (open) => {
  document.documentElement.style.overflow = open ? "hidden" : "";
});

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
/* =========================
   NAVBAR BASE
========================= */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--background-color);
  box-shadow: var(--shadow);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* Logo */
.navbar-logo {
  flex: 0 0 auto;
  font-size: 1.4rem;
  font-weight: 800;
  text-decoration: none;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* =========================
   RESPONSIVE SWITCH
========================= */
/* Mobile-first: show mobile controls, hide desktop menu */
.nav-desktop {
  display: none;
}

.nav-mobile {
  margin-left: auto;
  display: flex;
  align-items: center;
}

/* Desktop breakpoint: show desktop menu, hide mobile controls */
@media (min-width: 860px) {
  .nav-desktop {
    display: block;
    margin-left: auto; /* push menu to the right */
  }
  .nav-mobile {
    display: none;
  }
}

/* =========================
   DESKTOP MENU
========================= */
.navbar-menu {
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;

  /* prevents menu taking over the whole header */
  max-width: 760px;
  flex-wrap: wrap;
}

.navbar-menu li a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  padding: 8px 10px;
  border-radius: 10px;
  text-decoration: none;

  color: var(--text-color);
  font-weight: 700;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.navbar-menu li a:hover,
.navbar-menu li a.active {
  background-color: var(--secondary-color);
  color: #fff;
}

.navbar-menu li a:active {
  transform: scale(0.98);
}

/* Badge */
.cart-badge {
  display: inline-grid;
  place-items: center;
  background: #ef4444;
  color: white;
  border-radius: 999px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 0.75rem;
  font-weight: 800;
}

/* =========================
   MOBILE WOW MENU BUTTON
}
</style>
