<template>
  <div class="profile-page">
    <h1>{{ displayName }}</h1>

    <section v-if="loading">
      <p>Laddar upplevelser...</p>
    </section>

    <section v-else>
      <h2>Upplevelser</h2>

      <div v-if="experiences.length" class="experience-list">
        <div v-for="exp in experiences" :key="exp.slug" class="experience-card">
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
                  {{ getAddon(addonSlug)!.title }} (+{{ getAddon(addonSlug)!.price }} kr)
                </li>
              </ul>
              <p><strong>Totalpris med alla tillval:</strong> {{ exp.price + totalAddonsPrice(exp) }} kr</p>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

type Addon = { slug: string; title: string; price: number }
type Experience = {
  id: number;
  slug: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  addons: string[]
}
type Profiles = { [key: string]: string[] }

const route = useRoute()
const name = route.params.name as string

const displayName = capitalize(name)

const data = ref<{
  profiles: Profiles;
  experiences: Experience[];
  addons: Addon[]
}>({ profiles: {}, experiences: [], addons: [] })
const experiences = ref<Experience[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/data.json')
    const json = await res.json()
    data.value = json

    const profileExperienceSlugs = data.value.profiles[name] || []
    experiences.value = data.value.experiences.filter(exp => profileExperienceSlugs.includes(exp.slug))
  } catch (err) {
    console.error('Failed to load data:', err)
  } finally {
    loading.value = false
  }
})

function getAddon(slug: string): Addon | null {
  return data.value.addons.find(a => a.slug === slug) || null
}

function totalAddonsPrice(exp: Experience) {
  return exp.addons.reduce((sum, slug) => {
    const addon = getAddon(slug)
    return sum + (addon ? addon.price : 0)
  }, 0)
}
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
