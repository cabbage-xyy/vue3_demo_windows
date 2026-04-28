<template>
  <section class="run-log-panel" aria-label="运行日志">
    <header>
      <div class="panel-title">
        <span>Task feed</span>
        <strong>最近检测流</strong>
      </div>
      <div class="panel-tools">
        <span class="run-state">{{ hasActiveLog ? "检测中" : "等待检测" }}</span>
        <button type="button" class="expand-button" @click="emit('expand')">
          <BaseIcon name="maximize" :size="14" />
          <span>展开</span>
        </button>
      </div>
    </header>

    <div class="feed-list" aria-label="最近检测记录">
      <article
        v-for="logItem in logs.slice(0, 4)"
        :key="logItem.id"
        class="feed-item"
        :class="{ 'is-selected': logItem.taskName === selectedTaskName }"
      >
        <span class="feed-dot" :class="statusClass(logItem.hasHotspot)"></span>
        <strong>{{ logItem.taskName }}</strong>
        <span>{{ formatTime(logItem.startTime) }}</span>
        <span>{{ logItem.endTime ? "检测完成" : "检测中" }}</span>
        <em :class="statusClass(logItem.hasHotspot)">{{ feedResult(logItem) }}</em>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { RunLogItem } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "RunLogPreviewPanel",
});

interface RunLogPreviewPanelProps {
  logs: RunLogItem[];
  hasActiveLog: boolean;
  selectedTaskName?: string;
}

defineProps<RunLogPreviewPanelProps>();

const emit = defineEmits<{
  expand: [];
}>();

const formatTime = (dateTime: string) => dateTime.slice(11, 16);

const feedResult = (logItem: RunLogItem) => {
  if (logItem.hasHotspot === null) {
    return "待确认";
  }

  return logItem.hasHotspot ? `异常 ${logItem.abnormalCount}` : "正常";
};

const statusClass = (hasHotspot: boolean | null) => {
  if (hasHotspot === null) {
    return "pending";
  }

  return hasHotspot ? "danger" : "normal";
};
</script>

<style scoped>
.run-log-panel {
  min-height: 0;
  border: 1px solid rgba(218, 228, 242, 0.64);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.56);
  padding: 8px 12px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 6px;
  box-shadow: 0 16px 36px rgba(50, 71, 101, 0.1);
  overflow: hidden;
  backdrop-filter: blur(14px);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-title {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.panel-title span {
  color: #7d8da5;
  font-size: 12px;
  font-weight: 800;
}

.panel-title strong {
  color: #142039;
  font-size: 13px;
  white-space: nowrap;
}

.panel-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.run-state,
.expand-button {
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.run-state {
  min-width: 64px;
  background: #eef5ff;
  color: #245fce;
  padding: 0 12px;
}

.expand-button {
  border: 1px solid rgba(194, 213, 244, 0.95);
  background: #ffffff;
  color: #2d65ce;
  gap: 7px;
  padding: 0 10px;
  cursor: pointer;
}

.feed-list {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 7px;
  overflow-y: auto;
  scrollbar-width: none;
}

.feed-list::-webkit-scrollbar {
  display: none;
}

.feed-item {
  min-width: 0;
  min-height: 32px;
  display: grid;
  grid-template-columns: auto minmax(170px, 1fr) auto auto auto;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid rgba(224, 232, 243, 0.72);
  background: transparent;
  color: #2b3850;
  padding: 4px 2px;
  font-size: 12px;
  font-weight: 800;
}

.feed-item.is-selected {
  background: transparent;
  box-shadow: none;
}

.feed-item:last-child {
  border-bottom: 0;
}

.feed-item strong,
.feed-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feed-item span {
  color: #7d8da5;
}

.feed-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #b9c8da;
}

.feed-item em {
  min-width: 54px;
  border-radius: 999px;
  padding: 4px 9px;
  text-align: center;
  font-style: normal;
}

.feed-dot.danger {
  background: #ff5b6e;
}

.feed-dot.normal {
  background: #29be80;
}

.feed-dot.pending {
  background: #f7a928;
}

.feed-item em.danger {
  color: #d72d45;
  background: rgba(255, 91, 110, 0.12);
}

.feed-item em.normal {
  color: #16835f;
  background: rgba(41, 190, 128, 0.12);
}

.feed-item em.pending {
  color: #9a6a12;
  background: rgba(247, 169, 40, 0.14);
}
</style>
