import { ref, onMounted } from 'vue'

type Addon = { slug: string; title: string; price: number }
type Experience = {
  id: string
  slug: string
  owner: string
  title: string
  description: string
  duration: string
  price: number
  image: string
  addons: string[]
}
type Profiles = { [key: string]: string[] }

export function useExperiences() {
  const data = ref<{ profiles: Profiles; experiences: Experience[]; addons: Addon[] } | null>(null)
  const loading = ref(true)

  onMounted(async () => {
    try {
      const res = await fetch('/data.json')
      data.value = await res.json()
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  })

  const getProfileExperiences = (profileName: string) => {
    const slugs = data.value?.profiles[profileName] || []
    return data.value?.experiences.filter(exp => slugs.includes(exp.slug)) || []
  }

  const getExperienceById = (id: string) => data.value?.experiences.find(exp => exp.id === id) || null

  const getAddon = (slug: string) => data.value?.addons.find(a => a.slug === slug) || null

  const totalAddonsPrice = (exp: Experience) =>
    exp.addons.reduce((sum, slug) => sum + (getAddon(slug)?.price || 0), 0)

  return { loading, getProfileExperiences, getExperienceById, getAddon, totalAddonsPrice }
}
