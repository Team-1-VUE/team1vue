<template>
  <div class="profile-page">
    <h1>{{ displayName }}</h1>
    <section class="about">
      <div class="about-container">
        <img
          v-if="profile?.profileImage"
          :src="profile?.profileImage"
          alt="profileimage"
        />
        <p>{{ profile?.about }}</p>
      </div>
    </section>

    <section v-if="loading">
      <p>Laddar upplevelser...</p>
    </section>

    <section v-else>
      <h2 class="experience-subtitle">Upplevelser</h2>

      <ExperienceCardList class="experience-grid" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useExperiences } from "~/composables/useExperiences";
import { useProfiles } from "~/composables/useProfiles";

const route = useRoute();
const name = route.params.name as string;
const displayName = capitalize(name);

const { getProfile } = useProfiles();
const { loading, getProfileExperiences } = useExperiences();

const profile = computed(() => getProfile(name));
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.about {
  margin-bottom: 3rem;
}

.about-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.about-container img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.about-container p {
  flex: 1;
  font-size: 1.1rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .about-container {
    flex-direction: column;
    text-align: center;
  }
}

.experience-subtitle {
  font-family: var(--font-body);
  color: var(--text-color2);
  font-weight: 400;
}

.experience-grid {
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
