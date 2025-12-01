export default defineNuxtConfig({
  modules: ["@pinia/nuxt"],
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
});
