import type {
  ActionButton,
  AiAssistantMessage,
  DetectionMetric,
  DiagnosticInsight,
  HeaderFilter,
  HotspotMarker,
  MetricCard,
  RunLogItem,
  StatusNotice,
  VideoCard,
} from "@/features/hotspot-detection/types/dashboard";

export const headerFilters: HeaderFilter[] = [
  { id: "company", label: "公司名称", value: "公司名称", selected: true },
  { id: "station", label: "电站名称", value: "电站名称", selected: false },
  { id: "roof", label: "屋顶名称", value: "屋顶名称", selected: false },
];

export const videoCards: VideoCard[] = [
  {
    id: "source-video",
    title: "原始视频",
    streamTitle: "真实多点回放特伏阵列异常视频流",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=82",
    currentTime: "0:30",
    duration: "7:08",
    progress: 21,
    fps: "24 fps",
    resolution: "4K",
  },
  {
    id: "result-video",
    title: "检测结果",
    streamTitle: "真实多点回放特伏热斑识别视频流",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=82",
    currentTime: "0:30",
    duration: "7:08",
    progress: 38,
    fps: "24 fps",
    resolution: "4K",
  },
];

export const metricCards: MetricCard[] = [
  { id: "abnormal-module", title: "异常热斑组件数", value: "02", helper: "总检一线，特别归纳协调", icon: "station" },
  { id: "duration", title: "检测时长", value: "102", helper: "总检一线，待机归纳确认", icon: "clock" },
  { id: "hotspot-ratio", title: "检测进度", value: "32%", helper: "总检一线，获取已冷却，站点", icon: "info" },
];

export const detectionMetrics: DetectionMetric[] = [
  { id: "abnormal-module", label: "异常组件", value: "02", helper: "较上次 +1", tone: "red" },
  { id: "confidence", label: "AI 置信度", value: "94%", helper: "多模态融合", tone: "blue" },
  { id: "hotspot-ratio", label: "热斑占比", value: "32%", helper: "屋顶 A-03", tone: "orange" },
  { id: "duration", label: "检测时长", value: "102s", helper: "24 fps", tone: "cyan" },
];

export const hotspotMarkers: HotspotMarker[] = [
  { id: "a03-18", moduleCode: "A-03-18", x: 61, y: 48, severity: "high", temperatureDelta: "18.6°C" },
  { id: "a03-24", moduleCode: "A-03-24", x: 38, y: 62, severity: "medium", temperatureDelta: "12.4°C" },
];

export const aiAssistantMessages: AiAssistantMessage[] = [
  { id: 1, role: "assistant", text: "已接入屋顶 A-03 巡检视频，正在进行可见光与热红外融合分析。" },
  { id: 2, role: "user", text: "帮我定位疑似热斑组件。" },
  { id: 3, role: "assistant", text: "发现 2 处异常，建议优先复核 A-03-18，温差 18.6℃。" },
];

export const diagnosticInsights: DiagnosticInsight[] = [
  { id: "module", label: "定位组件", value: "A-03-18", status: "高风险" },
  { id: "temperature", label: "组件温差", value: "18.6°C", status: "异常" },
  { id: "modality", label: "融合来源", value: "可见光 / 红外 / 时序帧" },
  { id: "coordinate", label: "阵列坐标", value: "Row 03 / Col 18" },
];

export const runLogItems: RunLogItem[] = [
  {
    id: 1,
    taskName: "屋顶 A-03 热斑巡检",
    stationName: "嘉兴一号屋顶光伏电站",
    startTime: "2026-04-29 09:12:08",
    endTime: "2026-04-29 09:14:02",
    hotspotPositions: ["A-03-18", "A-03-24"],
    abnormalCount: 2,
  },
  {
    id: 2,
    taskName: "屋顶 A-02 复核检测",
    stationName: "嘉兴一号屋顶光伏电站",
    startTime: "2026-04-28 15:30:16",
    endTime: "2026-04-28 15:31:44",
    hotspotPositions: [],
    abnormalCount: 0,
  },
  {
    id: 3,
    taskName: "屋顶 B-01 热斑巡检",
    stationName: "巴州戈壁集中式电站",
    startTime: "2026-04-25 08:20:14",
    endTime: "2026-04-25 08:22:03",
    hotspotPositions: ["B-01-07"],
    abnormalCount: 1,
  },
  {
    id: 4,
    taskName: "屋顶 C-02 热斑巡检",
    stationName: "苏州工业园分布式电站",
    startTime: "2026-04-25 08:05:26",
    endTime: "2026-04-25 08:07:12",
    hotspotPositions: [],
    abnormalCount: 0,
  },
];

export const actionButtons: ActionButton[] = [
  { id: "import-video", label: "导入视频", icon: "upload", variant: "primary" },
  { id: "start-detection", label: "启动检测", icon: "play", variant: "primary" },
  { id: "stop-detection", label: "停止检测", icon: "stop-circle", variant: "secondary" },
  { id: "export-report", label: "导出报告", icon: "file-output", variant: "secondary" },
];

export const detectionStatusText = "未开始 / 检测中 / 检测完成";

export const systemStatusItems: StatusNotice[] = [
  {
    id: "model",
    content: "模型加载完成、视频导入成功、检测进度更新、异常识别数量、检测完成提示",
    linkLabel: "异常识别数量",
  },
  {
    id: "duration",
    content: "模型加载完成、视频导入成功、检测进度更新、检测时长、检测完成提示",
    linkLabel: "异常识别数量",
  },
];

export const runLogSummaryItems: StatusNotice[] = [
  {
    id: "task",
    content: "检测开始、检测结束、热斑组件位置、热斑组件数量",
  },
  {
    id: "complete",
    content: "最新检测：A-03-18、A-03-24 共 2 个热斑组件",
  },
];
