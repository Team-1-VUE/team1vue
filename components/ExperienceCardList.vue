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

      <template #default>
        <p>{{ experience.description }}</p>

        <div v-if="experience.addons?.length" class="card__addons">
          <p class="addons-label">Tillval inkluderar:</p>
          <div class="addons__tags">
            <span
            v-for="(addon, index) in experience.addons"
            :key="index"
            class="addon-tag">
            {{ capitalize(addon.title) }}
          </span>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="price-section">
          <span class="price-label">{{ experience.addons?.length ? 'PRIS FRÅN' : 'PRIS' }}</span>
          <span class="price-value">{{ experience.price }} kr</span>
        </div>

        <div class="action-buttons">
          <NuxtLink
            :to="`/upplevelse/${experience.slug}`"
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
import { useRoute } from 'vue-router'
import { useExperiences, type Experience } from '~/composables/useExperiences'
import Card from '~/components/Card.vue'
import BookingModal from '~/components/BookingModal.vue'

const props = defineProps<{
  experiences?: Experience[]
}>()

const route = useRoute()
const name = route.params.name as string

const { getProfileExperiences } = useExperiences()

const experiencesFromProfile = computed(() => getProfileExperiences(name))
const list = computed(() => props.experiences ?? experiencesFromProfile.value ?? [])

const showModal = ref<null | typeof list.value[0]>(null)
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
  color: #6b7280;
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
  color: #374151;
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
  color: #9ca3af;
  letter-spacing: 0.1em;
}

.price-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
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
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn--secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn--primary {
  background: #1a1a1a;
  color: #fff;
  box-shadow: 0 4px 12px rgba(26, 26, 26, 0.15);
}

.btn--primary:hover:not(:disabled) {
  background: #000;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(26, 26, 26, 0.25);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
