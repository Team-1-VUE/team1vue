<template>
  <div class="card">
    <div v-if="image" class="card__image">
      <img :src="image" :alt="altText" />
    </div>

    <div class="card__content">
      <header v-if="$slots.header" class="card__header">
        <slot name="header"></slot>
      </header>

      <div class="card__body">
        <slot></slot>
      </div>

      <footer v-if="$slots.footer" class="card__footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image?: string
  altText?: string
}>()
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables" as *;

.card {
  background-color: $color-white;
  border-radius: $radius-md;
  box-shadow: $box-shadow;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: $box-shadow-hvr;

    :deep(img) {
      transform: scale(1.05);
    }
  }
}

.card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: $bg-gradient;

  :deep(> img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
}

.card__content {
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  flex: 1;
}

.card__header {
  font-weight: bold;
  font-size: $heading-sm;
  color: $color-heading;

  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  :deep(> h2, > h3, > h4)  {
    font-size: inherit;
    margin: 0;
  }
}

.card__body {
  flex: 1;
  font-size: 0.925rem;
  color: #4b5563;

  :deep(> *:first-child) {
    margin-top: 0;
  }

  :deep(> *:last-child) {
    margin-bottom: 0;
  }
}

.card__footer {
  margin-top: auto;
  padding-top: $spacing-sm;
  border-top: 1px solid $color-grey-lgt;

  :deep(.action-buttons) {
    display: flex;
  }

  :deep(.btn) {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
