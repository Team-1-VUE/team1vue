<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="$emit('close')">×</button>
        
        <h2>Välj datum</h2>
        <p class="modal-subtitle">{{ experienceTitle }}</p>
        
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
            :disabled="!selectedDate"
            class="btn btn--primary">
            Bekräfta bokning
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'

interface Props {
  show: boolean
  experienceTitle: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  confirm: [date: string]
}>()

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

const handleConfirm = () => {
  if (!selectedDate.value) return
  emit('confirm', selectedDate.value)
  selectedDate.value = ''
}

// Reset date when modal closes
watch(() => props.show, (isOpen) => {
  if (!isOpen) {
    selectedDate.value = ''
  }
})
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
  margin: 0 0 2rem 0;
  font-size: 1rem;
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
