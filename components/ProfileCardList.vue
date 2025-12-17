<template>
  <div>
    <Card
      v-for="(profile) in profiles"
      :key="profile.name"
      :image="profile.profileImage"
      :imgHref="`/profil/${profile.name}`"
      :alt-text="capitalize(String(profile.name))"
    >
      <template #header>
        <h2>{{ capitalize(String(profile.name)) }}</h2>
      </template>

      <template #default>
        <p class="preamble">{{ profile.shortText }}</p>
        <p>{{ profile.summaryText }}</p>
      </template>

      <template #footer>
        <NuxtLink
          :to="`/profil/${profile.name}`"
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

const { profiles } = useProfiles();
</script>

<style scoped>
.preamble {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  line-height: 1.4;
  letter-spacing: 0.05em;
}

a {
  color: var(--primary-color);
}

/* Overrides default styling for the Card footer slot */
:deep(.card__footer) {
  border: 0;
  margin: auto auto 0;
  padding-top: 1rem;
}
</style>
