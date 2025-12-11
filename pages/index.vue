<script setup lang="ts">
import { useRouter } from "#imports";
import { ArrowRight, Heart, Sparkles, Users, Calendar } from "lucide-vue-next";
import SearchBar, { type SearchFilters } from "~/components/SearchBar.vue";

const router = useRouter();
const { loading: loadingProfiles }  = useProfiles();

const searchFilters = ref<SearchFilters>({
  date: "",
  adults: 1,
  children: 0,
  seniors: 0,
});

const handleSearch = (filters: SearchFilters) => {
  // När någon söker från startsidan → skicka till /upplevelse med query params
  router.push({
    path: "/upplevelse",
    query: {
      date: filters.date,
      adults: String(filters.adults),
      children: String(filters.children),
      seniors: String(filters.seniors),
    },
  });
};
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-blur-layer">
        <div class="hero-blur-circle hero-blur-circle--top"></div>
        <div class="hero-blur-circle hero-blur-circle--bottom"></div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <Sparkles :size="18" />
          <span>Unique Team Experiences</span>
        </div>

        <h1 class="hero-title">Book Time With Our Team</h1>

        <p class="hero-subtitle">
          Skip the ordinary. Choose your experience and spend quality time with
          one of our amazing team members. Every moment is an adventure waiting
          to happen.
        </p>

        <SearchBar
          v-model="searchFilters"
          @search="handleSearch"
          class="hero-search" />

        <div class="hero-actions">
          <NuxtLink to="/upplevelse" class="btn btn-primary">
            <span>Explore Experiences</span>
            <ArrowRight :size="20" />
          </NuxtLink>
          <button class="btn btn-secondary">Learn More</button>
        </div>
      </div>
    </section>
    <section class="stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <Heart :size="32" />
          </div>
          <div class="stat-value">500+</div>
          <div class="stat-label">Happy Experiences</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <Users :size="32" />
          </div>
          <div class="stat-value">4</div>
          <div class="stat-label">Amazing Team Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <Calendar :size="32" />
          </div>
          <div class="stat-value">24/7</div>
          <div class="stat-label">Available Experiences</div>
        </div>
      </div>
    </section>
    <section class="team">
      <div class="team-inner">
        <div class="team-header">
          <h2 class="team-title">Meet Our Team</h2>
          <p class="team-text">
            Each team member offers unique experiences tailored to different
            interests. Choose who you'd like to spend time with.
          </p>
        </div>

        <p v-if="loadingProfiles">Laddar profiler...</p>

        <ProfileCardList v-else class="team-grid" />

      </div>
    </section>
    <section class="cta">
      <div class="cta-inner">
        <h2 class="cta-title">Ready to Create Memories?</h2>
        <p class="cta-text">
          Don't wait for the perfect moment. Every experience is designed to be
          unforgettable. Book your time with us today!
        </p>
        <NuxtLink to="/upplevelse" class="btn btn-primary">
          Browse All Experiences
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  background-color: #ffffff;
  color: #111827;
}
.hero {
  position: relative;
  padding: 8rem 1rem 5rem;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #fef2f2, #ffffff, #fef2f2);
  z-index: 0;
}

.hero-blur-layer {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  z-index: 0;
}

.hero-blur-circle {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
}

.hero-blur-circle--top {
  top: 5rem;
  left: 2.5rem;
  width: 18rem;
  height: 18rem;
  background-color: #ef4444;
}

.hero-blur-circle--bottom {
  bottom: 5rem;
  right: 2.5rem;
  width: 24rem;
  height: 24rem;
  background-color: #b91c1c;
}

.hero-content {
  position: relative;
  max-width: 72rem;
  margin: 0 auto;
  text-align: center;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.hero-title {
  margin-bottom: 1.5rem;
  font-weight: 800;
  font-size: 3rem;
  line-height: 1.05;
  background-image: linear-gradient(to right, #dc2626, #b91c1c, #7f1d1d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  margin: 0 auto 1.75rem; /* var 2.5rem – lite tajtare mot toppen */
  max-width: 48rem;
  font-size: 1.125rem;
  color: #4b5563;
}

.hero-search {
  margin: 1.25rem auto 0; /* var 2rem – mindre “häng” neråt */
  max-width: 800px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem; /* NY: lite extra luft under search-baren */
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-image: linear-gradient(to right, #ef4444, #b91c1c);
  color: #ffffff;
  box-shadow: 0 15px 30px rgba(220, 38, 38, 0.3);
  transform: translateY(0);
}

.btn-primary:hover {
  box-shadow: 0 20px 40px rgba(185, 28, 28, 0.4);
  transform: scale(1.05);
}

.btn-secondary {
  background-color: #ffffff;
  color: #dc2626;
  border: 2px solid #ef4444;
}

.btn-secondary:hover {
  background-color: #fef2f2;
}

.stats {
  padding: 4rem 1rem;
  background-image: linear-gradient(to right, #dc2626, #991b1b);
  color: #ffffff;
}

.stats-grid {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.stat-card {
  text-align: center;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #fecaca;
}

.team {
  padding: 5rem 1rem;
}

.team-inner {
  max-width: 72rem;
  margin: 0 auto;
}

.team-header {
  text-align: center;
  margin-bottom: 3rem;
}

.team-title {
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 2rem;
  background-image: linear-gradient(to right, #dc2626, #991b1b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.team-text {
  max-width: 32rem;
  margin: 0 auto;
  color: #4b5563;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(250px, 1fr));
  gap: 2rem;

  @media (min-width: 1090px) {
    grid-template-columns: repeat(4, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.team-loading {
  text-align: center;
  color: #4b5563;
}

.team-card {
  background-color: #ffffff;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  text-align: left;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.team-card:hover {
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
  transform: translateY(-0.5rem);
}

.member-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  transition: transform 0.3s ease;
}

.team-card:hover .member-avatar {
  transform: scale(1.1);
}

.member-name {
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.member-role {
  margin-bottom: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

.member-description {
  margin-bottom: 1rem;
  color: #4b5563;
}

.member-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 500;
  transition: gap 0.3s ease;
}

.team-card:hover .member-link {
  gap: 0.75rem;
}

.cta {
  padding: 5rem 1rem;
  background: linear-gradient(135deg, #fef2f2, #ffffff);
}

.cta-inner {
  max-width: 48rem;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 700;
  background-image: linear-gradient(to right, #dc2626, #991b1b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.cta-text {
  margin-bottom: 2rem;
  font-size: 1.125rem;
  color: #4b5563;
}

@media (max-width: 480px) {
  .btn {
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (min-width: 640px) {
  .hero-title {
    font-size: 3.75rem;
  }

  .hero-actions {
    flex-direction: row;
  }
}

@media (max-width: 767px) {
  .hero {
    padding: 6rem 1rem 3.5rem;
  }

  .hero-title {
    font-size: 2.4rem;
  }

  .hero-actions {
    gap: 0.75rem;
  }
  .hero-search {
    margin-top: 1.5rem;
    padding: 0 0.5rem;
  }
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .team-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 4.5rem;
  }

  .team-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
