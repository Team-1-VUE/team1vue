<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="$emit('close')">×</button>
        
        <h2>Välj datum och gäster</h2>
        <p class="modal-subtitle">{{ experience?.title }}</p>
        
        <!-- Guest Editor -->
        <div class="guest-editor">
          <h3 class="guest-editor__title">Antal gäster</h3>
          
          <div class="guest-row">
            <div class="guest-row__info">
              <span class="guest-row__label">Vuxna</span>
              <span class="guest-row__desc">13+ år</span>
            </div>
            <div class="guest-row__controls">
              <button 
                @click="updateGuests('adults', -1)" 
                :disabled="localAdults <= 0"
                type="button"
                class="guest-btn">
                −
              </button>
              <span class="guest-count">{{ localAdults }}</span>
              <button 
                @click="updateGuests('adults', 1)"
                type="button" 
                class="guest-btn">
                +
              </button>
            </div>
          </div>

          <div class="guest-row">
            <div class="guest-row__info">
              <span class="guest-row__label">Barn</span>
              <span class="guest-row__desc">0-12 år</span>
            </div>
            <div class="guest-row__controls">
              <button 
                @click="updateGuests('children', -1)" 
                :disabled="localChildren <= 0"
                type="button"
                class="guest-btn">
                −
              </button>
              <span class="guest-count">{{ localChildren }}</span>
              <button 
                @click="updateGuests('children', 1)"
                type="button"
                class="guest-btn">
                +
              </button>
            </div>
          </div>

          <div class="guest-row">
            <div class="guest-row__info">
              <span class="guest-row__label">Seniorer</span>
              <span class="guest-row__desc">65+ år</span>
            </div>
            <div class="guest-row__controls">
              <button 
                @click="updateGuests('seniors', -1)" 
                :disabled="localSeniors <= 0"
                type="button"
                class="guest-btn">
                −
              </button>
              <span class="guest-count">{{ localSeniors }}</span>
              <button 
                @click="updateGuests('seniors', 1)"
                type="button"
                class="guest-btn">
                +
              </button>
            </div>
          </div>

          <div class="guest-total-section">
            <p class="guest-total">Totalt: {{ totalGuests }} gäst{{ totalGuests !== 1 ? 'er' : '' }}</p>
            <p class="price-total">{{ totalPrice }} kr</p>
          </div>
          
          <div v-if="validationError" class="validation-error">
            {{ validationError }}
          </div>
        </div>

        <!-- Addon Editor -->
        <div v-if="experience?.addons?.length" class="guest-editor addon-editor">
          <h3 class="guest-editor__title">Tillval (valfritt)</h3>
          
          <div v-for="addonSlug in experience.addons" :key="addonSlug" class="guest-row">
            <div class="guest-row__info">
              <span class="guest-row__label">{{ capitalize(getAddon(addonSlug)?.title || addonSlug) }}</span>
              <span class="guest-row__desc">+{{ getAddon(addonSlug)?.price }} kr/gäst</span>
            </div>
            <div class="guest-row__controls">
              <button 
                @click="updateAddonQuantity(addonSlug, -1)" 
                :disabled="!selectedAddonQuantities[addonSlug] || selectedAddonQuantities[addonSlug] === 0"
                type="button"
                class="guest-btn">
                −
              </button>
              <span class="guest-count">{{ selectedAddonQuantities[addonSlug] || 0 }}</span>
              <button 
                @click="updateAddonQuantity(addonSlug, 1)"
                :disabled="(selectedAddonQuantities[addonSlug] || 0) >= totalGuests || totalGuests === 0"
                type="button"
                class="guest-btn">
                +
              </button>
            </div>
          </div>
        </div>
        
        <div class="calendar-container">
          <div class="date-picker-wrapper" @click="dateInput?.showPicker()">
            <div class="date-label">
              <Calendar :size="18" />
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
          <button @click="$emit('close')" class="btn btn--secondary">
            Avbryt
          </button>
          <button 
            @click="handleConfirm" 
            :disabled="!selectedDate || totalGuests === 0 || !!validationError"
            class="btn btn--primary">
            {{ editMode ? 'Uppdatera bokning' : 'Bekräfta bokning' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
import { useCartStore } from '~/stores/useCartStore'
import { useExperiences } from '~/composables/useExperiences'

interface Props {
  show: boolean
  experience: any
  initialDate?: string
  adults?: number
  children?: number
  seniors?: number
  editMode?: boolean
  cartItemIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialDate: '',
  adults: 1,
  children: 0,
  seniors: 0,
  editMode: false,
  cartItemIndex: undefined
})
const emit = defineEmits<{
  close: []
  update: [payload: { index: number; date: string; adults: number; children: number; seniors: number }]
}>()

const cartStore = useCartStore()
const { getAddon } = useExperiences()

const selectedDate = ref(props.initialDate || '')
const dateInput = ref<HTMLInputElement | null>(null)

// Local guest counts that can be edited
const localAdults = ref(props.adults)
const localChildren = ref(props.children)
const localSeniors = ref(props.seniors)

// Addon quantities management
const selectedAddonQuantities = ref<Record<string, number>>({})

// Computed total guests
const totalGuests = computed(() => localAdults.value + localChildren.value + localSeniors.value)

// Validation based on experience constraints
const validationError = computed(() => {
  if (!props.experience) return null
  
  const total = totalGuests.value
  
  // Check total guest count
  if (total < props.experience.minGuests) {
    return `Minst ${props.experience.minGuests} gäst${props.experience.minGuests > 1 ? 'er' : ''} krävs`
  }
  if (total > props.experience.maxGuests) {
    return `Maximalt ${props.experience.maxGuests} gäster tillåtna`
  }
  
  // Check category restrictions
  if (localChildren.value > 0 && !props.experience.allowedCategories?.children) {
    return 'Barn inte tillåtna för denna upplevelse'
  }
  if (localAdults.value > 0 && !props.experience.allowedCategories?.adults) {
    return 'Vuxna inte tillåtna för denna upplevelse'
  }
  if (localSeniors.value > 0 && !props.experience.allowedCategories?.seniors) {
    return 'Seniorer inte tillåtna för denna upplevelse'
  }
  
  return null
})

// Computed total price
const totalPrice = computed(() => {
  if (!props.experience) return 0
  
  const basePrice = props.experience.price * totalGuests.value
  
  // Add addons price based on selected quantities
  const addonsPrice = Object.entries(selectedAddonQuantities.value).reduce((sum, [slug, quantity]) => {
    const addon = getAddon(slug)
    return sum + (addon?.price || 0) * quantity
  }, 0)
  
  return basePrice + addonsPrice
})

// Update guest counts
const updateGuests = (type: 'adults' | 'children' | 'seniors', delta: number) => {
  if (type === 'adults') {
    localAdults.value = Math.max(0, localAdults.value + delta)
  } else if (type === 'children') {
    localChildren.value = Math.max(0, localChildren.value + delta)
  } else if (type === 'seniors') {
    localSeniors.value = Math.max(0, localSeniors.value + delta)
  }
}

// Update addon quantities with zero-cleanup
const updateAddonQuantity = (slug: string, delta: number) => {
  const currentQuantity = selectedAddonQuantities.value[slug] || 0
  const newQuantity = Math.max(0, Math.min(totalGuests.value, currentQuantity + delta))
  
  if (newQuantity === 0) {
    // Zero-cleanup: remove from object
    const { [slug]: _, ...rest } = selectedAddonQuantities.value
    selectedAddonQuantities.value = rest
  } else {
    selectedAddonQuantities.value[slug] = newQuantity
  }
}

// Set minimum date to today, autoimports from utils/date.ts
const minDate = getTodayString();

// Initialize selectedDate and guest counts when modal opens
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    selectedDate.value = props.initialDate || ''
    localAdults.value = props.adults
    localChildren.value = props.children
    localSeniors.value = props.seniors
    
    // Initialize addon quantities from cart item in edit mode
    if (props.editMode && props.cartItemIndex !== undefined) {
      const cartItem = cartStore.items[props.cartItemIndex]
      if (cartItem?.selectedAddons) {
        selectedAddonQuantities.value = cartItem.selectedAddons.reduce((acc, addon) => {
          acc[addon.slug] = addon.quantity
          return acc
        }, {} as Record<string, number>)
      }
    } else {
      selectedAddonQuantities.value = {}
    }
  }
})

// Sync with props when they change (including initialDate)
watch(() => [props.initialDate, props.adults, props.children, props.seniors], () => {
  if (props.show) {
    selectedDate.value = props.initialDate || ''
    localAdults.value = props.adults
    localChildren.value = props.children
    localSeniors.value = props.seniors
  }
})

// Watch totalGuests to clamp addon quantities
watch(totalGuests, (newTotal) => {
  Object.keys(selectedAddonQuantities.value).forEach(slug => {
    const currentQty = selectedAddonQuantities.value[slug]
    if (currentQty && currentQty > newTotal) {
      selectedAddonQuantities.value[slug] = newTotal
    }
  })
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

const handleConfirm = () => {
  if (!selectedDate.value || !props.experience || totalGuests.value === 0) return
  
  // Map selected addon quantities to addon objects
  const selectedAddons = Object.entries(selectedAddonQuantities.value).map(([slug, quantity]) => {
    const addon = getAddon(slug)
    return addon ? { slug: addon.slug, title: addon.title, price: addon.price, quantity } : null
  }).filter(Boolean) as Array<{ slug: string; title: string; price: number; quantity: number }>
  
  if (props.editMode && props.cartItemIndex !== undefined) {
    // Edit mode: update cart item directly
    cartStore.updateCartItem(
      props.cartItemIndex,
      selectedDate.value,
      localAdults.value,
      localChildren.value,
      localSeniors.value
    )
    // Update addons
    const cartItem = cartStore.items[props.cartItemIndex]
    if (cartItem) {
      cartItem.selectedAddons = selectedAddons
    }
    
    emit('update', {
      index: props.cartItemIndex,
      date: selectedDate.value,
      adults: localAdults.value,
      children: localChildren.value,
      seniors: localSeniors.value
    })
  } else {
    // Add mode: add to cart
    cartStore.addToCart(
      props.experience, 
      selectedAddons, 
      selectedDate.value,
      localAdults.value,
      localChildren.value,
      localSeniors.value
    )
  }
  
  // Close modal
  emit('close')
}
</script>

<style scoped>
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
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

/* Guest Editor Styles */
.guest-editor {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.guest-editor__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.addon-editor {
  margin-top: 1.5rem;
}

.guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.guest-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.guest-row__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.guest-row__label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1a1a1a;
}

.guest-row__desc {
  font-size: 0.8125rem;
  color: #6b7280;
}

.guest-row__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.guest-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.guest-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.guest-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.guest-count {
  min-width: 2rem;
  text-align: center;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.guest-total-section {
  margin-top: 1rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guest-total {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.price-total {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
}

.validation-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.calendar-container {
  margin-bottom: 2rem;
}

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

.date-label :deep(svg) {
  color: #6b7280;
  flex-shrink: 0;
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
