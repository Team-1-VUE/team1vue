<script setup lang="ts">
import ExperienceCardList from "~/components/ExperienceCardList.vue";
import { useExperiences } from "~/composables/useExperiences";
import SearchBar, { type SearchFilters } from "~/components/SearchBar.vue";
import { useRoute, useRouter } from "#imports";

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
  const totalGuests = adults + children + seniors;

  return experiences.value.filter((exp) => {
    // 1. Kapacitet
    if (totalGuests > 0) {
      if (totalGuests < exp.minGuests || totalGuests > exp.maxGuests) {
        return false;
      }
    }

    // 2. Ålderskategorier
    if (children > 0 && !exp.allowedCategories.children) return false;
    if (adults > 0 && !exp.allowedCategories.adults) return false;
    if (seniors > 0 && !exp.allowedCategories.seniors) return false;

    // 3. Datum – om användaren valt ett datum
    // if (date && exp.availableDates && exp.availableDates.length > 0) {
    //   if (!exp.availableDates.includes(date)) {
    //     return false;
    //   }
    // }

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
      class="page-search"
    />

    <section v-if="loading">
      <p>Laddar upplevelser...</p>
    </section>

    <section v-else>
      <!-- <p class="result-info">
        Visar {{ filteredExperiences.length }} av
        {{ experiences.length }} upplevelser
        <span v-if="filters.date"> för datum {{ filters.date }} </span>
      </p> -->

      <p class="result-info">
        Du har valt datum:
        <strong v-if="filters.date">{{ filters.date }}</strong>
        <span v-else>inget specifikt datum</span>
      </p>

      <ExperienceCardList
        :experiences="filteredExperiences"
        class="experience-grid"
      />

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

.experience-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .experiences-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
