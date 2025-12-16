import { ref, onMounted, computed } from "vue";

interface Addon {
  slug: string;
  title: string;
  price: number;
}

export interface TimeSlot {
  time: string;
  capacity: number;
  booked: number;
}

export type ExperienceSchedule = Record<string, TimeSlot[]>;

export interface Experience {
  id: string;
  slug: string;
  owner: string;
  title: string;
  description: string;
  about: string;
  duration: string;
  price: number;
  categoryPrices?: {
    adults: number;
    children: number;
    seniors: number;
  };
  image: string;
  addons: Array<{ title: string; price: number }>;
  minGuests: number;
  maxGuests: number;
  allowedCategories: {
    children: boolean;
    adults: boolean;
    seniors: boolean;
  };
  availableDates: string[];
  schedule?: ExperienceSchedule;
}

type ProfileData = {
  profileImage: string;
  experiences: string[];
};
type Profiles = { [key: string]: ProfileData };

export function useExperiences() {
  const data = ref<{
    profiles: Profiles;
    experiences: Experience[];
    addons: Addon[];
  } | null>(null);
  const loading = ref(true);

  const experiences = computed(() => data.value?.experiences ?? []);

  onMounted(async () => {
    try {
      const res = await fetch("/data2.json");
      data.value = await res.json();
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  });

  const getProfileExperiences = (profileName: string) => {
    const profile = data.value?.profiles[profileName];
    if (!profile) return [];

    const slugs = profile.experiences || [];
    return (
      data.value?.experiences.filter((exp) => slugs.includes(exp.slug)) || []
    );
  };

  const getProfileImage = (profileName: string) => {
    return data.value?.profiles[profileName]?.profileImage || "";
  };

  const getExperienceById = (id: string) =>
    data.value?.experiences.find((exp) => exp.id === id) || null;

  const getExperienceBySlug = (slug: string) =>
    data.value?.experiences.find((exp) => exp.slug === slug) || null;

  const totalAddonsPrice = (exp: Experience) =>
    exp.addons.reduce((sum, addon) => sum + addon.price, 0);

  const getAddon = (slug: string) => {
    return (
      data.value?.addons.find(
        (addon) => addon.slug === slug || addon.title === slug
      ) ?? null
    );
  };

  return {
    loading,
    experiences,
    getProfileExperiences,
    getProfileImage,
    getExperienceById,
    totalAddonsPrice,
    getAddon,
    getExperienceBySlug,
  };
}
