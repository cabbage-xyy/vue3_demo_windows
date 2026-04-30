<template>
  <div class="hotspot-dashboard">
    <section class="inspection-board" aria-label="热斑检测工作台">
      <div class="video-grid">
        <DetectionVideoPlayer
          v-for="video in videoCards"
          :key="video.id"
          :video="video"
          :media-url="video.id === 'source-video' ? importedVideo?.url : video.id === 'result-video' ? resultVideoUrl : null"
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

        <ActionToolbar
          :actions="actionButtons"
          :disabled-action-ids="disabledActionIds"
          @action="handleToolbarAction"
        />
      </aside>

      <RunLogPreviewPanel
        :logs="runLogs"
        @expand="openRunLogModal()"
        @select="openRunLogModal"
      />
    </section>

    <RunLogDetailModal
      :open="isRunLogModalOpen"
      :logs="modalRunLogs"
      @close="closeRunLogModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { open, save } from "@tauri-apps/plugin-dialog";
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
import type {
  MetricCard,
  RunLogItem,
} from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "HotspotDetectionDashboard",
});

type DetectionStatus = "idle" | "imported" | "running" | "paused" | "completed" | "failed";

interface ImportedVideo {
  name: string;
  path: string;
  url: string;
  resolution: string;
  duration: string;
}

const isRunLogModalOpen = ref(false);
const selectedRunLog = ref<RunLogItem | null>(null);
const detectionStatus = ref<DetectionStatus>("idle");
const importedVideo = ref<ImportedVideo | null>(null);
const inputVideoPath = ref("");
const currentTaskId = ref("");
const detectionProgress = ref(0);
const detectedHotspotCount = ref(0);
const resultVideoPath = ref("");
const resultVideoUrl = ref("");
const pollingTimer = ref<number | null>(null);
const runLogs = ref<RunLogItem[]>([...runLogItems]);
const detectedHotspotPositions = hotspotMarkers.map(
  (marker) => marker.moduleCode,
);

const activeLog = computed(() =>
  runLogs.value.find((logItem) => logItem.endTime === null),
);
const disabledActionIds = computed(() => {
  const disabledIds: string[] = [];

  if (detectionStatus.value !== "running") {
    disabledIds.push("stop-detection");
  }

  if (detectionStatus.value !== "completed") {
    disabledIds.push("export-report");
  }

  return disabledIds;
});
const modalRunLogs = computed(() =>
  selectedRunLog.value ? [selectedRunLog.value] : runLogs.value,
);

const dashboardMetrics = computed<MetricCard[]>(() =>
  metricCards.map((metric) => {
    if (metric.id === "hotspot-count") {
      return {
        ...metric,
        value: String(detectedHotspotCount.value).padStart(2, "0"),
      };
    }

    if (metric.id !== "hotspot-ratio") {
      return metric;
    }

    return {
      ...metric,
      value: String(detectionProgress.value),
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

const buildVideoPreviewUrl = (path: string) => {
  return `http://127.0.0.1:8000/media/video?path=${encodeURIComponent(path)}`;
};

const importVideo = async () => {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Video",
        extensions: ["mp4", "mov", "avi", "mkv"],
      },
    ],
  });

  if (!selected || Array.isArray(selected)) {
    return;
  }

  inputVideoPath.value = selected;

  currentTaskId.value = "";
  detectionProgress.value = 0;
  detectedHotspotCount.value = 0;
  resultVideoPath.value = "";
  resultVideoUrl.value = "";

  importedVideo.value = {
    name: selected.split("/").pop() || "已导入视频",
    path: selected,
    url: buildVideoPreviewUrl(selected),
    resolution: "自动识别",
    duration: "自动识别",
  };

  detectionStatus.value = "imported";
  console.log("导入视频路径：", inputVideoPath.value);
};

const openRunLogModal = (record?: RunLogItem) => {
  selectedRunLog.value = record ?? null;
  isRunLogModalOpen.value = true;
};

const closeRunLogModal = () => {
  selectedRunLog.value = null;
  isRunLogModalOpen.value = false;
};

const stopPollingDetectionStatus = () => {
  if (pollingTimer.value !== null) {
    window.clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
};

const pollDetectionStatus = (taskId: string) => {
  stopPollingDetectionStatus();

  pollingTimer.value = window.setInterval(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/detect/status/${taskId}`);
      const data = await res.json();
      console.log("检测状态返回：", data);

      if (typeof data.progress === "number") {
        detectionProgress.value = data.progress;
      }

      if (typeof data.hotspot_count === "number") {
        detectedHotspotCount.value = data.hotspot_count;
      }

      if (data.result_video_path) {
        resultVideoPath.value = data.result_video_path;
      }

      if (data.status === "completed") {
        detectionStatus.value = "completed";
        detectionProgress.value = 100;

        if (resultVideoPath.value) {
          resultVideoUrl.value = buildVideoPreviewUrl(resultVideoPath.value);
        }

        stopPollingDetectionStatus();
        finishActiveDetectionRecord();
        return;
      }

      if (data.status === "stopped") {
        detectionStatus.value = "paused";
        stopPollingDetectionStatus();
        finishActiveDetectionRecord();
        return;
      }

      if (data.status === "failed") {
        detectionStatus.value = "failed";
        stopPollingDetectionStatus();
        console.error("检测失败：", data.error || data.result_video_path || data.message);
      }
    } catch (error) {
      console.error("查询检测状态失败：", error);
    }
  }, 1000);
};

const startDetection = async () => {
  detectionStatus.value = "running";
  detectionProgress.value = 0;
  detectedHotspotCount.value = 0;
  resultVideoPath.value = "";
  resultVideoUrl.value = "";

  if (!inputVideoPath.value) {
    console.warn("请先导入视频");
    detectionStatus.value = "idle";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/detect/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_path: inputVideoPath.value,
      }),
    });

    const data = await res.json();
    console.log("检测接口返回：", data);

    if (data.task_id) {
      currentTaskId.value = data.task_id;
      pollDetectionStatus(data.task_id);
    }
  } catch (error) {
    console.error("检测接口调用失败：", error);
    detectionStatus.value = "idle";
    return;
  }

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

const stopDetection = async () => {
  if (detectionStatus.value !== "running") {
    return;
  }

  if (!currentTaskId.value) {
    console.warn("没有正在运行的检测任务ID，无法停止后端检测");
    detectionStatus.value = "paused";
    stopPollingDetectionStatus();
    finishActiveDetectionRecord();
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/detect/stop/${currentTaskId.value}`, {
      method: "POST",
    });

    const data = await res.json();
    console.log("停止检测接口返回：", data);

    detectionStatus.value = "paused";
  } catch (error) {
    console.error("停止检测接口调用失败：", error);
  }
};

const exportLatestReport = async () => {
  try {
    const latestReportResponse = await fetch("http://127.0.0.1:8000/report/latest");

    if (!latestReportResponse.ok) {
      console.error("导出报告失败：", latestReportResponse.status, latestReportResponse.statusText);
      return;
    }

    const contentDisposition = latestReportResponse.headers.get("Content-Disposition") ?? "";
    const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const filename = decodeURIComponent(filenameMatch?.[1] ?? filenameMatch?.[2] ?? "热斑检测报告.docx");
    const extension = filename.toLowerCase().endsWith(".doc") ? "doc" : "docx";

    const savePath = await save({
      defaultPath: filename,
      filters: [
        {
          name: "Word Report",
          extensions: [extension],
        },
      ],
    });

    if (!savePath) {
      console.log("用户取消导出报告");
      return;
    }

    const exportResponse = await fetch("http://127.0.0.1:8000/report/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        save_path: savePath,
      }),
    });

    const exportResult = await exportResponse.json();

    if (!exportResponse.ok || !exportResult.success) {
      console.error("保存报告失败：", exportResult);
      return;
    }

    console.log("报告已导出到：", exportResult.save_path);
  } catch (error) {
    console.error("导出报告接口调用失败：", error);
  }
};

const completeDetection = () => {
  detectionStatus.value = "completed";
  detectionProgress.value = 100;
  stopPollingDetectionStatus();
  finishActiveDetectionRecord();
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
    void stopDetection();
    return;
  }

  if (actionId === "export-report") {
    if (detectionStatus.value !== "completed") {
      console.warn("检测尚未完成，不能导出报告");
      return;
    }

    void exportLatestReport();
    return;
  }
};

onBeforeUnmount(() => {
  stopPollingDetectionStatus();
  importedVideo.value = null;
  resultVideoUrl.value = "";
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
