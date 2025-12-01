<template>
  <div v-if="loading">
    <p>Laddar...</p>
  </div>

  <div v-else-if="experience">
    <div class="booking-page">
      <h1>Boka: {{ experience?.title }} med {{ profileName }}</h1>
      <p>Upplevelse ID: {{ id }}</p>
      <p>Aktivitetsledare:
        <NuxtLink
          :to="`/profil/${profile}`">
          {{ profile }}
        </NuxtLink>
      </p>
      <p>Pris: {{ experience?.price }} kr</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id as string
const profile = route.query.profile as string

const { loading, getExperienceById } = useExperiences()
const experience = computed(() => getExperienceById(id))
const profileName = computed(() => profile ? capitalize(profile as string) : '')
</script>
