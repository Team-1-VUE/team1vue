<template>
  <div v-if="loading">
    <p>Laddar upplevelse...</p>
  </div>

  <div v-else-if="experience">
    <div
      class="hero"
      :style="{ backgroundImage: `url(${experience.image})` }"
    >
      <h1>{{ experience.title }}</h1>
    </div>

    <h2>{{ experience.title }}</h2>

    <p v-if="experience.owner">
      <NuxtLink :to="`/profil/${experience.owner}`">
        {{ ownerProfile }} →
      </NuxtLink>
    </p>

    <p>{{ experience.description }}</p>
    <p>Pris: {{ experience.price }} kr</p>

    <div v-if="experience.addons?.length">
      <h4>Tillval</h4>
      <ul>
        <li v-for="slug in experience.addons" :key="slug">
          {{ getAddon(slug)?.title }} (+{{ getAddon(slug)?.price }} kr)
        </li>
      </ul>
      <p><strong>Totalpris:</strong> {{ experience.price + totalAddonsPrice(experience) }} kr</p>
    </div>

    <NuxtLink
      :to="{ path: `/boka/${experience.id}`, query: { profile: experience.owner } }"
      class="btn-book"
    >
      Boka nu
    </NuxtLink>
  </div>

  <div v-else>
    <p>Upplevelse hittades inte</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useExperiences } from '~/composables/useExperiences'
import { computed } from 'vue'

const route = useRoute()
const id = route.params.id as string

const { loading, getExperienceById, getAddon, totalAddonsPrice } = useExperiences()

// Computed experience som är null tills data laddats
const experience = computed(() => getExperienceById(id))

// Owner display name
const ownerProfile = computed(() => experience.value ? capitalize(experience.value.owner) : '')
</script>

<style scoped>
.hero {
  position: relative;
  height: 32vw;
  min-height: 320px;
  max-height: 600px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero h1 {
  position: relative;
  z-index: 2;
}

.btn-book {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
</style>
