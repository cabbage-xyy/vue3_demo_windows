<template>
  <div class="app-shell">
    <div class="app-window">
      <nav class="app-topbar" aria-label="主导航">
        <RouterLink class="brand-panel" :to="{ name: routeNames.hotspotDetection }">
          <img class="brand-logo" :src="sunorenLogo" alt="SUNOREN 芯能科技" />
        </RouterLink>

        <div class="menu">
          <RouterLink
            v-for="item in appNavigationItems"
            :key="item.routeName"
            class="menu-item"
            :class="{ 'is-active': item.routeName === route.name }"
            :to="{ name: item.routeName }"
          >
            <BaseIcon :name="item.icon" :size="14" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>

        <div class="header-badges">
          <button type="button" class="header-icon-button notification-button" aria-label="通知">
            <BaseIcon name="bell" :size="17" />
            <span class="notification-dot"></span>
          </button>
          <button type="button" class="user-avatar" aria-label="用户中心">
            <span>刘</span>
          </button>
        </div>
      </nav>

      <div class="app-main">
        <main class="app-content">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";
import { appNavigationItems } from "@/app/navigation";
import BaseIcon from "@/components/base/BaseIcon.vue";
import { routeNames } from "@/router/route-names";
import sunorenLogo from "@/assets/sunoren-logo.svg";

defineOptions({
  name: "AppMainLayout",
});

const route = useRoute();
</script>

<style scoped>
.app-shell {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 10px;
  background: #dfe6ee;
  color: #161d2b;
  overflow: hidden;
  box-sizing: border-box;
}

.app-window {
  width: 100%;
  max-width: none;
  height: 100%;
  margin: 0;
  box-sizing: border-box;
  border: 1px solid rgba(210, 221, 235, 0.72);
  border-radius: 4px;
  background:
    linear-gradient(135deg, rgba(229, 238, 255, 0.85), rgba(255, 255, 255, 0.72) 38%),
    #f8fbff;
  box-shadow: 0 8px 24px rgba(38, 54, 76, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-topbar {
  min-height: 58px;
  padding: 10px 24px 8px;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto minmax(180px, 1fr);
  align-items: center;
  gap: 18px;
}

.brand-panel {
  width: max-content;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.brand-logo {
  width: 158px;
  height: 44px;
  display: block;
  object-fit: contain;
}

.menu {
  min-width: 0;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(218, 228, 242, 0.86);
  display: inline-flex;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 10px 26px rgba(47, 91, 150, 0.08);
}

.menu-item {
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  color: #47566d;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.menu-item:hover,
.menu-item.is-active {
  color: #ffffff;
  background: linear-gradient(135deg, #3495ff 0%, #236bf4 100%);
  box-shadow: 0 8px 18px rgba(47, 130, 255, 0.28);
}

.app-main {
  min-width: 0;
  min-height: 0;
  padding: 0 22px 14px;
  flex: 1;
  display: grid;
  overflow: hidden;
}

.header-badges {
  justify-self: end;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.header-icon-button,
.user-avatar {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(220, 229, 241, 0.92);
  background: rgba(255, 255, 255, 0.78);
  color: #35506f;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 28px rgba(47, 91, 150, 0.07);
  cursor: pointer;
}

.notification-button {
  position: relative;
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 7px;
  height: 7px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #ff5b6e;
}

.user-avatar {
  border-color: rgba(58, 135, 255, 0.38);
  background: linear-gradient(135deg, #39a2ff 0%, #236bf4 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 10px 22px rgba(47, 130, 255, 0.18);
}

.app-content {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 1080px) {
  .app-shell {
    padding: 8px;
  }

  .app-topbar {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .header-badges {
    justify-self: stretch;
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .app-shell {
    padding: 0;
  }

  .app-window {
    border-radius: 0;
  }

  .app-topbar,
  .app-main {
    padding-left: 16px;
    padding-right: 16px;
  }

  .menu {
    width: 100%;
  }

  .menu-item {
    flex: 1;
    justify-content: center;
  }

  .header-badges {
    width: 100%;
    justify-content: stretch;
  }

  .header-icon-button,
  .user-avatar {
    flex: 1;
  }
}
</style>
