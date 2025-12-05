<template>
  <div class="profile-page">
    <h1>{{ displayName }}</h1>

    <section v-if="loading">
      <p>Laddar upplevelser...</p>
    </section>

    <section v-else>
      <h2>Upplevelser</h2>

      <ExperienceList />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useExperiences } from '~/composables/useExperiences'

const route = useRoute()
const name = route.params.name as string
const displayName = capitalize(name)

const { loading } = useExperiences()
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
