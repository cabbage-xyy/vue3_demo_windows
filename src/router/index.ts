import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const pageTitle = typeof to.meta.title === "string" ? to.meta.title : "热斑检测";
  document.title = `芯能协同管理平台 | ${pageTitle}`;
});
