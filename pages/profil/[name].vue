<template>
  <div class="profile-page">
    <h1>{{ displayName }}</h1>

    <section v-if="loading">
      <p>Laddar upplevelser...</p>
    </section>

    <section v-else>
      <h2>Upplevelser</h2>

      <div v-if="profileExperiences.length" class="experience-list">
        <ExperienceCard 
          v-for="exp in profileExperiences" 
          :key="exp.slug" 
          :experience="exp"
          :profile-name="name" />
      </div>

      <div v-else>
        <p>Inga upplevelser hittades för denna profil.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useExperiences } from '~/composables/useExperiences'

const route = useRoute()
const name = route.params.name as string
const displayName = capitalize(name)

const { loading, getProfileExperiences } = useExperiences()
const profileExperiences = computed(() => getProfileExperiences(name))
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.experience-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}
</style>
