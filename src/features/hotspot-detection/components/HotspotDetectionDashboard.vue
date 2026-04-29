<template>
  <div class="hotspot-dashboard">
    <input
      ref="videoInputRef"
      class="video-file-input"
      type="file"
      accept="video/mp4,video/avi,video/*"
      @change="handleVideoFileChange"
    />

    <section class="inspection-board" aria-label="热斑检测工作台">
      <div class="video-grid">
        <DetectionVideoPlayer
          v-for="video in videoCards"
          :key="video.id"
          :video="video"
          :media-url="video.id === 'source-video' ? importedVideo?.url : null"
        />
      </div>

      <MetricsRow :metrics="dashboardMetrics" />
    </section>

    <section class="bottom-panel-grid" aria-label="底部控制台">
      <aside class="action-control-card" aria-label="操作控制">
        <header>
          <span aria-hidden="true"></span>
          <h2>操作控制</h2>
        </header>

        <ActionToolbar :actions="actionButtons" :disabled-action-ids="disabledActionIds" @action="handleToolbarAction" />
      </aside>

      <RunLogPreviewPanel
        :logs="runLogs"
        @expand="isRunLogModalOpen = true"
      />
    </section>

    <RunLogDetailModal
      :open="isRunLogModalOpen"
      :logs="runLogs"
      @close="isRunLogModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import ActionToolbar from "@/features/hotspot-detection/components/ActionToolbar.vue";
import DetectionVideoPlayer from "@/features/hotspot-detection/components/DetectionVideoPlayer.vue";
import MetricsRow from "@/features/hotspot-detection/components/MetricsRow.vue";
import RunLogDetailModal from "@/features/hotspot-detection/components/RunLogDetailModal.vue";
import RunLogPreviewPanel from "@/features/hotspot-detection/components/RunLogPreviewPanel.vue";
import {
  actionButtons,
  hotspotMarkers,
  metricCards,
  runLogItems,
  videoCards,
} from "@/features/hotspot-detection/mock/dashboardData";
import type { MetricCard, RunLogItem } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "HotspotDetectionDashboard",
});

type DetectionStatus = "idle" | "imported" | "running" | "paused" | "completed";

interface ImportedVideo {
  name: string;
  url: string;
  resolution: string;
  duration: string;
}

const videoInputRef = ref<HTMLInputElement | null>(null);
const isRunLogModalOpen = ref(false);
const detectionStatus = ref<DetectionStatus>("idle");
const importedVideo = ref<ImportedVideo | null>(null);
const runLogs = ref<RunLogItem[]>([...runLogItems]);
const detectedHotspotPositions = hotspotMarkers.map((marker) => marker.moduleCode);

const activeLog = computed(() => runLogs.value.find((logItem) => logItem.endTime === null));
const disabledActionIds = computed(() => (detectionStatus.value === "running" ? [] : ["stop-detection"]));

const dashboardMetrics = computed<MetricCard[]>(() =>
  metricCards.map((metric) => {
    if (metric.id !== "hotspot-ratio") {
      return metric;
    }

    const progressByStatus: Record<DetectionStatus, string> = {
      idle: "32",
      imported: "32",
      running: "68",
      paused: "68",
      completed: "100",
    };

    return {
      ...metric,
      value: progressByStatus[detectionStatus.value],
    };
  }),
);

const formatDateTime = (date: Date) => {
  const dateParts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ];
  const timeParts = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ];

  return `${dateParts.join("-")} ${timeParts.join(":")}`;
};

const importVideo = () => {
  videoInputRef.value?.click();
};

const startDetection = () => {
  detectionStatus.value = "running";

  if (activeLog.value) {
    return;
  }

  runLogs.value = [
    {
      id: Date.now(),
      taskName: "屋顶 A-03 热斑巡检",
      stationName: "嘉兴一号屋顶光伏电站",
      startTime: formatDateTime(new Date()),
      endTime: null,
      hotspotPositions: null,
      abnormalCount: null,
    },
    ...runLogs.value,
  ];
};

const finishActiveDetectionRecord = () => {
  const runningLog = activeLog.value;

  if (!runningLog) {
    return;
  }

  runningLog.endTime = formatDateTime(new Date());
  runningLog.hotspotPositions = [...detectedHotspotPositions];
  runningLog.abnormalCount = detectedHotspotPositions.length;
};

const stopDetection = () => {
  if (detectionStatus.value !== "running") {
    return;
  }

  detectionStatus.value = "paused";
  finishActiveDetectionRecord();
};

const completeDetection = () => {
  detectionStatus.value = "completed";
  finishActiveDetectionRecord();
};

const handleVideoFileChange = (event: Event) => {
  const inputElement = event.target as HTMLInputElement;
  const file = inputElement.files?.[0];

  if (!file) {
    return;
  }

  if (importedVideo.value) {
    URL.revokeObjectURL(importedVideo.value.url);
  }

  importedVideo.value = {
    name: file.name,
    url: URL.createObjectURL(file),
    resolution: "自动识别",
    duration: "自动识别",
  };
  detectionStatus.value = "imported";
  inputElement.value = "";
};

const handleToolbarAction = (actionId: string) => {
  if (actionId === "import-video") {
    importVideo();
    return;
  }

  if (actionId === "start-detection") {
    startDetection();
    return;
  }

  if (actionId === "stop-detection") {
    stopDetection();
    return;
  }

  if (actionId === "export-report") {
    completeDetection();
  }
};

onBeforeUnmount(() => {
  if (importedVideo.value) {
    URL.revokeObjectURL(importedVideo.value.url);
  }
});
</script>

<style scoped>
.hotspot-dashboard {
  min-width: 0;
  height: 100%;
  min-height: 0;
  margin-top: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 168px;
  gap: 16px;
  overflow: hidden;
}

.video-file-input {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.inspection-board {
  min-width: 0;
  min-height: 0;
  border: 1px solid rgba(224, 232, 243, 0.94);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  padding: 18px 24px 16px;
  box-shadow: 0 12px 28px rgba(45, 73, 110, 0.07);
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 14px;
  overflow: hidden;
}

.video-grid {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 24px;
  overflow: hidden;
}

.video-grid :deep(.video-card) {
  height: 100%;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr);
}

.video-grid :deep(.player-shell) {
  height: 100%;
  align-self: stretch;
  grid-template-rows: minmax(0, 1fr) 36px;
}

.video-grid :deep(.media-frame) {
  height: 100%;
  aspect-ratio: auto;
}

.bottom-panel-grid {
  min-width: 0;
  min-height: 0;
  height: 168px;
  max-height: 180px;
  display: grid;
  grid-template-columns: minmax(360px, 38%) minmax(0, 1fr);
  gap: 22px;
  align-items: stretch;
}

.action-control-card {
  min-width: 0;
  height: 100%;
  min-height: 0;
  border: 1px solid rgba(224, 232, 243, 0.94);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  padding: 16px 18px;
  box-shadow: 0 12px 26px rgba(45, 73, 110, 0.07);
  display: grid;
  grid-template-rows: auto auto;
  align-content: start;
  gap: 12px;
  overflow: hidden;
}

.action-control-card header {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.action-control-card header span {
  width: 4px;
  height: 20px;
  border-radius: 999px;
  background: #177bff;
}

.action-control-card h2 {
  margin: 0;
  color: #101827;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

@media (max-width: 1280px) {
  .video-grid {
    gap: 24px;
  }

  .inspection-board {
    gap: 12px;
  }
}

@media (max-width: 980px) {
  .hotspot-dashboard {
    height: auto;
    grid-template-rows: auto auto;
    overflow: visible;
  }

  .video-grid,
  .bottom-panel-grid {
    grid-template-columns: 1fr;
  }

  .bottom-panel-grid {
    height: auto;
    max-height: none;
  }

  .action-control-card {
    height: auto;
    min-height: 150px;
  }
}

@media (max-width: 640px) {
  .inspection-board {
    padding: 18px;
    gap: 22px;
  }

  .video-grid {
    min-height: 0;
  }
}
</style>
