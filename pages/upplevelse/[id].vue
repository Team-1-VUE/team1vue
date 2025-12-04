<template>
  <div v-if="loading">
    <p>Laddar upplevelse...</p>
  </div>

  <div v-else-if="experience">
    <div class="hero" :style="{ backgroundImage: `url(${experience.image})` }">
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
      <p>
        <strong>Totalpris:</strong>
        {{ experience.price + totalAddonsPrice(experience) }} kr
      </p>
    </div>

    <button
      @click="showModal = true"
      class="btn btn--primary">
      Boka
    </button>
  </div>

  <div v-else>
    <p>Upplevelse hittades inte</p>
  </div>

  <BookingModal 
    :show="showModal"
    :experience="experience"
    @close="showModal = false" />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useExperiences } from "~/composables/useExperiences";
import { computed, ref } from "vue";

const route = useRoute();
const id = route.params.id as string;

const { loading, getExperienceById, getAddon, totalAddonsPrice } =
  useExperiences();

const experience = computed(() => getExperienceById(id));

const ownerProfile = computed(() =>
  experience.value ? capitalize(experience.value.owner) : ""
);

const showModal = ref(false);
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
  content: "";
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

.btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}
</style>
