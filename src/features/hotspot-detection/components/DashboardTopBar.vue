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

      <button type="button" class="state-button">
        <BaseIcon name="progress" :size="16" />
        <span>进度</span>
        <span class="progress-value">
          <BaseIcon name="crown" :size="14" />
          {{ progressText }}
        </span>
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
  progressText: string;
}

defineProps<DashboardTopBarProps>();
</script>

<style scoped>
.topbar {
  height: 76px;
  padding: 0 22px;
  border-bottom: 1px solid #e4e9f2;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  overflow-x: auto;
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label {
  position: relative;
  padding-left: 14px;
  font-weight: 600;
  color: #1a2538;
  white-space: nowrap;
}

.section-label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 16px;
  border-radius: 2px;
  transform: translateY(-50%);
  background: #2b82ff;
}

.filter-button,
.state-button {
  height: 40px;
  border: 1px solid #dbe4f0;
  border-radius: 8px;
  background: #ffffff;
  color: #27364f;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 14px;
  white-space: nowrap;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid #d3deef;
  background: #f4f7fd;
}

.progress-value {
  color: #1d2a3e;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

@media (max-width: 1200px) {
  .topbar {
    height: auto;
    padding: 12px 16px;
    flex-wrap: wrap;
  }
}
</style>
