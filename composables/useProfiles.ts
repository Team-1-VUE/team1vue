import { ref, onMounted, computed } from "vue";

export type Profile = {
  name: string;
  profileImage: string;
  experiences: string[];
  shortText: string;
  summaryText: string;
};

type ProfileData = {
  profileImage: string;
  experiences: string[];
  shortText: string;
  summaryText: string;
};

type Profiles = { [key: string]: ProfileData };

export function useProfiles() {
  const data = ref<{ profiles: Profiles } | null>(null);
  const loading = ref(true);

  const profiles = computed<Profile[]>(() => {
    if (!data.value?.profiles) return [];
    return Object.entries(data.value.profiles).map(([name, profile]) => ({
      name,
      ...profile,
    }));
  });

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
