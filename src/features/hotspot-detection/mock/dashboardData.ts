import type {
  ActionButton,
  HeaderFilter,
  LogSection,
  MetricCard,
  SidebarMenuItem,
  VideoCard,
} from "@/features/hotspot-detection/types/dashboard";

export const sidebarMenuItems: SidebarMenuItem[] = [
  { id: "home", label: "首页", icon: "home", isActive: true },
  { id: "station", label: "电站管理", icon: "station" },
  { id: "thermal", label: "热斑管理", icon: "thermal" },
  { id: "detect", label: "热斑检测", icon: "monitor" },
  { id: "report", label: "报告中心", icon: "report" },
  { id: "report-archive", label: "报告归档", icon: "report" },
  { id: "settings", label: "系统设置", icon: "setting" },
];

export const headerFilters: HeaderFilter[] = [
  { id: "company", label: "公司名称", value: "公司名称" },
  { id: "station", label: "电站名称", value: "电站名称" },
  { id: "roof", label: "屋顶名称", value: "屋顶名称" },
];

export const videoCards: VideoCard[] = [
  {
    id: "source-video",
    title: "原始视频",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "result-video",
    title: "检测结果",
    imageUrl:
      "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1400&q=80",
  },
];

export const metricCards: MetricCard[] = [
  { id: "hotspot-count", title: "热斑数量", value: "22", description: "总检一线，待复核样本" },
  { id: "abnormal-module", title: "异常组件数", value: "02", description: "总检一线，待剔归样本" },
  { id: "max-temp-gap", title: "最高温差", value: "67", description: "总检一线，峰值告警阈值" },
  { id: "duration", title: "检测时长", value: "102", description: "总检一线，任务运行分钟" },
  { id: "progress-rate", title: "检测进度", value: "32", description: "总检一线，当前已完成帧" },
];

export const actionButtons: ActionButton[] = [
  { id: "import-video", label: "导入视频", icon: "upload", variant: "primary" },
  { id: "start-detection", label: "启动检测", icon: "play", variant: "primary" },
  { id: "stop-detection", label: "停止检测", icon: "stop-circle", variant: "secondary" },
  { id: "export-report", label: "导出报告", icon: "file-output", variant: "secondary" },
];

export const logSections: LogSection[] = [
  {
    id: "system-status",
    title: "系统状态",
    entries: [
      {
        id: "status-1",
        message: "模型加载完成，视频导入成功，检测进度更新，异常识别数量，检测完成提示",
        timestamp: "2026-04-23 10:21:03",
        actionLabel: "异常识别数量",
      },
      {
        id: "status-2",
        message: "模型加载完成，视频导入成功，检测进度更新，检测时长，检测完成提示",
        timestamp: "2026-04-23 10:18:42",
        actionLabel: "异常识别数量",
      },
    ],
  },
  {
    id: "runtime-log",
    title: "运行日志",
    entries: [
      {
        id: "runtime-1",
        message: "模型加载完成，视频导入成功，检测进度更新，异常识别数量，检测完成提示",
        timestamp: "2026-04-23 10:16:14",
      },
      {
        id: "runtime-2",
        message: "检测完成提示",
        timestamp: "2026-04-23 10:15:58",
      },
    ],
  },
];

export const detectionStatusText = "未开始 / 检测中 / 检测完成";
export const detectionProgressText = "105%";
