import { ref, onMounted } from "vue";

type ProfileData = {
  name?: string;
  profileImage: string;
  experiences: string[];
  shortText?: string;
  summaryText?: string;
};

type Profiles = { [key: string]: ProfileData };

export function useProfiles() {
  const profiles = ref<Profiles | null>(null);
  const loading = ref(true);

  onMounted(async () => {
    try {
      const res = await fetch("/data2.json");
      profiles.value = (await res.json()).profiles;
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  });

  const getProfile = (name: string) => {
    return profiles.value?.[name] || null;
  };

  const getProfileImage = (name: string) => {
    return profiles.value?.[name]?.profileImage || "";
  };

  const getProfileExperiences = (name: string) => {
    return profiles.value?.[name]?.experiences || [];
  };

  const getShortText = (name: string) => {
    return profiles.value?.[name]?.shortText || "";
  };

  const getSummaryText = (name: string) => {
    return profiles.value?.[name]?.summaryText || "";
  };

  return {
    profiles,
    loading,
    getProfile,
    getProfileImage,
    getProfileExperiences,
    getShortText,
    getSummaryText,
  };
}
