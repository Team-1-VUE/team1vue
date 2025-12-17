<template>
  <div class="experience-page">
    <!-- Loading state -->
    <div v-if="loading" class="experience-page__loading">
      <p>Laddar upplevelse...</p>
    </div>

    <!-- Experience found -->
    <template v-else-if="experience">
      <!-- Back link container -->
      <div class="back-link-container">
        <a @click="$router.back()" class="back-link">
          <ArrowLeft :size="16" class="back-link__icon" />
          Tillbaka
        </a>
      </div>

      <!-- Main content layout -->
      <main class="experience-container">
        <!-- Left column: Image -->
        <section class="experience-image-section">
          <div class="image-wrapper">
            <img
              class="experience-image"
              :src="experience.image"
              :alt="experience.title" />

            <!-- Capacity and category badges || Max and Min guests are required hence no conditional -->
            <div class="capacity-section">
              <Tooltip v-if="experience.allowedCategories?.children" content="Prisvärt för de små">
                <div v-if="experience.allowedCategories?.children" class="category-badge category-badge--children">
                  <Baby :size="20" class="badge-icon" />
                </div>
              </Tooltip>

              <Tooltip v-if="experience.allowedCategories?.seniors" content="Prisvärt för seniorer">
                <div v-if="experience.allowedCategories?.seniors" class="category-badge category-badge--seniors">
                  <HatGlasses :size="20" class="badge-icon" />
                </div>
              </Tooltip>

              <Tooltip :content="`För grupper mellan ${experience.minGuests} och ${experience.maxGuests} personer`">
                <div class="capacity-badge">
                  <Users :size="20" class="badge-icon" />
                  <span class="capacity-text">
                    {{ experience.minGuests }}{{ experience.maxGuests !== experience.minGuests ? `-${experience.maxGuests}` : '' }} pers
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>

          <!-- Description section || Desktop -->
          <div class="description-section desktop-only">
            <p class="description-text">{{ experience.about }}</p>
          </div>
        </section>

        <!-- Right column: Details -->
        <section class="experience-details-section">
          <!-- Title || Mobile -->
          <div class="experience-header">
            <h1 class="experience-title">{{ experience.title }}</h1>
          </div>

          <!-- Description section || Mobile -->
          <div class="description-section mobile-only">
            <p class="description-text">{{ experience.about }}</p>
          </div>

          <!-- Features list -->
          <ul class="features-list">
            <li v-if="experience.description" class="feature-item">
              {{ experience.description }}
            </li>
            <li v-if="experience.duration" class="feature-item">
              Varaktighet: {{ experience.duration }}
            </li>
            <li v-if="experience.addons?.length" class="feature-item">
              Tillval tillgängliga
            </li>
          </ul>

          <!-- Price section -->
          <div class="price-section">
            <p class="price-label">{{ experience.addons?.length ? "Från" : "Pris" }}</p>
            <div class="price-display">
              <span class="price-current">{{ experience.price }} kr</span>
            </div>
            <div
              v-if="experience.categoryPrices"
              class="price-per-category">
              <span class="price-pill price-pill--adult">
                Vuxen: {{ experience.categoryPrices.adults }} kr
              </span>
              <span
                v-if="experience.allowedCategories.children"
                class="price-pill price-pill--children">
                Barn: {{ experience.categoryPrices.children }} kr
              </span>
              <span
                v-if="experience.allowedCategories.seniors"
                class="price-pill price-pill--seniors">
                Senior: {{ experience.categoryPrices.seniors }} kr
              </span>
            </div>
          </div>

          <!-- Location -->
          <div class="location-section">
            <MapPin :size="18" class="location-icon" />
            <span class="location-text">Stockholm</span>
          </div>

          <!-- Addons section -->
          <div v-if="experience.addons?.length" class="addons-section">
            <h3 class="addons-title">Tillval</h3>
            <ul class="addons-list">
              <li v-for="(addon, index) in experience.addons" :key="index" class="addon-item">
                <span class="addon-title">{{ capitalize(addon.title) }}</span>
                <span class="addon-price">+{{ addon.price }} kr/gäst</span>
              </li>
            </ul>
          </div>

          <!-- Booking button -->
          <button @click="showModal = true" class="booking-button">
            <span>Köp upplevelsen</span>
            <ShoppingBag :size="20" class="button-icon" />
          </button>

          <p class="booking-note">
            Du slutför bokningen i nästa steg.
          </p>
        </section>
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
import { ArrowLeft, Users, MapPin, ShoppingBag, Baby, HatGlasses } from "lucide-vue-next";

const route = useRoute();
const slug = route.params.slug as string;

const { loading, getExperienceBySlug } = useExperiences();

const experience = computed(() => getExperienceBySlug(slug));

const ownerProfile = computed(() =>
  experience.value ? capitalize(experience.value.owner) : ""
);

const showModal = ref(false);
</script>

<style scoped>
/* Loading / not found */
.experience-page__loading,
.experience-page__not-found {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 1.5rem;
  text-align: center;
  color: #4b5563;
}

/* Back link container */
.back-link-container {
  margin: 0 auto;
  padding: 1.5rem 1.5rem 1rem;
}

/* Back link */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #374151;
}

.back-link__icon {
  flex-shrink: 0;
}

/* Breadcrumb navigation */
.breadcrumb {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb__back {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb__back:hover {
  color: var(--primary-color, #ef4444);
}

.breadcrumb__icon {
  flex-shrink: 0;
}

.breadcrumb__separator {
  color: #9ca3af;
}

.breadcrumb__link {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb__link:hover {
  color: var(--primary-color, #ef4444);
}

/* Main container - two column layout */
.experience-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Image section (left column on desktop) */
.experience-image-section {
  width: 100%;
}

.image-wrapper {
  position: relative;
  width: 100%;
  background-color: #f3f4f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.experience-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 4 / 3;
  border-radius: 20px;
}

.image-badges {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.badge--discount {
  background-color: #dc2626;
}

.badge--new {
  background-color: #000000;
}

/* Details section (right column on desktop) */
.experience-details-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.experience-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.experience-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  color: #111827;
}

/* Features list */
.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feature-item {
  position: relative;
  padding-left: 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #6b7280;
}

.feature-item::before {
  content: "•";
  position: absolute;
  left: 0;
  font-weight: 700;
  color: #111827;
}

/* Capacity section */
.capacity-section {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.capacity-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 8px;
  flex-shrink: 0;
}

.capacity-text {
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.category-badge {
  height: 38px;
  width: 38px;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: stretch;
}

.category-badge--children {
  background-color: #fee844;
  color: #814d00;
}

.category-badge--seniors {
  background-color: #b7eaff;
  color: #024d6b;
}

.badge-icon {
  color: currentColor;
  flex-shrink: 0;
}

/* Price section */
.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.price-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  font-weight: 700;
  margin: 0;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.price-current {
  font-size: 2rem;
  font-weight: 800;
  color: #dc2626;
  line-height: 1;
}

.price-original {
  font-size: 1.25rem;
  font-weight: 600;
  color: #9ca3af;
  text-decoration: line-through;
}

.price-per-category {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
}

.price-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.price-pill--adult {
  background-color: rgba(0, 0, 0, 0.08);
  color: #374151;
}

.price-pill--children {
  background-color: #fee844;
  color: #814d00;
}

.price-pill--seniors {
  background-color: #b7eaff;
  color: #024d6b;
}

/* Location section */
.location-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #4b5563;
}

.location-icon {
  flex-shrink: 0;
  color: currentColor;
}

.location-text {
  font-weight: 500;
}

/* Booking button */
.booking-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.booking-button:hover {
  background-color: #1a1a1a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.booking-button:active {
  transform: translateY(0);
}

.button-icon {
  flex-shrink: 0;
  color: currentColor;
}

.booking-note {
  margin: 0;
  font-size: 0.8125rem;
  color: #6b7280;
  text-align: center;
}

/* Description section */
.description-section {
  margin-top: 0;
}

.description-text {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

.addons-section {
  margin-top: 0;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.addons-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.addons-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.addon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.addon-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #111827;
}

.addon-price {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.desktop-only {
  display: none;
}

/* Standard: visa mobile-element på små skärmar */
.mobile-only {
  display: block;
}

/* Desktop: Two column layout */
@media (min-width: 960px) {
  .back-link-container {
    max-width: 1200px;
    padding: 2rem 2rem 0;
  }

  .experience-container {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    padding-top: 2rem;
  }

  .experience-image-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .experience-title {
    font-size: 2.5rem;
  }

  .price-current {
    font-size: 2.5rem;
  }

  .desktop-only {
    display: block;
  }

  .mobile-only {
    display: none;
  }
}
</style>
