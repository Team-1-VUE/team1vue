<template>
  <nav class="navbar">
    <div class="navbar-container">
      <NuxtLink to="/" class="navbar-logo">Team uno</NuxtLink>
      <ul class="navbar-menu">
        <li>
          <NuxtLink to="/">Home</NuxtLink>
        </li>
        <li>Kristoffer</li>
        <li>Pencheff</li>
        <li>Simon</li>
        <li>Antonio</li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  background-color: var(--background-color);
  box-shadow: var(--shadow);
  padding: var(--spacing-sm);
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;

  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-menu {
  display: flex;
  gap: var(--spacing-lg);
  list-style: none;
  margin: 0;
  padding: 0;
}
.navbar-menu li {
  text-decoration: none;
  color: var(--text-color);
  transition: color 0.3s;

  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s;
  font-style: italic;
}

.navbar-menu li a {
  text-decoration: none;
  color: inherit;
  font-style: normal;
  font-weight: 600;
}

.navbar-menu li:hover {
  background-color: var(--hover-color);
  cursor: pointer;
  color: white;
  background-color: var(--secondary-color);
  font-weight: 500;
}
</style>
