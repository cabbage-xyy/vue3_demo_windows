<template>
  <div class="app-shell">
    <aside class="app-sidebar" aria-label="主导航">
      <RouterLink class="brand-panel" :to="{ name: routeNames.hotspotDetection }" aria-label="热斑检测">
        <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M5 8.3 15.6 3l10.8 5.4v15.2l-5.2 2.7V12.2L15.6 9.5l-5.5 2.7v14L5 23.6z" />
          <path d="M12.6 13.6 16 11.9l8 4v6.3l-3.2 1.6v-5.7L16 15.7l-3.4 1.7z" />
          <path d="M10.1 12.2 15.6 9.5v6.2l-5.5 2.7z" />
        </svg>
        <span class="brand-name">热斑检测</span>
      </RouterLink>

      <nav class="side-menu">
        <template v-for="item in appNavigationItems" :key="item.label + item.icon">
          <RouterLink
            v-if="item.routeName"
            class="side-menu-item"
            :class="{ 'is-active': item.routeName === route.name }"
            :to="{ name: item.routeName }"
            :title="item.description"
          >
            <span class="menu-icon">
              <BaseIcon :name="item.icon" :size="20" :stroke-width="2.5" />
            </span>
            <span>{{ item.label }}</span>
          </RouterLink>

          <button v-else type="button" class="side-menu-item" :title="item.description">
            <span class="menu-icon">
              <span v-if="item.marker" class="menu-marker">{{ item.marker }}</span>
              <BaseIcon v-else :name="item.icon" :size="20" :stroke-width="2.5" />
            </span>
            <span>{{ item.label }}</span>
          </button>
        </template>
      </nav>
    </aside>

    <header class="app-header" :class="{ 'has-header-controls': showHeaderControls }">
      <div class="header-left">
        <div class="page-title">
          <span aria-hidden="true"></span>
          <strong>{{ pageTitle }}</strong>
        </div>

        <div v-if="showHeaderControls" class="filter-cluster" aria-label="任务筛选">
          <button
            v-for="filter in headerFilters"
            :key="filter.id"
            type="button"
            class="filter-chip"
            :class="{ 'is-selected': filter.selected }"
          >
            <span>{{ filter.label }}</span>
            <BaseIcon name="chevron-down" :size="15" :stroke-width="2.4" />
          </button>
        </div>
      </div>

      <div v-if="showHeaderControls" class="header-right">
        <button type="button" class="status-selector">
          <span>未开始/检测中/检测完成</span>
          <BaseIcon name="chevron-down" :size="16" :stroke-width="2.4" />
        </button>
      </div>
    </header>

    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { appNavigationItems } from "@/app/navigation";
import BaseIcon from "@/components/base/BaseIcon.vue";
import { routeNames } from "@/router/route-names";

defineOptions({
  name: "AppMainLayout",
});

const route = useRoute();

const headerFilters = [
  { id: "company", label: "公司名称", selected: true },
  { id: "station", label: "电站名称", selected: false },
  { id: "roof", label: "屋顶名称", selected: false },
];

const pageTitle = computed(() => (typeof route.meta.title === "string" ? route.meta.title : "热斑检测"));
const showHeaderControls = computed(() => route.name === routeNames.hotspotDetection);
</script>

<style scoped>
.app-shell {
  width: 100vw;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  grid-template-rows: 76px minmax(0, 1fr);
  background: #edf3f8;
  color: #141c2b;
  overflow: hidden;
}

.app-sidebar {
  grid-row: 1 / -1;
  min-width: 0;
  min-height: 0;
  background:
    linear-gradient(180deg, rgba(36, 57, 87, 0.12), transparent 24%),
    #182337;
  border-right: 1px solid rgba(20, 30, 48, 0.82);
  display: grid;
  grid-template-rows: 76px minmax(0, 1fr);
  overflow: hidden;
}

.brand-panel {
  min-width: 0;
  height: 76px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  filter: drop-shadow(0 9px 18px rgba(30, 119, 255, 0.3));
}

.brand-mark path:first-child {
  fill: #2f87ff;
}

.brand-mark path:nth-child(2) {
  fill: #6bb7ff;
}

.brand-mark path:nth-child(3) {
  fill: #1769e8;
}

.brand-name {
  min-width: 0;
  color: #f7fbff;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.side-menu {
  min-width: 0;
  min-height: 0;
  padding: 34px 0 24px;
  display: grid;
  align-content: start;
  gap: 8px;
  overflow-y: auto;
  scrollbar-width: none;
}

.side-menu::-webkit-scrollbar {
  display: none;
}

.side-menu-item {
  width: 100%;
  min-width: 0;
  height: 62px;
  border: 0;
  border-left: 4px solid transparent;
  background: transparent;
  color: #d9e5f4;
  text-decoration: none;
  padding: 0 16px 0 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.side-menu-item:hover,
.side-menu-item.is-active {
  border-left-color: #f6fbff;
  background: linear-gradient(135deg, #2188ff 0%, #0e67f4 100%);
  color: #ffffff;
}

.menu-icon {
  width: 23px;
  height: 23px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex: 0 0 auto;
}

.menu-marker {
  font-size: 23px;
  font-weight: 600;
  line-height: 1;
}

.app-header {
  min-width: 0;
  min-height: 0;
  border-top: 2px solid rgba(20, 30, 48, 0.92);
  border-bottom: 1px solid rgba(218, 226, 236, 0.9);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 30px rgba(55, 78, 110, 0.06);
  padding: 0 28px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 20px;
  overflow: hidden;
}

.header-left,
.header-right,
.filter-cluster {
  min-width: 0;
  display: flex;
  align-items: center;
}

.header-left {
  overflow: hidden;
  gap: 24px;
}

.page-title {
  min-width: 128px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.page-title span {
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: #1879ff;
}

.page-title strong {
  color: #161c28;
  font-size: 18px;
  font-weight: 800;
}

.filter-cluster {
  flex: 0 0 auto;
  overflow: hidden;
  gap: 20px;
}

.filter-chip,
.status-selector,
.progress-chip,
.score-chip {
  height: 43px;
  border: 1px solid #dfe6ef;
  background: #ffffff;
  color: #172033;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.filter-chip {
  min-width: 0;
  width: 172px;
  flex: 0 0 172px;
  padding: 0 14px 0 18px;
  justify-content: space-between;
  box-shadow: 0 7px 18px rgba(56, 84, 120, 0.04);
}

.filter-chip span:first-child,
.status-selector span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  min-width: 0;
  overflow: hidden;
  justify-content: flex-end;
  gap: 18px;
}

.status-selector {
  width: min(278px, 100%);
  min-width: 0;
  border-color: transparent;
  background: transparent;
  font-weight: 600;
  justify-content: flex-end;
}

.header-divider {
  width: 1px;
  height: 37px;
  background: #dde5ef;
}

.progress-chip,
.score-chip {
  border-color: transparent;
  background: transparent;
  padding: 0 4px;
  gap: 8px;
}

.progress-chip svg {
  color: #1474ff;
  fill: #1474ff;
  stroke: #ffffff;
}

.score-chip svg:first-child {
  color: #ff9e00;
  fill: #ff9e00;
  stroke: #ff9e00;
}

.score-chip strong {
  color: #111827;
  font-size: 18px;
}

.app-content {
  min-width: 0;
  min-height: 0;
  padding: 24px 26px;
  overflow: auto;
  scrollbar-width: none;
}

.app-content::-webkit-scrollbar {
  display: none;
}

@media (max-width: 1280px) {
  .app-shell {
    grid-template-columns: 160px minmax(0, 1fr);
  }

  .brand-name {
    font-size: 20px;
  }

  .side-menu-item {
    height: 62px;
    padding: 0 16px 0 18px;
    font-size: 16px;
  }

  .filter-chip {
    width: 156px;
    flex-basis: 156px;
  }
}

@media (max-width: 1180px) {
  .app-header {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 76px;
    padding: 14px 18px;
  }

  .header-left,
  .header-right {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-cluster {
    flex-wrap: wrap;
  }

  .status-selector {
    justify-content: flex-start;
  }
}

@media (max-width: 1040px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto minmax(0, 1fr);
  }

  .app-sidebar {
    grid-row: auto;
    grid-template-rows: 64px auto;
  }

  .side-menu {
    padding: 0 12px 12px;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    overflow-x: auto;
  }

  .side-menu-item {
    width: auto;
    min-width: 132px;
    height: 48px;
    border-left: 0;
    border-radius: 8px;
    padding: 0 16px;
    font-size: 15px;
  }

  .header-left,
  .header-right {
    flex-wrap: wrap;
  }
}

@media (max-width: 720px) {
  .filter-cluster,
  .header-right {
    align-items: stretch;
  }

  .filter-chip,
  .status-selector,
  .progress-chip,
  .score-chip {
    min-width: 0;
    width: 100%;
  }

  .app-content {
    padding: 16px;
  }
}
</style>
