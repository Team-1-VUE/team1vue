<template>
  <div v-if="experiences.length" class="card__list">
    <Card
      v-for="experience in experiences"
      :key="experience.slug"
      :image="experience.image"
      :altText="experience.title"
    >
      <template #header>
        <h2>{{ experience.title }}</h2>
        <span class="label">{{ experience.duration }}</span>
      </template>

      <!-- Default slot -->
      <p>{{ experience.description }}</p>

      <div v-if="experience.addons?.length" class="addons">
        <p class="label__text">Tillval inkluderar:</p>
        <div class="addons__tags">
          <span
            v-for="addonSlug in experience.addons"
            :key="addonSlug"
            class="label small"
          >
            {{ getAddon(addonSlug)?.title }} | {{ getAddon(addonSlug)?.price }} kr
          </span>
        </div>
      </div>
      <!-- End default slot -->

      <template #footer>
        <div class="price-section">
          <span class="label__text">PRIS</span>
          <span class="label__price">{{ experience.price }} kr</span>

          <span
            v-if="experience.addons?.length && totalAddonsPrice(experience) > 0"
            class="price-total"
          >
            {{ experience.price + totalAddonsPrice(experience) }} kr med tillval
          </span>
        </div>

        <div class="action-buttons">
          <NuxtLink
            :to="`/upplevelse/${experience.id}`"
            class="btn btn--secondary"
          >
            Läs mer
          </NuxtLink>
          <button @click="showModal = experience" class="btn btn--primary">
            Boka
          </button>
        </div>
      </template>
    </Card>

    <BookingModal
      v-if="showModal"
      :show="!!showModal"
      :experience="showModal"
      @close="showModal = null"
    />
  </div>

  <div v-else>
    <p>Inga upplevelser hittades för denna profil.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useExperiences } from '~/composables/useExperiences'
import Card from '~/components/Card.vue'
import BookingModal from '~/components/BookingModal.vue'

const route = useRoute()
const name = route.params.name as string

const { getProfileExperiences, getAddon, totalAddonsPrice } = useExperiences()
const experiences = computed(() => getProfileExperiences(name))

const showModal = ref<null | typeof experiences.value[0]>(null)
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.price-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-xxs;
  margin-bottom: 1rem;
}

.addons {
  padding-top: $spacing-xxs;
}

.addons__tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xxs;
}
</style>