<template>
  <!-- 旧版任务顶部条组件：保留为可复用展示件，当前主布局使用 AppMainLayout 顶栏。 -->
  <header class="task-strip">
    <div class="task-title">
      <span>热斑检测</span>
      <strong>当前任务：屋顶 A-03</strong>
    </div>

    <div class="task-tags" aria-label="当前检测任务信息">
      <button type="button">
        <span>电站</span>
        SUNREN 光伏站
      </button>
      <button type="button">
        <span>视频源</span>
        无人机巡检视频
      </button>
      <button type="button">
        <span>模式</span>
        可见光 + 红外融合
      </button>
      <button type="button" class="status-chip">
        <span>状态</span>
        {{ statusText }}
        <BaseIcon name="chevron-down" :size="14" />
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

// 顶部条仅展示父级传入的筛选和状态文案，不自己持久化状态。
interface DashboardTopBarProps {
  filters: HeaderFilter[];
  statusText: string;
}

defineProps<DashboardTopBarProps>();
</script>

<style scoped>
.task-strip {
  position: relative;
  z-index: 30;
  min-height: 48px;
  padding: 8px 12px;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 251, 255, 0.82)),
    #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  box-shadow: 0 12px 28px rgba(50, 71, 101, 0.06);
}

.task-title {
  min-width: 210px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.task-title span {
  position: relative;
  padding-left: 12px;
  color: #71829b;
  font-size: 12px;
  font-weight: 900;
}

.task-title span::before {
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

.task-title strong {
  color: #1a2538;
  font-size: 14px;
  white-space: nowrap;
}

.task-tags {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.task-tags button {
  height: 30px;
  border: 1px solid rgba(219, 228, 240, 0.92);
  border-radius: 999px;
  background: rgba(248, 251, 255, 0.72);
  color: #27364f;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

.task-tags button span {
  color: #7d8da5;
}

@media (max-width: 1200px) {
  .task-strip {
    height: auto;
    flex-wrap: wrap;
  }

  .task-tags {
    justify-content: flex-start;
  }
}
</style>
