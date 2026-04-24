<template>
  <header class="topbar">
    <div class="left">
      <span class="section-label">热斑检测</span>

      <button v-for="filter in filters" :key="filter.id" type="button" class="filter-button">
        <span class="dot"></span>
        <span>{{ filter.value }}</span>
        <BaseIcon name="chevron-down" :size="16" />
      </button>
    </div>

    <div class="right">
      <button type="button" class="state-button">
        <span>{{ statusText }}</span>
        <BaseIcon name="chevron-down" :size="16" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { HeaderFilter } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "DashboardTopBar",
});

interface DashboardTopBarProps {
  filters: HeaderFilter[];
  statusText: string;
}

defineProps<DashboardTopBarProps>();
</script>

<style scoped>
.topbar {
  position: relative;
  z-index: 30;
  min-height: 50px;
  padding: 7px 12px;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  overflow: visible;
  box-shadow: 0 14px 34px rgba(50, 71, 101, 0.07);
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right {
  position: relative;
}

.section-label {
  position: relative;
  padding-left: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #1a2538;
  white-space: nowrap;
}

.section-label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  transform: translateY(-50%);
  background: #2b82ff;
}

.filter-button,
.state-button {
  height: 30px;
  border: 1px solid rgba(219, 228, 240, 0.92);
  border-radius: 999px;
  background: rgba(248, 251, 255, 0.86);
  color: #27364f;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  font-size: 13px;
  white-space: nowrap;
}

.state-button {
  cursor: pointer;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 1px solid #d3deef;
  background: #f4f7fd;
}

@media (max-width: 1200px) {
  .topbar {
    height: auto;
    padding: 8px 12px;
    flex-wrap: wrap;
  }
}
</style>
