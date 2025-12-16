import { setupCalendar, DatePicker } from "v-calendar";
import "v-calendar/style.css";

export default defineNuxtPlugin((nuxtApp) => {
  // This installs v-calendar and makes components available
  nuxtApp.vueApp.use(setupCalendar, {});

  // Register the DatePicker component explicitly (safe)
  nuxtApp.vueApp.component("VDatePicker", DatePicker);
});
