<script setup lang="ts">
type NuxtError = {
  statusCode?: number
  message?: string
}

const props = defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="error-page">
    <h1>{{ error.statusCode }} - Oops!</h1>
    <p>{{ error.message || 'Något gick fel på servern.' }}</p>
    <NuxtLink to="/">Till startsidan</NuxtLink>
  </div>
</template>

<style scoped>
.error-page {
  text-align: center;
  margin: 200px auto;
}
</style>
