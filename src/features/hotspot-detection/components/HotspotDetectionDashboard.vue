<template>
  <div class="hotspot-dashboard">
    <DashboardTopBar :filters="headerFilters" :status-text="statusDisplayText" />

    <section class="diagnosis-stage" aria-label="光伏热斑智能诊断工作台">
      <div class="diagnosis-surface">
        <div class="diagnosis-core">
          <EmbeddedAiAssistantPanel class="assistant-zone" :messages="aiAssistantMessages" />

          <PhotovoltaicTwinScene
            class="twin-zone"
            :markers="hotspotMarkers"
            :selected-component="selectedComponent"
            :detection-status="detectionStatus"
            :animation-run-id="animationRunId"
            @select-component="selectedComponent = $event"
            @detection-complete="completeDetection"
          />

          <aside class="diagnosis-zone" aria-label="诊断结果信息">
            <div class="diagnosis-summary">
              <span>诊断结果</span>
              <strong>智能定位结果</strong>
            </div>
            <dl>
              <div>
                <dt>主异常组件</dt>
                <dd>{{ selectedDiagnostic.moduleCode }}</dd>
              </div>
              <div>
                <dt>风险等级</dt>
                <dd :class="selectedDiagnostic.riskClass">{{ selectedDiagnostic.riskLevel }}</dd>
              </div>
              <div>
                <dt>温差</dt>
                <dd>{{ selectedDiagnostic.temperatureDelta }}</dd>
              </div>
              <div>
                <dt>AI 置信度</dt>
                <dd>94%</dd>
              </div>
              <div>
                <dt>异常组件</dt>
                <dd>2</dd>
              </div>
            </dl>
          </aside>

          <footer class="canvas-footer">
            <div class="bottomControlPanel">
              <section class="actionPanel" aria-label="操作控制">
                <input
                  ref="videoInputRef"
                  class="video-file-input"
                  type="file"
                  accept="video/mp4,video/avi,video/*"
                  @change="handleVideoFileChange"
                />
                <ActionToolbar
                  :actions="actionButtons"
                  :disabled-action-ids="disabledActionIds"
                  @action="handleToolbarAction"
                />
              </section>

              <section class="sourceVideoPanel" aria-label="原始视频预览">
                <template v-if="importedVideo">
                  <video
                    class="source-video"
                    :src="importedVideo.url"
                    muted
                    playsinline
                    preload="metadata"
                    @loadedmetadata="handlePreviewMetadata"
                  ></video>
                  <span class="source-frame-badge">定位帧 00:37</span>
                </template>
                <template v-else>
                  <div class="source-empty-state">
                    <span>原始视频源</span>
                    <div class="source-placeholder-frame" aria-hidden="true"></div>
                    <strong>未导入无人机巡检视频</strong>
                    <p>当前定位帧 00:37 · 支持 MP4 / AVI，点击左侧“导入视频”开始</p>
                  </div>
                </template>
              </section>
            </div>

            <RunLogPreviewPanel
              class="feed-strip"
              :logs="runLogs"
              :has-active-log="Boolean(activeLog)"
              :selected-task-name="currentTaskName"
              @expand="isRunLogModalOpen = true"
            />
          </footer>
        </div>
      </div>
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
import DashboardTopBar from "@/features/hotspot-detection/components/DashboardTopBar.vue";
import EmbeddedAiAssistantPanel from "@/features/hotspot-detection/components/EmbeddedAiAssistantPanel.vue";
import PhotovoltaicTwinScene from "@/features/hotspot-detection/components/PhotovoltaicTwinScene.vue";
import RunLogDetailModal from "@/features/hotspot-detection/components/RunLogDetailModal.vue";
import RunLogPreviewPanel from "@/features/hotspot-detection/components/RunLogPreviewPanel.vue";
import {
  actionButtons,
  aiAssistantMessages,
  headerFilters,
  hotspotMarkers,
  metricCards,
  runLogItems,
} from "@/features/hotspot-detection/mock/dashboardData";
import type { RunLogItem } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "HotspotDetectionDashboard",
});

const currentTaskName = "屋顶 A-03 热斑巡检";
const isRunLogModalOpen = ref(false);
const runLogs = ref<RunLogItem[]>([...runLogItems]);
const videoInputRef = ref<HTMLInputElement | null>(null);
const selectedComponent = ref("A-03-18");
const detectionStatus = ref<"idle" | "imported" | "running" | "paused" | "completed">("idle");
const animationRunId = ref(0);

interface ImportedVideo {
  name: string;
  url: string;
  resolution: string;
  duration: string;
  status: string;
}

const importedVideo = ref<ImportedVideo | null>(null);

const activeLog = computed(() => runLogs.value.find((logItem) => logItem.endTime === null));
const statusDisplayText = computed(() => {
  const statusTextMap = {
    idle: "未开始",
    imported: "待检测",
    running: "检测中",
    paused: "已暂停",
    completed: "检测完成",
  };

  return statusTextMap[detectionStatus.value];
});
const disabledActionIds = computed(() => {
  const disabledIds: string[] = [];

  if (detectionStatus.value === "idle") {
    disabledIds.push("start-detection");
  }

  if (detectionStatus.value !== "running") {
    disabledIds.push("stop-detection");
  }

  if (detectionStatus.value !== "completed") {
    disabledIds.push("export-report");
  }

  return disabledIds;
});
const fallbackHotspotMarker = hotspotMarkers[0]!;
const selectedMarker = computed(
  () => hotspotMarkers.find((marker) => marker.moduleCode === selectedComponent.value) ?? fallbackHotspotMarker,
);
const selectedDiagnostic = computed(() => ({
  moduleCode: selectedMarker.value.moduleCode,
  riskLevel: selectedMarker.value.severity === "high" ? "高风险" : "疑似",
  riskClass: selectedMarker.value.severity === "high" ? "danger" : "warning",
  temperatureDelta: selectedMarker.value.temperatureDelta,
}));

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

const hasHotspotResult = () => {
  const abnormalMetric = metricCards.find((metric) => metric.id === "abnormal-module");
  const abnormalCount = Number.parseInt(abnormalMetric?.value ?? "0", 10);

  return abnormalCount > 0;
};

const startDetection = () => {
  if (detectionStatus.value === "running") {
    return;
  }

  detectionStatus.value = "running";
  animationRunId.value += 1;

  if (importedVideo.value) {
    importedVideo.value = {
      ...importedVideo.value,
      status: "检测中",
    };
  }

  if (!activeLog.value) {
    runLogs.value = [
      {
        id: Date.now(),
        taskName: currentTaskName,
        startTime: formatDateTime(new Date()),
        endTime: null,
        hasHotspot: null,
        abnormalCount: 0,
      },
      ...runLogs.value,
    ];
  }
};

const stopDetection = () => {
  const runningLog = activeLog.value;

  detectionStatus.value = "paused";

  if (!runningLog) {
    return;
  }

  runningLog.endTime = formatDateTime(new Date());
  runningLog.hasHotspot = hasHotspotResult();
  runningLog.abnormalCount = runningLog.hasHotspot ? 2 : 0;

  if (importedVideo.value) {
    importedVideo.value = {
      ...importedVideo.value,
      status: "已暂停",
    };
  }
};

const completeDetection = () => {
  detectionStatus.value = "completed";
  const runningLog = activeLog.value;

  if (runningLog) {
    runningLog.endTime = formatDateTime(new Date());
    runningLog.hasHotspot = hasHotspotResult();
    runningLog.abnormalCount = runningLog.hasHotspot ? 2 : 0;
  }

  if (importedVideo.value) {
    importedVideo.value = {
      ...importedVideo.value,
      status: "检测完成",
    };
  }
};

const formatDuration = (duration: number) => {
  if (!Number.isFinite(duration) || duration <= 0) {
    return "时长待识别";
  }

  const minutes = Math.floor(duration / 60);
  const seconds = Math.round(duration % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const importVideo = () => {
  videoInputRef.value?.click();
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
    resolution: "分辨率识别中",
    duration: "时长识别中",
    status: "已导入",
  };
  detectionStatus.value = "imported";
  inputElement.value = "";
};

const handlePreviewMetadata = (event: Event) => {
  if (!importedVideo.value) {
    return;
  }

  const videoElement = event.target as HTMLVideoElement;
  importedVideo.value = {
    ...importedVideo.value,
    resolution:
      videoElement.videoWidth > 0 && videoElement.videoHeight > 0
        ? `${videoElement.videoWidth} × ${videoElement.videoHeight}`
        : "分辨率待识别",
    duration: formatDuration(videoElement.duration),
  };
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
    detectionStatus.value = detectionStatus.value === "idle" ? "idle" : detectionStatus.value;
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
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  overflow: hidden;
}

.diagnosis-stage {
  min-height: 0;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 22px;
  background:
    radial-gradient(circle at 72% 18%, rgba(73, 151, 255, 0.1), transparent 34%),
    radial-gradient(circle at 18% 82%, rgba(45, 190, 210, 0.08), transparent 30%),
    #f8fbff;
  box-shadow: 0 20px 54px rgba(50, 71, 101, 0.1);
  overflow: hidden;
}

.diagnosis-surface {
  position: relative;
  height: 100%;
  min-height: 0;
  padding: 0;
  box-sizing: border-box;
  background:
    linear-gradient(rgba(63, 118, 183, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(63, 118, 183, 0.035) 1px, transparent 1px);
  background-size: 32px 32px;
  overflow: hidden;
}

.diagnosis-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 60% 18%, rgba(51, 137, 255, 0.08), transparent 28%),
    radial-gradient(circle at 30% 82%, rgba(40, 190, 210, 0.06), transparent 32%);
  pointer-events: none;
}

.diagnosis-core {
  --diagnosis-panel-height: clamp(304px, 32vh, 324px);
  --assistant-input-offset: 40px;
  --bottom-card-width: clamp(520px, 32vw, 580px);
  --right-panel-width: clamp(300px, 21vw, 340px);
  --right-panel-x: 22px;
  --right-panel-y: 24px;

  position: relative;
  z-index: 1;
  min-height: 0;
  height: 100%;
  padding: 32px;
  display: grid;
  grid-template-columns: clamp(300px, 21vw, 330px) minmax(0, 1fr) var(--right-panel-width);
  grid-template-rows: minmax(0, 1fr) 204px;
  grid-template-areas:
    "assistant twin diagnosis"
    "bottom-panel bottom-panel footer-right";
  column-gap: 32px;
  row-gap: 32px;
  overflow: hidden;
}

.assistant-zone {
  grid-area: assistant;
  align-self: start;
  min-height: 0;
  height: var(--diagnosis-panel-height);
  width: 100%;
  box-sizing: border-box;
  transform: translate(-16px, -16px);
}

.twin-zone {
  grid-area: twin;
  min-height: 0;
  width: calc(100% + 78px);
  height: calc(100% + 28px);
  align-self: stretch;
  justify-self: center;
  transform: translate(7px, -24px);
}

.diagnosis-zone {
  grid-area: diagnosis;
  align-self: start;
  justify-self: end;
  min-height: 0;
  height: var(--diagnosis-panel-height);
  width: var(--right-panel-width);
  box-sizing: border-box;
  transform: translate(var(--right-panel-x), -24px);
  border: 1px solid rgba(218, 228, 242, 0.82);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  padding: 16px;
  display: grid;
  align-content: start;
  gap: 16px;
  box-shadow: 0 16px 36px rgba(50, 71, 101, 0.08);
}

.diagnosis-summary {
  display: grid;
  gap: 4px;
}

.diagnosis-summary span {
  color: #71829b;
  font-size: 12px;
  font-weight: 900;
}

.diagnosis-summary strong {
  color: #111827;
  font-size: 18px;
}

.diagnosis-zone dl {
  margin: 0;
  display: grid;
  gap: 2px;
}

.diagnosis-zone dl div {
  min-height: 44px;
  border-bottom: 1px solid rgba(224, 232, 243, 0.82);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.diagnosis-zone dl div:last-child {
  border-bottom: 0;
}

.diagnosis-zone dt,
.diagnosis-zone dd {
  margin: 0;
  font-size: 13px;
  font-weight: 900;
}

.diagnosis-zone dt {
  color: #71829b;
}

.diagnosis-zone dd {
  color: #172033;
}

.diagnosis-zone dd.danger {
  border-radius: 999px;
  background: rgba(255, 91, 110, 0.12);
  color: #d72d45;
  padding: 4px 9px;
}

.diagnosis-zone dd.warning {
  border-radius: 999px;
  background: rgba(247, 169, 40, 0.14);
  color: #9a6a12;
  padding: 4px 9px;
}

.canvas-footer {
  display: contents;
}

.bottomControlPanel {
  grid-area: bottom-panel;
  align-self: end;
  justify-self: start;
  min-width: 0;
  width: var(--bottom-card-width);
  height: 204px;
  border: 1px solid rgba(218, 228, 242, 0.76);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.62);
  padding: 16px;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 18px;
  box-sizing: border-box;
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 38px rgba(50, 71, 101, 0.12);
  overflow: hidden;
  transform: translate(calc(var(--right-panel-x) * -1), var(--right-panel-y));
}

.actionPanel {
  min-width: 0;
  width: 220px;
  max-width: 220px;
  height: 100%;
  max-height: 170px;
  border: 1px solid rgba(191, 219, 254, 0.48);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.55);
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  box-shadow: 0 16px 36px rgba(37, 99, 235, 0.08);
  backdrop-filter: blur(16px);
  overflow: hidden;
}

.source-empty-state span {
  color: #71829b;
  font-size: 12px;
  font-weight: 900;
  line-height: 14px;
}

.video-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.actionPanel :deep(.action-toolbar) {
  width: auto;
  height: auto;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 96px);
  grid-template-rows: repeat(2, 36px);
  gap: 8px;
  box-shadow: none;
  box-sizing: border-box;
  overflow: visible;
}

.actionPanel :deep(.action-button) {
  width: 96px;
  min-width: 0;
  height: 36px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 800;
  gap: 5px;
  padding: 0 9px;
  box-sizing: border-box;
}

.actionPanel :deep(.action-button svg) {
  width: 15px;
  height: 15px;
}

.actionPanel :deep(.action-button.primary) {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 8px 18px rgba(35, 105, 239, 0.18);
}

.actionPanel :deep(.action-button.primary:first-child) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.08)),
    linear-gradient(135deg, #70b9ff 0%, #3488f4 100%);
  border-color: rgba(84, 153, 243, 0.8);
}

.actionPanel :deep(.action-button.primary:nth-child(2)) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.24), transparent 52%),
    linear-gradient(135deg, #3a9bff 0%, #1f66ed 100%);
  border-color: rgba(31, 102, 237, 0.86);
}

.actionPanel :deep(.action-button.secondary) {
  background: rgba(255, 255, 255, 0.78);
  color: #245fc8;
  border-color: rgba(191, 219, 254, 0.86);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 8px 16px rgba(37, 99, 235, 0.08);
}

.actionPanel :deep(.action-button:disabled) {
  opacity: 0.45;
  filter: none;
}

.sourceVideoPanel {
  position: relative;
  min-width: 0;
  height: 100%;
  border: 1px solid rgba(218, 228, 242, 0.62);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.52), rgba(240, 246, 255, 0.36)),
    rgba(255, 255, 255, 0.32);
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.source-empty-state {
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  align-items: center;
  justify-items: start;
  gap: 6px;
}

.source-placeholder-frame {
  width: 100%;
  height: 64px;
  border: 1px dashed rgba(159, 181, 214, 0.76);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.42), rgba(232, 241, 255, 0.32)),
    rgba(255, 255, 255, 0.26);
}

.source-empty-state strong {
  min-width: 0;
  color: #172033;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-empty-state p {
  margin: 0;
  color: #8a98ad;
  font-size: 12px;
  font-weight: 700;
}

.source-video {
  width: 100%;
  height: 100%;
  min-height: 0;
  border: 1px solid rgba(194, 213, 244, 0.72);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(47, 130, 255, 0.12), rgba(41, 190, 128, 0.08)),
    #eaf1fb;
  object-fit: cover;
  display: block;
  box-sizing: border-box;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.source-frame-badge {
  position: absolute;
  right: 20px;
  bottom: 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #426182;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(45, 84, 132, 0.12);
  backdrop-filter: blur(10px);
}

.feed-strip {
  grid-area: footer-right;
  align-self: end;
  justify-self: end;
  width: var(--bottom-card-width);
  height: 204px;
  min-height: 0;
  transform: translate(var(--right-panel-x), var(--right-panel-y));
}

@media (max-width: 1180px) {
  .diagnosis-core {
    grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) minmax(140px, auto) 204px;
    grid-template-areas:
      "assistant twin"
      "diagnosis twin"
      "bottom-panel footer-right";
  }

  .feed-strip {
    width: min(540px, 100%);
  }

  .bottomControlPanel {
    width: min(540px, 100%);
  }
}

@media (max-width: 920px) {
  .diagnosis-stage {
    overflow-y: auto;
  }

  .diagnosis-surface {
    height: auto;
    min-height: 100%;
  }

  .diagnosis-core {
    min-height: 760px;
    padding: 28px;
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(320px, 1fr) auto auto auto;
    grid-template-areas:
      "assistant"
      "twin"
      "diagnosis"
      "bottom-panel"
      "footer-right";
    gap: 20px;
  }

  .assistant-zone,
  .diagnosis-zone {
    height: auto;
  }

  .bottomControlPanel,
  .feed-strip {
    justify-self: start;
    width: 100%;
  }

  .bottomControlPanel {
    height: auto;
    min-height: 170px;
    grid-template-columns: 1fr;
    overflow: visible;
    transform: none;
  }

  .actionPanel {
    width: 100%;
  }

  .sourceVideoPanel {
    min-height: 116px;
  }

  .feed-strip {
    width: 100%;
    height: 204px;
    transform: none;
  }
}
</style>
