<template>
  <div class="card__list">
    <Card
      v-for="(profile, profileName) in profiles"
      :key="profileName"
      :image="profile.profileImage"
      :alt-text="capitalize(String(profileName))"
    >
      <template #header>
        <h2>{{ capitalize(String(profileName)) }}</h2>
      </template>

      <p class="preamble">{{ profile.shortText }}</p>
      <p>{{ profile.summaryText }}</p>

      <template #footer>
        <NuxtLink
          :to="`/profil/${profileName}`"
          class=""
        >
          Se upplevelser
          <ChevronRight :size="12" />
        </NuxtLink>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import Card from '~/components/Card.vue'

const { profiles, loading } = useProfiles();
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.price-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-xxs;
  margin-bottom: 1rem;
}

.card__list {
  margin-top: $spacing-lg;
  grid-template-columns: repeat(2, minmax(250px, 1fr));

  @media (min-width: 1090px) {
    grid-template-columns: repeat(4, minmax(250px, 1fr));
    gap: $spacing-sm;
  }
}

.card {
  text-align: left;
  :deep(.btn) {
    place-self: center;
  }

  :deep(.card__footer) {
    padding-top: $spacing-xxs;
    border: 0;
    display: flex;
    justify-content: flex-end;
  }
}

.preamble {
  color: $color-primary;
}
</style>
