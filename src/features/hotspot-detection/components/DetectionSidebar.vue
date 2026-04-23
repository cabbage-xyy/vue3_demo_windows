<template>
  <aside class="detection-sidebar">
    <div class="brand">
      <span class="brand-icon">N</span>
      <span class="brand-text">热斑检测</span>
    </div>

    <nav class="menu" aria-label="主导航">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="menu-item"
        :class="{ 'is-active': item.isActive }"
      >
        <BaseIcon :name="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { SidebarMenuItem } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "DetectionSidebar",
});

interface DetectionSidebarProps {
  items: SidebarMenuItem[];
}

defineProps<DetectionSidebarProps>();
</script>

<style scoped>
.detection-sidebar {
  width: 216px;
  min-width: 216px;
  min-height: 100vh;
  background: linear-gradient(180deg, #0c1938 0%, #121d3b 100%);
  color: #dce7ff;
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.08);
}

.brand {
  height: 76px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #2f89ff 0%, #2459ff 100%);
}

.brand-text {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.menu {
  padding: 14px 0;
  display: grid;
  gap: 6px;
}

.menu-item {
  height: 56px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #dce7ff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 28px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: rgba(47, 137, 255, 0.14);
}

.menu-item.is-active {
  color: #ffffff;
  background: linear-gradient(90deg, #2b8cff 0%, #1f63f0 100%);
}

@media (max-width: 960px) {
  .detection-sidebar {
    width: 100%;
    min-width: 0;
    min-height: auto;
  }

  .menu {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu-item {
    justify-content: center;
    padding: 0 6px;
    transform: none;
    font-size: 12px;
    flex-direction: column;
    gap: 4px;
    height: 68px;
  }

  .brand-text {
    font-size: 20px;
  }
}
</style>
