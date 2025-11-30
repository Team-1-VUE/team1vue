<template>
  <div class="profile-page">
    <h1>{{ displayName }}</h1>

    <section v-if="loading">
      <p>Laddar upplevelser...</p>
    </section>

    <section v-else>
      <h2>Upplevelser</h2>

      <div v-if="profileExperiences.length" class="experience-list">
        <div v-for="exp in profileExperiences" :key="exp.slug" class="experience-card">
          <img :src="exp.image" :alt="exp.title" />

          <div class="experience-card--content">
            <h3>{{ exp.title }}</h3>
            <p>{{ exp.description }}</p>
            <p>Varaktighet: {{ exp.duration }}</p>
            <p>Pris: {{ exp.price }} kr</p>

            <div v-if="exp.addons?.length">
              <h4>Tillval</h4>
              <ul>
                <li v-for="addonSlug in exp.addons" :key="addonSlug">
                  {{ getAddon(addonSlug)?.title }} (+{{ getAddon(addonSlug)?.price }} kr)
                </li>
              </ul>
              <p><strong>Totalpris med alla tillval:</strong> {{ exp.price + totalAddonsPrice(exp) }} kr</p>
            </div>

            <div>
              <NuxtLink
                :to="`/upplevelse/${exp.id}`"
                class="btn-readmore">
                Läs mer →
              </NuxtLink>
            </div>

            <NuxtLink
              :to="{ path: `/boka/${exp.id}`, query: { profile: name } }"
              class="btn-book">
              Boka nu
            </NuxtLink>
          </div>
        </div>
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

const { loading, getProfileExperiences, getAddon, totalAddonsPrice } = useExperiences()
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.experience-card {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 8px;
  transition: transform 0.2s;
}

.experience-card:hover {
  transform: translateY(-5px);
}

.experience-card img {
  width: 100%;
  border-radius: 8px 8px 0 0;
}

.experience-card--content {
  text-align: center;
  padding: 1rem;
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
