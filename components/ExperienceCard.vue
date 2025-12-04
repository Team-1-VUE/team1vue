<template>
  <div class="experience-card">
    <div class="experience-card__image">
      <img :src="experience.image" :alt="experience.title" />
    </div>

    <div class="experience-card__content">
      <div class="experience-card__header">
        <h3 class="experience-card__title">{{ experience.title }}</h3>
        <span class="experience-card__duration">{{ experience.duration }}</span>
      </div>

      <p class="experience-card__description">{{ experience.description }}</p>

      <div v-if="experience.addons?.length" class="experience-card__addons">
        <p class="addons-label">Tillval inkluderar:</p>
        <div class="addon-tags">
          <span v-for="addonSlug in experience.addons" :key="addonSlug" class="addon-tag">
            {{ getAddon(addonSlug)?.title }}
          </span>
        </div>
      </div>

      <div class="experience-card__footer">
        <div class="price-section">
          <span class="price-label">PRIS</span>
          <span class="price-value">{{ experience.price }} kr</span>
          <span v-if="experience.addons?.length && totalAddonsPrice(experience) > 0" class="price-total">
            {{ experience.price + totalAddonsPrice(experience) }} kr med tillval
          </span>
        </div>

        <div class="action-buttons">
          <NuxtLink
            :to="`/upplevelse/${experience.id}`"
            class="btn btn--secondary">
            Läs mer
          </NuxtLink>
          <button
            @click="showModal = true"
            class="btn btn--primary">
            Boka
          </button>
        </div>
      </div>
    </div>

    <BookingModal 
      :show="showModal"
      :experience-title="experience.title"
      @close="showModal = false"
      @confirm="handleBookingConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useExperiences } from '~/composables/useExperiences'
import { useCartStore } from '~/stores/useCartStore'

interface Props {
  experience: {
    id: string
    slug: string
    owner: string
    title: string
    description: string
    duration: string
    price: number
    image: string
    addons: string[]
  }
  profileName?: string
}

const props = defineProps<Props>()
const { getAddon, totalAddonsPrice } = useExperiences()
const cartStore = useCartStore()

const showModal = ref(false)

const handleBookingConfirm = (selectedDate: string) => {
  const selectedAddons = props.experience.addons.map(slug => {
    const addon = getAddon(slug)
    return addon ? { slug: addon.slug, title: addon.title, price: addon.price } : null
  }).filter(Boolean) as Array<{ slug: string; title: string; price: number }>

  cartStore.addToCart(props.experience, selectedAddons, selectedDate)
  showModal.value = false
}
</script>

<style scoped>
.experience-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.experience-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
}

.experience-card__image {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.experience-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.experience-card:hover .experience-card__image img {
  transform: scale(1.05);
}

.experience-card__content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.experience-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.experience-card__title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.experience-card__duration {
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

.experience-card__description {
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.experience-card__addons {
  margin-top: 0.5rem;
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

.experience-card__footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
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

.action-buttons {
  display: flex;
  gap: 0.75rem;
}
</style>
