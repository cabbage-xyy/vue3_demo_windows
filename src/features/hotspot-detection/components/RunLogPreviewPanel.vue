<template>
  <section class="run-log-panel" aria-label="检测记录">
    <header>
      <div class="panel-title">
        <span aria-hidden="true"></span>
        <h2>检测记录</h2>
      </div>
      <button
        type="button"
        class="panel-more"
        aria-label="展开检测记录详情"
        @click="emit('expand')"
      >
        <BaseIcon name="more-horizontal" :size="24" :stroke-width="2.8" />
      </button>
    </header>

    <div v-if="props.logs.length > 0" class="record-copy">
      <article v-for="record in props.logs" :key="record.id" class="record-row">
        <strong class="station-name">{{ record.stationName }}</strong>
        <time>{{ record.endTime ?? "检测中" }}</time>
        <span class="abnormal-result">
          <span class="abnormal-badge">异常</span>
          <strong>{{ formatAbnormalCount(record.abnormalCount) }}</strong>
        </span>
      </article>
    </div>

    <div v-else class="record-empty">
      等待检测任务启动
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
}

const props = defineProps<RunLogPreviewPanelProps>();

const emit = defineEmits<{
  expand: [];
}>();

const formatAbnormalCount = (count: number | null) => {
  if (count === null) {
    return "--";
  }

  return count.toString().padStart(2, "0");
};
</script>

<style scoped>
.run-log-panel {
  min-width: 0;
  height: 100%;
  min-height: 0;
  border: 1px solid rgba(224, 232, 243, 0.94);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  padding: 14px 18px 12px;
  box-shadow: 0 12px 26px rgba(45, 73, 110, 0.07);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 7px;
  overflow: hidden;
}

header,
.panel-title {
  min-width: 0;
  display: flex;
  align-items: center;
}

header {
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  gap: 14px;
}

.panel-title span {
  width: 4px;
  height: 20px;
  border-radius: 999px;
  background: #177bff;
}

.panel-title h2 {
  margin: 0;
  color: #101827;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

.panel-more {
  width: 50px;
  height: 26px;
  border: 1px solid rgba(36, 134, 255, 0.52);
  border-radius: 10px;
  background: #ffffff;
  color: #1578f7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.record-copy {
  min-width: 0;
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 10px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-color: rgba(148, 163, 184, 0.75) transparent;
}

.record-row {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(148px, 0.82fr) minmax(96px, auto);
  align-items: center;
  gap: 16px;
  min-height: 48px;
  border-bottom: 1px solid rgba(224, 232, 243, 0.92);
}

.record-row:last-child {
  border-bottom: 0;
}

.record-empty {
  margin: 0;
  color: #162033;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.station-name,
time,
.abnormal-result {
  min-width: 0;
  font-weight: 800;
  line-height: 1.2;
}

.station-name {
  color: #101827;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

time {
  color: #162033;
  font-size: 14px;
  white-space: nowrap;
}

.abnormal-result {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.abnormal-badge {
  border: 1px solid #f47a18;
  border-radius: 999px;
  color: #f47a18;
  background: rgba(255, 247, 237, 0.92);
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
}

.abnormal-result strong {
  color: #f47a18;
  font-size: 22px;
  line-height: 1;
}

.record-empty {
  display: flex;
  align-items: center;
}

@media (max-width: 760px) {
  .run-log-panel {
    height: auto;
    min-height: 150px;
    padding: 20px;
  }

  .record-row {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 8px;
    padding: 8px 0;
  }

  .abnormal-result {
    justify-content: flex-start;
  }
}
</style>
