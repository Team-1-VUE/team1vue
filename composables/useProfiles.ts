import { ref, onMounted, computed } from "vue";

export type Profile = {
  name: string;
  profileImage: string;
  experiences: string[];
  shortText: string;
  summaryText: string;
  about: string;
};

type ProfileData = {
  profileImage: string;
  experiences: string[];
  shortText: string;
  summaryText: string;
  about: string;
};
const data = ref<{ profiles: Profiles } | null>(null);
const loading = ref(true);

type Profiles = { [key: string]: ProfileData };
if (import.meta.client && !data.value) {
  fetch("/data.json")
    .then((res) => res.json())
    .then((json) => {
      data.value = json;
    })
    .catch((err) => console.error(err))
    .finally(() => {
      loading.value = false;
    });
}

export function useProfiles() {
  const profiles = computed<Profile[]>(() => {
    if (!data.value?.profiles) return [];
    return Object.entries(data.value.profiles).map(([name, profile]) => ({
      name,
      ...profile,
    }));
  });

  const getProfile = (name: string): Profile | null => {
    if (!data.value?.profiles || !data.value.profiles[name]) return null;
    return {
      name,
      ...data.value.profiles[name],
    };
  };

  return {
    loading,
    profiles,
    getProfile,
  };
}
