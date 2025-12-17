export default defineNuxtConfig({
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/google-fonts",
  ],
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

  googleFonts: {
    families: {
      Poppins: [600, 700],
      'Public Sans': [400, 500],
    },
    display: 'swap',
  },
});