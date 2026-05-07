import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 页面切换后回到顶部，避免上一页滚动位置污染当前工作台。
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  // 路由元信息统一维护浏览器/Tauri 标题，页面组件不再各自处理标题副作用。
  const pageTitle = typeof to.meta.title === "string" ? to.meta.title : "热斑检测";
  document.title = `芯能协同管理平台 | ${pageTitle}`;
});
