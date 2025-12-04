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

    <!-- Booking Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="showModal = false">×</button>
          
          <h2>Välj datum</h2>
          <p class="modal-subtitle">{{ experience.title }}</p>
          
          <div class="calendar-container">
            <div class="date-picker-wrapper" @click="dateInput?.showPicker()">
              <div class="date-label">
                <svg class="calendar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Välj datum för bokning
              </div>
              <div class="date-display">
                <span v-if="!selectedDate" class="placeholder">Klicka för att välja datum</span>
                <span v-else class="selected-date">{{ formatDate(selectedDate) }}</span>
              </div>
              <input 
                ref="dateInput"
                type="date" 
                v-model="selectedDate"
                :min="minDate"
                class="date-picker-hidden" />
            </div>
          </div>

          <div class="modal-actions">
            <button @click="showModal = false" class="btn btn--secondary">
              Avbryt
            </button>
            <button 
              @click="confirmBooking" 
              :disabled="!selectedDate"
              class="btn btn--primary">
              Bekräfta bokning
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
const selectedDate = ref('')
const dateInput = ref<HTMLInputElement | null>(null)

// Set minimum date to today
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })
}

const confirmBooking = () => {
  if (!selectedDate.value) return

  const selectedAddons = props.experience.addons.map(slug => {
    const addon = getAddon(slug)
    return addon ? { slug: addon.slug, title: addon.title, price: addon.price } : null
  }).filter(Boolean) as Array<{ slug: string; title: string; price: number }>

  cartStore.addToCart(props.experience, selectedAddons, selectedDate.value)
  
  showModal.value = false
  selectedDate.value = ''
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #9ca3af;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.modal-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-subtitle {
  color: #6b7280;
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.calendar-container {
  margin-bottom: 2rem;
.date-picker-wrapper {
  display: block;
  width: 100%;
  cursor: pointer;
  position: relative;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.date-picker-wrapper:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.date-picker-wrapper:active {
  transform: scale(0.99);
}

.date-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.calendar-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  flex-shrink: 0;
} color: #374151;
  margin-bottom: 0.5rem;
}

.date-display {
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  color: #9ca3af;
  font-size: 0.9375rem;
}

.selected-date {
  color: #1a1a1a;
  font-weight: 600;
  font-size: 0.9375rem;
}

.date-picker-hidden {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions .btn {
  flex: 1;
}
</style>
