<script setup lang="ts">
import { reactive, watch } from "vue";

export interface SearchFilters {
  date: string;
  adults: number;
  children: number;
  seniors: number;
}

// Set minimum date to today, autoimports from utils/date.ts
const minDate = getTodayString();

// Vi använder v-model på komponenten (modelValue in, update:modelValue ut)
const props = withDefaults(
  defineProps<{
    modelValue?: SearchFilters;
    showSearchButton?: boolean;
  }>(),
  {
    showSearchButton: true,
  }
);

const emit = defineEmits<{
  "update:modelValue": [SearchFilters];
  search: [SearchFilters];
}>();

// Lokalt state i komponenten
const filters = reactive<SearchFilters>({
  date: props.modelValue?.date ?? "",
  adults: props.modelValue?.adults ?? 1,
  children: props.modelValue?.children ?? 0,
  seniors: props.modelValue?.seniors ?? 0,
});

// Håll v-model i synk med föräldern
watch(
  filters,
  (value) => {
    emit("update:modelValue", { ...value });
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return;
    filters.date = value.date;
    filters.adults = value.adults;
    filters.children = value.children;
    filters.seniors = value.seniors;
  },
  { deep: true }
);

const onSubmit = (event: Event) => {
  event.preventDefault();
  emit("search", { ...filters });
};
</script>

<template>
  <form class="search-bar" @submit="onSubmit">
    <div class="search-row">
      <div class="field">
        <label for="date">Datum</label>
        <input id="date" v-model="filters.date" type="date" :min="minDate" />
      </div>

      <div class="field">
        <label for="adults">Vuxna</label>
        <input
          id="adults"
          v-model.number="filters.adults"
          type="number"
          min="0" />
      </div>

      <div class="field">
        <label for="children">Barn</label>
        <input
          id="children"
          v-model.number="filters.children"
          type="number"
          min="0" />
      </div>

      <div class="field">
        <label for="seniors">Senior</label>
        <input
          id="seniors"
          v-model.number="filters.seniors"
          type="number"
          min="0" />
      </div>
    </div>
  </form>
</template>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0.75rem;
  background-color: #ffffff;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
  max-width: 100%;
  box-sizing: border-box;
}

/* 🔹 Mobil: 2 kolumner så det blir mindre högt */
.search-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

/* Extra små skärmar (väldigt smala, typ < 380px) → 1 kolumn igen */
@media (max-width: 380px) {
  .search-row {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

label {
  font-size: 0.78rem;
  font-weight: 500;
  color: #4b5563;
}

input {
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
}

/* Knapp kompakt på mobil och fyller raden */
.search-button {
  align-self: stretch;
  padding: 0.6rem 1rem;
  border-radius: 0.65rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background-image: linear-gradient(to right, #ef4444, #b91c1c);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(185, 28, 28, 0.28);
  transition: all 0.15s ease;
  font-size: 0.9rem;
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(185, 28, 28, 0.32);
}

/* 🔹 Tablet och uppåt: mer “lyxig” layout */
@media (min-width: 768px) {
  .search-bar {
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  }

  .search-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .search-button {
    align-self: flex-start;
    width: auto;
    padding-inline: 1.3rem;
  }
}
</style>
