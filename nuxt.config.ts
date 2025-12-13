export default defineNuxtConfig({
  modules: ["@pinia/nuxt"],
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  build: {
    transpile: ["v-calendar"],
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
});
