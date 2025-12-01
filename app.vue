<template>
  <div>
    <NuxtRouteAnnouncer />
    <NavBar />
    <main>
      <NuxtPage />
    </main>
  </div>
</template>
<style>
:root {
  --font-size: 16px;
  --primary-color: #ef4444;
  --secondary-color: #b91c1c;
  --background-color: #ffffff;
  --text-color: #2c3e50;
  --hover-color: #35a372;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --gradient-text: linear-gradient(to right, #dc2626, #991b1b);
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: var(--text-color);
}

main {
  min-height: calc(100vh - 80px);
}
</style>
