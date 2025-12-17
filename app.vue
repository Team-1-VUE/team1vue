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
  --primary-color: #0f3f78;
  --secondary-color: #f57c00;
  --background-color: #ecedf2;
  --text-color: #081f3d;
  --hover-color: #1e5fa8;
  --shadow: 0 4px 6px rgba(8, 31, 61, 0.12);
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --gradient-text: linear-gradient(135deg, #1e5fa8, #0f3f78, #081f3d);
  --gradient-bg: linear-gradient(135deg, #1e5fa8, #0f3f78, #081f3d);

  /* Gamla variabler nedan*/

  /* --font-size: 16px;
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
  */
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
}
</style>
