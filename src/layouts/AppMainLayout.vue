<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <div class="brand-panel">
        <span class="brand-icon">N</span>
        <div class="brand-copy">
          <strong>芯能协同平台</strong>
          <span>工业级热斑巡检系统</span>
        </div>
      </div>

      <nav class="menu" aria-label="主导航">
        <RouterLink
          v-for="item in appNavigationItems"
          :key="item.routeName"
          class="menu-item"
          :class="{ 'is-active': item.routeName === route.name }"
          :to="{ name: item.routeName }"
        >
          <BaseIcon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <p>当前班次</p>
        <strong>一线巡检中心</strong>
      </div>
    </aside>

    <div class="app-main">
      <header class="app-header">
        <div>
          <p class="eyebrow">{{ currentDateText }}</p>
          <h1>{{ currentTitle }}</h1>
          <p class="page-description">{{ currentDescription }}</p>
        </div>

        <div class="header-badges">
          <span class="badge">在线设备 128</span>
          <span class="badge">待处理告警 06</span>
          <span class="badge is-highlight">系统稳定运行</span>
        </div>
      </header>

      <main class="app-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { appNavigationItems } from "@/app/navigation";
import BaseIcon from "@/components/base/BaseIcon.vue";

defineOptions({
  name: "AppMainLayout",
});

const route = useRoute();

const currentTitle = computed(() =>
  typeof route.meta.title === "string" ? route.meta.title : "首页",
);

const currentDescription = computed(() =>
  typeof route.meta.description === "string"
    ? route.meta.description
    : "查看平台总体运行信息。",
);

const currentDateText = computed(() => {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });

  return formatter.format(new Date());
});
</script>

<style scoped>
.app-shell {
  height: 100vh;
  display: flex;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(45, 140, 255, 0.08), transparent 20%),
    linear-gradient(180deg, #eef4fb 0%, #f5f8fc 100%);
}

.app-sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  padding: 20px 0 18px;
  background: linear-gradient(180deg, #0d1835 0%, #121f43 100%);
  color: #dce7ff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.08);
}

.brand-panel {
  padding: 0 22px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #2f89ff 0%, #2459ff 100%);
  box-shadow: 0 10px 24px rgba(45, 140, 255, 0.35);
}

.brand-copy {
  display: grid;
  gap: 2px;
}

.brand-copy strong {
  font-size: 18px;
  color: #ffffff;
}

.brand-copy span {
  font-size: 12px;
  color: #9eb0d2;
}

.menu {
  flex: 1;
  padding: 18px 0;
  display: grid;
  gap: 6px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(140, 196, 255, 0.35) transparent;
}

.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(140, 196, 255, 0.35);
}

.menu-item {
  height: 54px;
  padding: 0 26px;
  color: #dce7ff;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.menu-item:hover {
  background: rgba(47, 137, 255, 0.14);
}

.menu-item.is-active {
  color: #ffffff;
  background: linear-gradient(90deg, #2b8cff 0%, #1f63f0 100%);
  box-shadow: inset 3px 0 0 #8cc4ff;
}

.sidebar-footer {
  margin-top: auto;
  margin-inline: 18px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-footer p,
.sidebar-footer strong {
  margin: 0;
}

.sidebar-footer p {
  font-size: 12px;
  color: #95abd1;
}

.sidebar-footer strong {
  margin-top: 6px;
  display: block;
  color: #ffffff;
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.app-header {
  padding: 26px 28px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7a8da8;
  font-size: 13px;
}

.app-header h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.1;
  color: #152238;
}

.page-description {
  margin: 10px 0 0;
  color: #70839f;
  font-size: 14px;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #dbe5f2;
  background: rgba(255, 255, 255, 0.82);
  color: #2a3b55;
  display: inline-flex;
  align-items: center;
}

.badge.is-highlight {
  color: #1257d8;
  background: rgba(45, 140, 255, 0.12);
  border-color: rgba(45, 140, 255, 0.22);
}

.app-content {
  padding: 0 28px 28px;
}

@media (max-width: 1080px) {
  .app-shell {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  .app-sidebar {
    width: 100%;
    min-width: 0;
    height: auto;
    padding-bottom: 0;
    overflow: visible;
  }

  .menu {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0;
    flex: none;
    overflow: visible;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .menu-item {
    min-height: 68px;
    padding: 10px 6px;
    justify-content: center;
    flex-direction: column;
    font-size: 12px;
  }

  .sidebar-footer {
    display: none;
  }

  .app-header,
  .app-content {
    padding-left: 16px;
    padding-right: 16px;
  }

  .app-main {
    height: auto;
    overflow: visible;
  }
}

@media (max-width: 720px) {
  .menu {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .app-header {
    flex-direction: column;
  }

  .app-header h1 {
    font-size: 24px;
  }
}
</style>
