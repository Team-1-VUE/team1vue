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
                class="cart-badge"
              >
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
          aria-label="Öppna meny"
        >
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
        @click.stop
      >
        <div class="drawer-header">
          <span class="drawer-title">Meny</span>
          <button
            class="drawer-close"
            type="button"
            @click="closeMenu"
            aria-label="Stäng meny"
          >
            ×
          </button>
        </div>

        <ul class="drawer-list">
          <li v-for="link in navLinks" :key="link.path">
            <NuxtLink
              :to="link.path"
              exact-active-class="active"
              @click="closeMenu"
            >
              <span class="link-text">{{ link.name }}</span>

              <span
                v-if="link.path === '/kundkorg' && cartStore.cartItemCount > 0"
                class="cart-badge"
              >
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
========================= */
.menu-wow {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  display: grid;
  place-items: center;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}

.menu-wow::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: transform 0.18s ease, filter 0.2s ease;
}

.menu-wow:active::before {
  transform: scale(0.98);
}

.menu-wow__ring {
  position: absolute;
  inset: -6px;
  border-radius: 20px;
  opacity: 0;
  filter: blur(10px);
  transition: opacity 0.25s ease;
  background: var(--gradient-text);
}

.menu-wow__ring.on {
  opacity: 0.9;
  animation: wowPulse 1.2s ease-in-out infinite;
}

@keyframes wowPulse {
  0%,
  100% {
    transform: scale(0.98);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}

.menu-wow__icon {
  width: 22px;
  height: 16px;
  position: relative;
  z-index: 1;
}

.menu-wow__icon i {
  position: absolute;
  left: 0;
  width: 22px;
  height: 2px;
  border-radius: 999px;
  background: var(--text-color);
  transition: transform 0.22s ease, top 0.22s ease, opacity 0.18s ease;
}

.menu-wow__icon i:nth-child(1) {
  top: 0;
}
.menu-wow__icon i:nth-child(2) {
  top: 7px;
}
.menu-wow__icon i:nth-child(3) {
  top: 14px;
}

.menu-wow__icon.on i:nth-child(1) {
  top: 7px;
  transform: rotate(45deg);
}
.menu-wow__icon.on i:nth-child(2) {
  opacity: 0;
}
.menu-wow__icon.on i:nth-child(3) {
  top: 7px;
  transform: rotate(-45deg);
}

/* =========================
   MOBILE OVERLAY + DRAWER
========================= */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(85vw, 360px);
  background: var(--background-color);

  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  transform: translateX(105%);
  transition: transform 0.22s ease;
  z-index: 1000;

  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  font-weight: 900;
  font-size: 1.05rem;
  color: var(--text-color);
}

.drawer-close {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 44px;
  color: var(--text-color);
}

.drawer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.drawer-list a {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 12px;
  border-radius: 14px;

  text-decoration: none;
  color: var(--text-color);
  font-weight: 800;

  background: rgba(0, 0, 0, 0.04);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.drawer-list a:hover,
.drawer-list a.active {
  background: var(--secondary-color);
  color: #fff;
}

.drawer-list a:active {
  transform: scale(0.99);
}

.link-text {
  display: inline-flex;
  gap: 0.5rem;
}
</style>
