<template>
  <div class="dashboard-main">
    <DashboardTopBar
      :filters="headerFilters"
      :status-text="detectionStatusText"
    />

    <div class="dashboard-content">
      <section class="content-block">
        <VideoComparisonPanel :videos="videoCards" />
        <div class="control-deck">
          <MetricsRow :metrics="metricCards" />
          <ActionToolbar :actions="actionButtons" @action="handleToolbarAction" />
        </div>

        <section class="run-log-panel" aria-label="运行日志">
          <header class="run-log-header">
            <div class="run-log-title">
              <span>运行日志</span>
              <strong>热斑检测记录</strong>
            </div>
            <div class="run-log-tools">
              <span class="run-log-state">{{ activeLog ? "检测中" : "等待检测" }}</span>
              <button
                type="button"
                class="expand-log-button"
                title="查看全部运行日志"
                aria-label="查看全部运行日志"
                @click="isRunLogModalOpen = true"
              >
                <BaseIcon name="maximize" :size="14" />
                <span>展开</span>
              </button>
            </div>
          </header>

          <div class="run-log-table" role="table" aria-label="热斑检测运行日志">
            <div class="run-log-row run-log-row-head" role="row">
              <span role="columnheader">任务</span>
              <span role="columnheader">开始时间</span>
              <span role="columnheader">结束时间</span>
              <span role="columnheader">是否出现热斑</span>
            </div>
            <div class="run-log-body">
              <div
                v-for="logItem in runLogs"
                :key="logItem.id"
                class="run-log-row"
                role="row"
              >
                <span role="cell">{{ logItem.taskName }}</span>
                <span role="cell">{{ logItem.startTime }}</span>
                <span role="cell">{{ logItem.endTime ?? "检测中" }}</span>
                <span role="cell">
                  <strong
                    class="hotspot-status"
                    :class="logItem.hasHotspot === null ? 'pending' : logItem.hasHotspot ? 'danger' : 'normal'"
                  >
                    {{ formatHotspotStatus(logItem.hasHotspot) }}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="isRunLogModalOpen" class="run-log-modal-backdrop" @click.self="isRunLogModalOpen = false">
        <section class="run-log-modal" aria-label="运行日志详情">
          <header class="run-log-modal-header">
            <div>
              <span>运行日志</span>
              <strong>热斑检测记录</strong>
            </div>
            <button type="button" class="modal-close-button" aria-label="关闭运行日志" @click="isRunLogModalOpen = false">
              <BaseIcon name="x" :size="16" />
            </button>
          </header>

          <div class="run-log-modal-table" role="table" aria-label="热斑检测完整运行日志">
            <div class="run-log-row run-log-row-head" role="row">
              <span role="columnheader">任务</span>
              <span role="columnheader">开始时间</span>
              <span role="columnheader">结束时间</span>
              <span role="columnheader">是否出现热斑</span>
            </div>
            <div class="run-log-modal-body">
              <div
                v-for="logItem in runLogs"
                :key="`modal-${logItem.id}`"
                class="run-log-row"
                role="row"
              >
                <span role="cell">{{ logItem.taskName }}</span>
                <span role="cell">{{ logItem.startTime }}</span>
                <span role="cell">{{ logItem.endTime ?? "检测中" }}</span>
                <span role="cell">
                  <strong
                    class="hotspot-status"
                    :class="logItem.hasHotspot === null ? 'pending' : logItem.hasHotspot ? 'danger' : 'normal'"
                  >
                    {{ formatHotspotStatus(logItem.hasHotspot) }}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import ActionToolbar from "@/features/hotspot-detection/components/ActionToolbar.vue";
import DashboardTopBar from "@/features/hotspot-detection/components/DashboardTopBar.vue";
import MetricsRow from "@/features/hotspot-detection/components/MetricsRow.vue";
import VideoComparisonPanel from "@/features/hotspot-detection/components/VideoComparisonPanel.vue";
import {
  actionButtons,
  detectionStatusText,
  headerFilters,
  metricCards,
  videoCards,
} from "@/features/hotspot-detection/mock/dashboardData";

defineOptions({
  name: "HotspotDetectionDashboard",
});

interface RunLogItem {
  id: number;
  taskName: string;
  startTime: string;
  endTime: string | null;
  hasHotspot: boolean | null;
}

const currentTaskName = "屋顶 A-03 热斑巡检";
const isRunLogModalOpen = ref(false);

const runLogs = ref<RunLogItem[]>([
  {
    id: 1,
    taskName: currentTaskName,
    startTime: "2026-04-25 09:12:08",
    endTime: "2026-04-25 09:14:02",
    hasHotspot: true,
  },
  {
    id: 2,
    taskName: "屋顶 A-02 热斑巡检",
    startTime: "2026-04-25 08:46:31",
    endTime: "2026-04-25 08:48:10",
    hasHotspot: false,
  },
]);

const activeLog = computed(() => runLogs.value.find((logItem) => logItem.endTime === null));

const formatDateTime = (date: Date) => {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ];
  const timeParts = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ];

  return `${parts.join("-")} ${timeParts.join(":")}`;
};

const hasHotspotResult = () => {
  const abnormalMetric = metricCards.find((metric) => metric.id === "abnormal-module");
  const abnormalCount = Number.parseInt(abnormalMetric?.value ?? "0", 10);

  return abnormalCount > 0;
};

const formatHotspotStatus = (hasHotspot: boolean | null) => {
  if (hasHotspot === null) {
    return "待确认";
  }

  return hasHotspot ? "是" : "否";
};

const startDetection = () => {
  if (activeLog.value) {
    return;
  }

  runLogs.value = [
    {
      id: Date.now(),
      taskName: currentTaskName,
      startTime: formatDateTime(new Date()),
      endTime: null,
      hasHotspot: null,
    },
    ...runLogs.value,
  ];
};

const stopDetection = () => {
  const runningLog = activeLog.value;

  if (!runningLog) {
    return;
  }

  runningLog.endTime = formatDateTime(new Date());
  runningLog.hasHotspot = hasHotspotResult();
};

const handleToolbarAction = (actionId: string) => {
  if (actionId === "start-detection") {
    startDetection();
    return;
  }

  if (actionId === "stop-detection") {
    stopDetection();
  }
};
</script>

<style scoped>
.dashboard-main {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.dashboard-content {
  min-height: 0;
  flex: 1;
  display: grid;
}

.content-block {
  min-height: 0;
  height: 100%;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  padding: 10px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto minmax(148px, 158px);
  gap: 10px;
  box-shadow: 0 18px 42px rgba(50, 71, 101, 0.08);
  overflow: hidden;
}

.control-deck {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 14px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(246, 250, 255, 0.86)),
    #ffffff;
  padding: 8px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 12px 24px rgba(50, 71, 101, 0.06);
}

.run-log-panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgba(218, 228, 242, 0.92);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.88)),
    #ffffff;
  padding: 8px 14px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 6px;
  box-shadow: 0 12px 26px rgba(50, 71, 101, 0.06);
}

.run-log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.run-log-title {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.run-log-header span {
  color: #7d8da5;
  font-size: 12px;
  font-weight: 700;
}

.run-log-header strong {
  min-width: 0;
  color: #142039;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.run-log-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.run-log-state {
  min-width: 64px;
  height: 26px;
  border-radius: 999px;
  background: rgba(238, 245, 255, 0.92);
  color: #245fce;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.expand-log-button {
  height: 26px;
  border: 1px solid rgba(194, 213, 244, 0.95);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.76);
  color: #2d65ce;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.expand-log-button:hover {
  border-color: rgba(83, 143, 242, 0.82);
  background: #f4f8ff;
  color: #1f5fd0;
}

.run-log-table {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  align-content: start;
  gap: 4px;
  padding-right: 2px;
  overflow: hidden;
}

.run-log-body {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 4px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 2px;
  scrollbar-width: none;
}

.run-log-body::-webkit-scrollbar {
  display: none;
}

.run-log-row {
  min-width: 0;
  min-height: 32px;
  display: grid;
  grid-template-columns: minmax(150px, 1.2fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(120px, 0.7fr);
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  background: #f7faff;
  padding: 5px 10px;
  color: #2b3850;
  font-size: 12px;
  font-weight: 700;
}

.run-log-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.run-log-row-head {
  min-height: 28px;
  background: #f7faff;
  color: #7d8da5;
}

.hotspot-status {
  width: fit-content;
  min-width: 44px;
  display: inline-flex;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
}

.hotspot-status.danger {
  color: #d72d45;
  background: rgba(255, 91, 110, 0.12);
}

.hotspot-status.danger::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  margin: 4px 6px 0 0;
  background: #ff5b6e;
}

.hotspot-status.normal {
  color: #16835f;
  background: rgba(41, 190, 128, 0.12);
}

.hotspot-status.pending {
  color: #9a6a12;
  background: rgba(247, 169, 40, 0.14);
}

.run-log-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(17, 27, 43, 0.28);
  display: grid;
  place-items: center;
  padding: 28px;
}

.run-log-modal {
  width: min(1120px, calc(100vw - 64px));
  height: min(640px, calc(100vh - 96px));
  min-height: 0;
  border: 1px solid rgba(216, 226, 241, 0.96);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 255, 0.94)),
    #ffffff;
  box-shadow: 0 26px 72px rgba(26, 43, 70, 0.24);
  padding: 16px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
}

.run-log-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.run-log-modal-header div {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.run-log-modal-header span {
  color: #7d8da5;
  font-size: 13px;
  font-weight: 800;
}

.run-log-modal-header strong {
  color: #142039;
  font-size: 18px;
}

.modal-close-button {
  width: 34px;
  height: 34px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #ffffff;
  color: #52647f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.run-log-modal-table {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
  overflow: hidden;
}

.run-log-modal-body {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.run-log-modal-table .run-log-row {
  min-height: 46px;
  padding: 9px 12px;
  font-size: 13px;
}

@media (max-width: 960px) {
  .dashboard-content {
    gap: 8px;
  }

  .content-block {
    padding: 10px;
    grid-template-rows: minmax(0, 1fr) auto minmax(148px, 158px);
  }

  .control-deck {
    grid-template-columns: 1fr;
  }

  .run-log-row {
    grid-template-columns: minmax(130px, 1fr) minmax(138px, 1fr) minmax(138px, 1fr) minmax(112px, 0.7fr);
  }

  .run-log-table {
    overflow-x: auto;
  }

  .run-log-modal-backdrop {
    padding: 16px;
  }

  .run-log-modal {
    width: calc(100vw - 32px);
    height: calc(100vh - 64px);
  }
}
</style>
