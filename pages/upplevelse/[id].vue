<template>
  <div class="experience-page">
    <!-- Loading state -->
    <div v-if="loading" class="experience-page__loading">
      <p>Laddar upplevelse...</p>
    </div>

    <!-- Experience found -->
    <template v-else-if="experience">
      <!-- Hero -->
      <section class="experience-hero">
        <img
          class="experience-hero__image"
          :src="experience.image"
          :alt="experience.title" />

        <div class="experience-hero__overlay"></div>

        <div class="experience-hero__content">
          <p class="experience-hero__label">Upplevelse</p>
          <h1 class="experience-hero__title">{{ experience.title }}</h1>
          <p class="experience-hero__subtitle">
            {{ experience.duration }} • {{ experience.price }} kr
          </p>
        </div>
      </section>

      <!-- Main content -->
      <main class="experience-layout">
        <!-- Left column -->
        <section class="experience-main">
          <p v-if="experience.owner" class="experience-main__owner">
            Med
            <NuxtLink :to="`/profil/${experience.owner}`">
              {{ ownerProfile }} →
            </NuxtLink>
          </p>

          <p class="experience-main__description">
            {{ experience.description }}
          </p>

          <div v-if="experience.addons?.length" class="experience-main__addons">
            <h3>Tillval</h3>
            <ul>
              <li v-for="slug in experience.addons" :key="slug">
                <span class="addon-title">
                  {{ capitalize(getAddon(slug)?.title || slug) }}
                </span>
                <span class="addon-price">
                  +{{ getAddon(slug)?.price }} kr/gäst
                </span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Right column (booking card) -->
        <aside class="experience-sidebar">
          <div class="booking-card">
            <p class="booking-card__label">Från</p>
            <p class="booking-card__price">{{ experience.price }} kr</p>

            <p
              v-if="
                experience.addons?.length && totalAddonsPrice(experience) > 0
              "
              class="booking-card__total">
              {{ experience.price + totalAddonsPrice(experience) }} kr med
              tillval
            </p>

            <button @click="showModal = true" class="booking-card__button">
              Boka upplevelse
            </button>

            <p class="booking-card__small">
              Du slutför bokningen i nästa steg.
            </p>
          </div>
        </aside>
      </main>

      <!-- Booking modal -->
      <BookingModal
        :show="showModal"
        :experience="experience"
        :initialDate="(route.query.date as string) ?? ''"
        :adults="Number(route.query.adults ?? 1)"
        :children="Number(route.query.children ?? 0)"
        :seniors="Number(route.query.seniors ?? 0)"
        @close="showModal = false" />
    </template>

    <!-- Not found -->
    <div v-else class="experience-page__not-found">
      <p>Upplevelse hittades inte.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useExperiences } from "~/composables/useExperiences";
import { capitalize } from "~/utils/string";
import BookingModal from "~/components/BookingModal.vue";

const route = useRoute();
const id = route.params.id as string;

const { loading, getExperienceById, getAddon, totalAddonsPrice } =
  useExperiences();

const experience = computed(() => getExperienceById(id));

const ownerProfile = computed(() =>
  experience.value ? capitalize(experience.value.owner) : ""
);

const showModal = ref(false);
</script>

<style scoped>
/* Page shell */
.experience-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

/* Loading / not found */
.experience-page__loading,
.experience-page__not-found {
  max-width: 960px;
  margin: 4rem auto;
  padding: 0 1.5rem;
  text-align: center;
  color: #4b5563;
}

/* Hero */
.experience-hero {
  position: relative;
  width: 100%;
}

.experience-hero__image {
  width: 100%;
  max-width: 440px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.experience-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.2),
    rgba(15, 23, 42, 0.65)
  );
  pointer-events: none;
}

.experience-hero__content {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  padding: 0 1rem;
  color: #ffffff;
  text-align: center;
  pointer-events: none;
}

.experience-hero__label {
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.experience-hero__title {
  margin: 0;
  padding: 0;
  font-size: 1.75rem;
  font-weight: 800;
  /* margin-bottom: 0.3rem; */
}

.experience-hero__subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
}

/* Layout below hero */
.experience-layout {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Left column */
.experience-main__owner {
  margin-bottom: 1rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.experience-main__owner a {
  color: #ef4444;
  font-weight: 600;
  text-decoration: none;
}

.experience-main__owner a:hover {
  text-decoration: underline;
}

.experience-main__description {
  font-size: 1rem;
  line-height: 1.7;
  color: #111827;
  margin-bottom: 1.5rem;
}

.experience-main__addons {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.experience-main__addons h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.experience-main__addons ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.experience-main__addons li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 0.6rem 0.9rem;
}

.addon-title {
  font-size: 0.95rem;
  color: #111827;
}

.addon-price {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Right column / booking card */
.experience-sidebar {
  width: 100%;
}

.booking-card {
  background-color: #ffffff;
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
}

.booking-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.booking-card__price {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.booking-card__total {
  font-size: 0.95rem;
  color: #4b5563;
  margin-bottom: 1rem;
}

.booking-card__button {
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: 0.9rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background-image: linear-gradient(to right, #ef4444, #b91c1c);
  color: #ffffff;
  box-shadow: 0 12px 25px rgba(185, 28, 28, 0.35);
  transition: all 0.2s ease;
}

.booking-card__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 35px rgba(185, 28, 28, 0.45);
}

.booking-card__small {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Optional: tweak for larger screens */
@media (min-width: 768px) {
  .experience-hero__title {
    font-size: 2.2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .experience-hero__title {
    font-size: 2.6rem;
  }
}
</style>
