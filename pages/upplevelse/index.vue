<script setup lang="ts">
import ExperienceCard from "~/components/ExperienceCard.vue";
import { useExperiences, type Experience } from "~/composables/useExperiences";
import SearchBar, { type SearchFilters } from "~/components/SearchBar.vue";
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "#imports";

import {
  hasAvailableSlotForDate,
  getTotalGuestsFromFilters,
} from "~/utils/scheduleHelpers";

function findNextAvailableDate(exps: Experience[]): string | null {
  const todayStr = getTodayString();
  const candidateDates = new Set<string>();

  for (const exp of exps) {
    if (exp.schedule) {
      for (const dateStr of Object.keys(exp.schedule)) {
        if (dateStr < todayStr) continue;
        if (hasAvailableSlotForDate(exp, dateStr, 1)) {
          candidateDates.add(dateStr);
        }
      }
    } else if (exp.availableDates?.length) {
      for (const dateStr of exp.availableDates) {
        if (dateStr >= todayStr) {
          candidateDates.add(dateStr);
        }
      }
    }
  }

  if (!candidateDates.size) return null;

  const sorted = Array.from(candidateDates).sort();
  return sorted[0] ?? null;
}

const { loading, experiences } = useExperiences();
const route = useRoute();
const router = useRouter();

const today = getTodayString();

// Initiera filters från query params
const filters = ref<SearchFilters>({
  date: (route.query.date as string) ?? today,
  adults: Number(route.query.adults ?? 1),
  children: Number(route.query.children ?? 0),
  seniors: Number(route.query.seniors ?? 0),
});

// Watch, om valt datum saknar experiences, hoppa till nästa lediga
const autoAdjustedDate = ref<string | null>(null);

watch(
  () => [experiences.value, filters.value.date],
  ([exps, currentDate]) => {
    if (!exps || !exps.length) return;

    // Om det fanns resultat för detta datum → ändra inget
    if (filteredExperiences.value.length > 0) {
      autoAdjustedDate.value = null;
      return;
    }

    // Om detta datum redan autojusterats → gör inget
    // (annars risk för loop)
    const next = findNextAvailableDate(exps as Experience[]);
    if (!next) return;

    if (next !== currentDate) {
      filters.value.date = next;
      autoAdjustedDate.value = next;
    }
  },
  { immediate: true }
);

// Watch filters and update URL automatically
watch(
  filters,
  (value) => {
    router.push({
      path: "/upplevelse",
      query: {
        date: value.date,
        adults: String(value.adults),
        children: String(value.children),
        seniors: String(value.seniors),
      },
    });
  },
  { deep: true }
);

const filteredExperiences = computed(() => {
  if (!experiences.value) return [];

  const { date, adults, children, seniors } = filters.value;
  const totalGuests = getTotalGuestsFromFilters({ adults, children, seniors });

  return experiences.value.filter((exp) => {
    if (totalGuests > 0) {
      if (totalGuests < exp.minGuests || totalGuests > exp.maxGuests) {
        return false;
      }
    }

    if (children > 0 && !exp.allowedCategories.children) return false;
    if (adults > 0 && !exp.allowedCategories.adults) return false;
    if (seniors > 0 && !exp.allowedCategories.seniors) return false;

    if (date) {
      if (exp.schedule) {
        const guestCountForCapacity = totalGuests > 0 ? totalGuests : 1;
        const hasSlot = hasAvailableSlotForDate(
          exp,
          date,
          guestCountForCapacity
        );

        if (!hasSlot) {
          return false;
        }
      } else if (exp.availableDates && exp.availableDates.length > 0) {
        // Fallback: om ni skulle ha experiences utan schedule
        if (!exp.availableDates.includes(date)) {
          return false;
        }
      }
    }

    return true;
  });
});
</script>

<template>
  <div class="experiences-page">
    <header class="experiences-header">
      <h1>All Experiences</h1>
      <p>Browse all the adventures you can book with our team.</p>
    </header>

    <SearchBar
      v-model="filters"
      :show-search-button="false"
      class="page-search" />

    <section v-if="loading">
      <p>Laddar upplevelser...</p>
    </section>

    <section v-else>
      <p class="result-info">
        Du har valt datum:
        <strong v-if="filters.date">{{ filters.date }}</strong>
        <span v-else>inget specifikt datum</span>
      </p>

      <div class="experiences-grid">
        <ExperienceCard
          v-for="experience in filteredExperiences"
          :key="experience.id"
          :experience="experience" />
      </div>

      <p v-if="!filteredExperiences.length">
        Inga upplevelser matchar din sökning. Testa att ändra datum eller antal
        personer.
      </p>
    </section>
  </div>
</template>

<style scoped>
.experiences-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.experiences-header {
  margin-bottom: 2rem;
}

.experiences-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.experiences-header p {
  color: #4b5563;
}

.page-search {
  margin-bottom: 2rem;
}

.result-info {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #4b5563;
}

.experiences-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .experiences-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
