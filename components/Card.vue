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

<style scoped>
.card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
}

.card__image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.card:hover .card__image img {
  transform: scale(1.05);
}

.card__content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card__header > * {
  margin-block: 0;
}

.card__body {
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.card__body > *:first-child {
  margin-top: 0;
}

.card__body > *:last-child {
  margin-bottom: 0;
}

.card__addons {
  margin-top: 0.5rem;
}

.card__footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}
</style>
