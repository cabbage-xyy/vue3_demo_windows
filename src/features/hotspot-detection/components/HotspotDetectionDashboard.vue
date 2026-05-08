<template>
  <div class="hotspot-dashboard">
    <!-- 检测主工作区：左侧原始视频和右侧检测结果共享同一组卡片配置。 -->
    <section class="inspection-board" aria-label="热斑检测工作台">
      <div class="video-grid">
        <DetectionVideoPlayer
          v-for="video in videoCards"
          :key="`${video.id}-${video.id === 'source-video' ? importedVideo?.url ?? 'empty' : resultImageUrls.join('|') || resultImageUrl || 'empty'}`"
          :video="video"
          :media-url="video.id === 'source-video' ? importedVideo?.url : video.id === 'result-video' ? resultImageUrl : null"
          :media-urls="video.id === 'result-video' ? resultImageUrls : []"
        />
      </div>

      <MetricsRow :metrics="dashboardMetrics" />
    </section>

    <!-- 底部控制台：操作按钮和运行日志并列展示，日志详情由弹窗承载。 -->
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

    <!-- 运行日志详情弹窗：既支持查看全部日志，也支持查看单条日志。 -->
    <RunLogDetailModal
      :open="isRunLogModalOpen"
      :logs="modalRunLogs"
      @close="closeRunLogModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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
  videoCards,
} from "@/features/hotspot-detection/mock/dashboardData";
import type {
  MetricCard,
  RunLogItem,
} from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "HotspotDetectionDashboard",
});

// 检测流程状态机：控制按钮可用性、轮询、进度和报告导出入口。
type DetectionStatus = "idle" | "imported" | "running" | "paused" | "completed" | "failed";

interface ImportedVideo {
  name: string;
  path: string;
  url: string;
  resolution: string;
  duration: string;
}

type HeaderProcessStatus = "未处理" | "处理中" | "已处理";

// 顶部 header 状态由布局展示，这里只在检测流程节点发出状态变更事件。
const setHeaderProcessStatus = (status: HeaderProcessStatus) => {
  localStorage.setItem("hotspotProcessStatus", status);
  window.dispatchEvent(new Event("hotspot-process-status-change"));
};

// 本组件状态分为：媒体输入、检测任务、进度指标、轮询定时器和运行日志。
const isRunLogModalOpen = ref(false);
const selectedRunLog = ref<RunLogItem | null>(null);
const detectionStatus = ref<DetectionStatus>("idle");
const importedVideo = ref<ImportedVideo | null>(null);
const inputVideoPath = ref("");
const currentTaskId = ref("");
const detectionProgress = ref(0);
const detectedHotspotCount = ref(0);
const resultImagePath = ref("");
const resultImageUrl = ref("");
const resultImagePaths = ref<string[]>([]);
const resultImageUrls = ref<string[]>([]);
const pollingTimer = ref<number | null>(null);
const detectionStartTime = ref<number | null>(null);
const detectionDurationSeconds = ref(0);
const durationTimer = ref<number | null>(null);
const runLogs = ref<RunLogItem[]>([]);
const selectedCompanyName = ref("");
const selectedStationName = ref("");
const selectedRoofName = ref("");

// 后端检测记录进入运行日志面板前做字段兜底，避免空值破坏日志列表。
interface DetectionTaskApiRecord {
  id?: number | string | null;
  companyName?: string | null;
  stationName?: string | null;
  roofName?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  hotspotComponentCount?: number | string | null;
  isSavedToHotspotManagement?: boolean | null;
  taskStatus?: string | null;
}

const normalizeDetectionTaskRecord = (record: DetectionTaskApiRecord): RunLogItem => {
  const recordId = Number(record.id);
  const abnormalCount = Number(record.hotspotComponentCount);
  const roofName = record.roofName || "未填写屋顶";
  const stationName = record.stationName || "未填写电站";
  const startedAt = record.startedAt && record.startedAt !== "未记录" ? record.startedAt : "";
  const finishedAt = record.finishedAt && record.finishedAt !== "未记录" ? record.finishedAt : null;

  return {
    id: Number.isFinite(recordId) ? recordId : Date.now(),
    taskName: roofName,
    stationName,
    startTime: startedAt,
    endTime: finishedAt,
    hotspotPositions: null,
    abnormalCount: Number.isFinite(abnormalCount) ? abnormalCount : 0,
    companyName: record.companyName || "未填写公司",
    isSavedToHotspotManagement: Boolean(record.isSavedToHotspotManagement),
    taskStatus: record.taskStatus || "检测中",
  } as RunLogItem & {
    companyName: string;
    isSavedToHotspotManagement: boolean;
    taskStatus: string;
  };
};

const fetchDetectionTaskRecords = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/detection-task-records");

    if (!response.ok) {
      console.error("获取检测记录失败：", response.status, response.statusText);
      return;
    }

    const result = await response.json();
    const records = Array.isArray(result.data) ? result.data : [];

    runLogs.value = records.map((record: DetectionTaskApiRecord) => normalizeDetectionTaskRecord(record));
  } catch (error) {
    console.error("获取检测记录接口调用失败：", error);
  }
};
const detectedHotspotPositions = hotspotMarkers.map(
  (marker) => marker.moduleCode,
);

// 业务上下文依赖顶部三级筛选，检测前必须能拿到公司/电站/屋顶。
const activeLog = computed(() =>
  runLogs.value.find((logItem) => logItem.endTime === null),
);

const hasSelectedRoofContext = computed(() => {
  return Boolean(
    selectedCompanyName.value &&
      selectedStationName.value &&
      selectedRoofName.value,
  );
});

const canStartDetection = computed(() => {
  return (
    hasSelectedRoofContext.value &&
    Boolean(inputVideoPath.value) &&
    detectionStatus.value !== "running"
  );
});

const canImportVideo = computed(() => {
  return hasSelectedRoofContext.value && detectionStatus.value !== "running";
});
const disabledActionIds = computed(() => {
  const disabledIds: string[] = [];

  if (!canImportVideo.value) {
    disabledIds.push("import-video");
  }

  if (!canStartDetection.value) {
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
const modalRunLogs = computed(() =>
  selectedRunLog.value ? [selectedRunLog.value] : runLogs.value,
);

// 指标卡片从检测状态派生，mock 配置只提供静态标题和 icon。
const detectionDurationText = computed(() => {
  const minutes = detectionDurationSeconds.value / 60;
  return `${minutes.toFixed(1)}min`;
});


const isDurationMetric = (metric: MetricCard) => {
  const metricInfo = metric as MetricCard & {
    label?: string;
    title?: string;
    name?: string;
  };

  return [metric.id, metricInfo.label, metricInfo.title, metricInfo.name]
    .filter(Boolean)
    .some((item) => String(item).includes("时长") || String(item).includes("duration"));
};

const isHotspotCountMetric = (metric: MetricCard) => {
  const metricInfo = metric as MetricCard & {
    label?: string;
    title?: string;
    name?: string;
  };

  return [metric.id, metricInfo.label, metricInfo.title, metricInfo.name]
    .filter(Boolean)
    .some((item) => {
      const text = String(item).toLowerCase();
      return text === "hotspot-count" || text.includes("热斑组件") || text.includes("hotspot count");
    });
};

const dashboardMetrics = computed<MetricCard[]>(() =>
  metricCards.map((metric) => {
    if (isHotspotCountMetric(metric)) {
      return {
        ...metric,
        value: String(detectedHotspotCount.value).padStart(2, "0"),
      };
    }

    if (isDurationMetric(metric)) {
      return {
        ...metric,
        value: detectionDurationText.value,
      };
    }

    if (metric.id === "hotspot-ratio") {
      return {
        ...metric,
        value: `${detectionProgress.value}%`,
      };
    }

    return metric;
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

// 媒体预览由后端静态代理输出，前端只负责拼接安全的查询参数。
const buildVideoPreviewUrl = (path: string) => {
  return `http://127.0.0.1:8000/media/video?path=${encodeURIComponent(path)}`;
};

const buildImagePreviewUrl = (path: string) => {
  if (/^(https?:|blob:|data:)/.test(path)) {
    return path;
  }

  return `http://127.0.0.1:8000/media/image?path=${encodeURIComponent(path)}`;
};

const getSelectedRoofContext = () => {
  return {
    companyName: selectedCompanyName.value,
    stationName: selectedStationName.value,
    roofName: selectedRoofName.value,
  };
};

const syncSelectedRoofContext = () => {
  selectedCompanyName.value = localStorage.getItem("selectedCompanyName") || "";
  selectedStationName.value = localStorage.getItem("selectedStationName") || "";
  selectedRoofName.value = localStorage.getItem("selectedRoofName") || "";
};

// 视频导入前先校验屋顶归属，避免检测任务和顶部筛选上下文错配。
const validateVideoBelongsToSelectedRoof = async (videoPath: string) => {
  const { companyName, stationName, roofName } = getSelectedRoofContext();

  if (!companyName || !stationName || !roofName) {
    window.alert("请先选择公司名称、电站名称和屋顶名称，再导入视频");
    return false;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/station/validate-video-roof", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_path: videoPath,
        company_name: companyName,
        station_name: stationName,
        roof_name: roofName,
      }),
    });

    const result = await response.json();
    console.log("视频屋顶归属校验返回：", result);

    if (!response.ok) {
      window.alert(result.detail || "视频屋顶归属校验失败");
      return false;
    }

    if (!result.matched) {
      window.alert(result.message || "该视频不属于当前选择的屋顶，请重新选择视频或屋顶");
      return false;
    }

    return true;
  } catch (error) {
    console.error("视频屋顶归属校验接口调用失败：", error);
    window.alert("视频屋顶归属校验接口调用失败，请确认后端服务已启动");
    return false;
  }
};

// 检测接口可能返回不同命名的结果图字段，统一从常见字段里取第一张图片。
const pickFirstString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const picked = pickFirstString(item);
      if (picked) {
        return picked;
      }
    }
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return pickFirstString(record.path ?? record.url ?? record.image_path ?? record.frame_path);
  }

  return "";
};

const pickStringList = (value: unknown): string[] => {
  if (typeof value === "string") {
    return value ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => pickStringList(item)).filter(Boolean);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return pickStringList(record.path ?? record.url ?? record.image_path ?? record.frame_path);
  }

  return [];
};

const pickResultImagePath = (data: Record<string, unknown>) => {
  return pickFirstString(
    data.hotspot_image_paths ??
      data.report_image_paths ??
      data.result_image_path ??
      data.result_frame_path ??
      data.image_path ??
      data.result_image_paths ??
      data.result_frame_paths ??
      data.result_images ??
      data.result_frames,
  );
};

const pickResultImagePaths = (data: Record<string, unknown>) => {
  const hotspotImagePaths = pickStringList(data.hotspot_image_paths);
  const reportImagePaths = pickStringList(data.report_image_paths);
  const fallbackImagePaths = pickStringList(
    data.result_image_paths ??
      data.result_frame_paths ??
      data.result_images ??
      data.result_frames ??
      data.result_image_path ??
      data.result_frame_path ??
      data.image_path,
  );

  return [...hotspotImagePaths, ...reportImagePaths, ...fallbackImagePaths];
};

const importVideo = async () => {
  if (!canImportVideo.value) {
    window.alert("请先选择公司名称、电站名称和屋顶名称，再导入无人机视频");
    return;
  }

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

  const isVideoMatched = await validateVideoBelongsToSelectedRoof(selected);

  if (!isVideoMatched) {
    inputVideoPath.value = "";
    importedVideo.value = null;
    detectionStatus.value = "idle";
    setHeaderProcessStatus("未处理");
    return;
  }

  inputVideoPath.value = selected;

  currentTaskId.value = "";
  detectionProgress.value = 0;
  detectedHotspotCount.value = 0;
  detectionDurationSeconds.value = 0;
  detectionStartTime.value = null;
  stopDurationTimer();
  resultImagePath.value = "";
  resultImageUrl.value = "";
  resultImagePaths.value = [];
  resultImageUrls.value = [];

  importedVideo.value = {
    name: selected.split("/").pop() || "已导入视频",
    path: selected,
    url: buildVideoPreviewUrl(selected),
    resolution: "自动识别",
    duration: "自动识别",
  };

  detectionStatus.value = "imported";
  setHeaderProcessStatus("未处理");
  console.log("导入视频路径：", inputVideoPath.value);
};

// 运行日志弹窗只管理查看范围，日志内容仍由后端检测记录接口刷新。
const openRunLogModal = (record?: RunLogItem) => {
  selectedRunLog.value = record ?? null;
  isRunLogModalOpen.value = true;
};

const closeRunLogModal = () => {
  selectedRunLog.value = null;
  isRunLogModalOpen.value = false;
};

// 轮询和计时器是检测流程的副作用，集中提供启动/停止函数便于卸载清理。
const stopPollingDetectionStatus = () => {
  if (pollingTimer.value !== null) {
    window.clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
};

const startDurationTimer = () => {
  detectionStartTime.value = Date.now();
  detectionDurationSeconds.value = 0;

  if (durationTimer.value !== null) {
    window.clearInterval(durationTimer.value);
  }

  durationTimer.value = window.setInterval(() => {
    if (detectionStartTime.value === null) {
      return;
    }

    detectionDurationSeconds.value = Math.floor(
      (Date.now() - detectionStartTime.value) / 1000,
    );
  }, 1000);
};

const stopDurationTimer = () => {
  if (durationTimer.value !== null) {
    window.clearInterval(durationTimer.value);
    durationTimer.value = null;
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

      const nextHotspotCount = Number(data.hotspot_count);
      if (Number.isFinite(nextHotspotCount)) {
        detectedHotspotCount.value = nextHotspotCount;
      }

      const nextResultImagePaths = pickResultImagePaths(data);
      if (nextResultImagePaths.length > 0) {
        resultImagePaths.value = nextResultImagePaths;
        resultImageUrls.value = nextResultImagePaths.map((path) => buildImagePreviewUrl(path));
        resultImagePath.value = nextResultImagePaths[0] ?? "";
        resultImageUrl.value = resultImageUrls.value[0] ?? "";
        console.log("检测结果图片路径列表：", resultImagePaths.value);
        console.log("检测结果图片URL列表：", resultImageUrls.value);
      } else {
        const nextResultImagePath = pickResultImagePath(data);
        if (nextResultImagePath) {
          resultImagePath.value = nextResultImagePath;
          resultImageUrl.value = buildImagePreviewUrl(nextResultImagePath);
          resultImagePaths.value = [nextResultImagePath];
          resultImageUrls.value = [resultImageUrl.value];
          console.log("检测结果图片路径：", resultImagePath.value);
          console.log("检测结果图片URL：", resultImageUrl.value);
        }
      }

      if (data.status === "completed") {
        detectionStatus.value = "completed";
        detectionProgress.value = 100;
        stopDurationTimer();
        setHeaderProcessStatus("已处理");

        stopPollingDetectionStatus();
        finishActiveDetectionRecord();
        void fetchDetectionTaskRecords();
        return;
      }

      if (data.status === "stopped") {
        detectionStatus.value = "paused";
        stopPollingDetectionStatus();
        stopDurationTimer();
        setHeaderProcessStatus("未处理");
        finishActiveDetectionRecord();
        void fetchDetectionTaskRecords();
        return;
      }

      if (data.status === "failed") {
        detectionStatus.value = "failed";
        stopPollingDetectionStatus();
        stopDurationTimer();
        setHeaderProcessStatus("未处理");
        console.error("检测失败：", data.error || data.result_video_path || data.message);
        void fetchDetectionTaskRecords();
      }
    } catch (error) {
      console.error("查询检测状态失败：", error);
    }
  }, 1000);
};

// 启动检测时锁定当前顶部筛选上下文和已导入视频路径。
const startDetection = async () => {
  const { companyName, stationName, roofName } = getSelectedRoofContext();

  if (!companyName || !stationName || !roofName) {
    console.warn("请先选择公司名称、电站名称和屋顶名称");
    window.alert("请先选择公司名称、电站名称和屋顶名称后再启动检测");
    detectionStatus.value = inputVideoPath.value ? "imported" : "idle";
    setHeaderProcessStatus("未处理");
    return;
  }

  if (!inputVideoPath.value) {
    console.warn("请先导入无人机视频");
    window.alert("请先导入无人机视频");
    detectionStatus.value = "idle";
    setHeaderProcessStatus("未处理");
    return;
  }

  if (detectionStatus.value === "running") {
    console.warn("当前已有正在运行的检测任务");
    return;
  }

  detectionStatus.value = "running";
  detectionProgress.value = 0;
  detectedHotspotCount.value = 0;
  detectionDurationSeconds.value = 0;
  resultImagePath.value = "";
  resultImageUrl.value = "";
  resultImagePaths.value = [];
  resultImageUrls.value = [];

  startDurationTimer();
  setHeaderProcessStatus("处理中");

  console.log("启动检测请求参数：", {
    input_path: inputVideoPath.value,
    company_name: companyName,
    station_name: stationName,
    roof_name: roofName,
  });

  try {
    const res = await fetch("http://127.0.0.1:8000/detect/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_path: inputVideoPath.value,
        company_name: companyName,
        station_name: stationName,
        roof_name: roofName,
      }),
    });

    const data = await res.json();
    console.log("检测接口返回：", data);

    if (!res.ok) {
      window.alert(data.detail || data.message || "启动检测失败");
      detectionStatus.value = "imported";
      stopDurationTimer();
      setHeaderProcessStatus("未处理");
      return;
    }

    if (data.task_id) {
      currentTaskId.value = data.task_id;
      await fetchDetectionTaskRecords();
      pollDetectionStatus(data.task_id);
    }
  } catch (error) {
    console.error("检测接口调用失败：", error);
    detectionStatus.value = "imported";
    stopDurationTimer();
    setHeaderProcessStatus("未处理");
    return;
  }
};

// 前端日志的完成态补齐，用于弹窗即时反馈；后端台账仍通过接口刷新。
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
    stopDurationTimer();
    setHeaderProcessStatus("未处理");
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
    stopDurationTimer();
    setHeaderProcessStatus("未处理");
  } catch (error) {
    console.error("停止检测接口调用失败：", error);
  }
};

// 报告导出交给后端生成/保存，前端只处理文件名和保存路径选择。
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
  stopDurationTimer();
  setHeaderProcessStatus("已处理");
  finishActiveDetectionRecord();
};

// 操作栏事件分发：按钮只发 actionId，具体副作用留在 dashboard 内部。
const handleToolbarAction = (actionId: string) => {
  if (actionId === "import-video") {
    void importVideo();
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

onMounted(() => {
  syncSelectedRoofContext();
  window.addEventListener("hotspot-selection-change", syncSelectedRoofContext);
  void fetchDetectionTaskRecords();
});

onBeforeUnmount(() => {
  window.removeEventListener("hotspot-selection-change", syncSelectedRoofContext);
  stopPollingDetectionStatus();
  stopDurationTimer();
  importedVideo.value = null;
  resultImageUrl.value = "";
  resultImagePath.value = "";
  resultImagePaths.value = [];
  resultImageUrls.value = [];
});
</script>

<style scoped>
/* 检测页主网格：上方视频/指标工作台，下方操作控制和运行日志。 */
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

/* 视频检测工作区：固定在剩余高度内，避免 Tauri 小窗口出现外层滚动。 */
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

.video-grid :deep(.result-image-card .player-shell) {
  grid-template-rows: minmax(0, 1fr);
}

.video-grid :deep(.media-frame) {
  height: 100%;
  aspect-ratio: auto;
}

/* 底部控制台：高度固定，保障视频区域尺寸稳定。 */
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
