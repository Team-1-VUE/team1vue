<script setup lang="ts">
import ExperienceCard from "~/components/ExperienceCard.vue";
import { useExperiences } from "~/composables/useExperiences";

const { experiences } = useExperiences();
</script>

<template>
  <div class="experiences-page">
    <header class="experiences-header">
      <h1>All Experiences</h1>
      <p>Browse all the adventures you can book with our team.</p>
    </header>

    <section class="experiences-grid">
      <ExperienceCard
        v-for="experience in experiences"
        :key="experience.id"
        :experience="experience" />
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
