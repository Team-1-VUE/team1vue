<template>
  <div class="profile-card">
    <div class="profile-card__image">
      <img :src="profile.profileImage" :alt="profile.name" />
    </div>

    <div class="profile-card__content">
      <h3 class="profile-card__name">{{ capitalize(profile.name) }}</h3>
      <p class="profile-card__short-text">{{ profile.shortText }}</p>
      <p class="profile-card__summary">{{ profile.summaryText }}</p>

      <div class="profile-card__footer">
        <NuxtLink :to="`/profil/${profile.name}`">
          Se upplevelser
          <ArrowRight :size="16" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import type { Profile } from "~/composables/useProfiles";

interface Props {
  profile: Profile;
}

defineProps<Props>();
</script>

<style scoped>
.profile-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.profile-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
}

.profile-card__image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.profile-card:hover .profile-card__image img {
  transform: scale(1.05);
}

.profile-card__content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.profile-card__name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
  text-transform: capitalize;
}

.profile-card__short-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #764ba2;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-card__summary {
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.profile-card__footer {
  margin: auto auto 0;
  padding-top: 1rem;
}

.profile-card__footer a {
  align-items: center;
  display: flex;
  gap: 0.25rem;
}
</style>
