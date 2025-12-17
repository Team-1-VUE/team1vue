<template>
  <div v-if="list.length">
    <Card
      v-for="experience in list"
      :key="experience.slug"
      :image="experience.image"
      :imgHref="`/upplevelse/${experience.slug}`"
      :altText="experience.title"
    >
      <template #header>
        <h2>{{ experience.title }}</h2>
        <span class="card__duration">{{ experience.duration }}</span>
      </template>

      <template #badges>
        <!-- Capacity and category badges || Max and Min guests are required hence no conditional -->
        <div class="capacity-section">
          <Tooltip
            :content="`För grupper mellan ${experience.minGuests} och ${experience.maxGuests} personer`"
          >
            <div class="capacity-badge">
              <Users :size="20" class="badge-icon" />
              <span class="capacity-text">
                {{ experience.minGuests
                }}{{
                  experience.maxGuests !== experience.minGuests
                    ? `-${experience.maxGuests}`
                    : ""
                }}
                pers
              </span>
            </div>
          </Tooltip>

          <Tooltip
            v-if="experience.allowedCategories?.children"
            content="Prisvärt för de små"
          >
            <div
              v-if="experience.allowedCategories?.children"
              class="category-badge category-badge--children"
            >
              <Baby :size="20" class="badge-icon" />
            </div>
          </Tooltip>

          <Tooltip
            v-if="experience.allowedCategories?.seniors"
            content="Prisvärt för seniorer"
          >
            <div
              v-if="experience.allowedCategories?.seniors"
              class="category-badge category-badge--seniors"
            >
              <HatGlasses :size="20" class="badge-icon" />
            </div>
          </Tooltip>
        </div>
      </template>

      <template #default>
        <p>{{ experience.description }}</p>

        <div v-if="experience.addons?.length" class="card__addons">
          <p class="addons-label">Tillval inkluderar:</p>
          <div class="addon-tags">
            <span
              v-for="(addon, index) in experience.addons"
              :key="index"
              class="addon-tag"
            >
              {{ capitalize(addon.title) }}
            </span>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="price-section">
          <span class="price-label">{{
            experience.addons?.length ? "PRIS FRÅN" : "PRIS"
          }}</span>
          <span class="price-value">{{ experience.price }} kr</span>
        </div>

        <div class="action-buttons">
          <NuxtLink
            :to="{
              path: `/upplevelse/${experience.slug}`,
              query: route.query,
            }"
            class="btn btn--secondary"
          >
            Läs mer
          </NuxtLink>
          <button @click="showModal = experience" class="btn btn--primary">
            Boka
          </button>
        </div>
      </template>
    </Card>

    <BookingModal
      v-if="showModal"
      :show="!!showModal"
      :experience="showModal"
      :initialDate="(route.query.date as string) ?? ''"
      :adults="Number(route.query.adults ?? 1)"
      :children="Number(route.query.children ?? 0)"
      :seniors="Number(route.query.seniors ?? 0)"
      @close="showModal = null"
    />
  </div>

  <div v-else>
    <p>Inga upplevelser hittades.</p>
  </div>
</template>

<script setup lang="ts">
import { type LocationQueryRaw, useRoute } from "vue-router";
import { useExperiences, type Experience } from "~/composables/useExperiences";
import Card from "~/components/Card.vue";
import BookingModal from "~/components/BookingModal.vue";
import { Baby, HatGlasses, Users } from "lucide-vue-next";

const props = defineProps<{
  experiences?: Experience[];
  query?: LocationQueryRaw;
}>();

const route = useRoute();
const name = route.params.name as string;

const { getProfileExperiences } = useExperiences();

const experiencesFromProfile = computed(() => getProfileExperiences(name));
const list = computed(
  () => props.experiences ?? experiencesFromProfile.value ?? []
);

const showModal = ref<null | (typeof list.value)[0]>(null);
</script>

<style scoped>
.card__duration {
  background: #f3f4f6;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.addons-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-color2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.addon-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.addon-tag {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: var(--text-color);
  font-weight: 500;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.price-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-color2);
  letter-spacing: 0.1em;
}

.price-value {
  font-size: 1.75rem;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.02em;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn--secondary {
  background-color: #ffffff;
  color: var(--text-color);
  box-shadow: inset 0 0 0 2px var(--primary-color);
}

.btn--secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.btn--primary {
  background: var(--gradient-bg);
  color: #fff;
  box-shadow: 0 4px 12px rgba(26, 26, 26, 0.15);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(26, 26, 26, 0.25);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* TODO: Duplicate CSS from #pages/upplevelse/[slug].vue */
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
</style>
