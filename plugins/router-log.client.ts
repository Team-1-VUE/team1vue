export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.beforeEach((to) => {
    if (to.path.startsWith("/images/")) {
      console.group("🚨 Router tried to navigate to an image path");
      console.log("to:", to.fullPath);
      console.trace();
      console.groupEnd();
    }
  });
});
