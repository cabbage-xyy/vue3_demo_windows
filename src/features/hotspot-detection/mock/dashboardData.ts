import type {
  ActionButton,
  HeaderFilter,
  MetricCard,
  VideoCard,
} from "@/features/hotspot-detection/types/dashboard";

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
  { id: "abnormal-module", title: "异常热斑组件数", value: "02" },
  { id: "duration", title: "检测时长", value: "102" },
  { id: "hotspot-ratio", title: "热斑占比", value: "32%" },
];

export const actionButtons: ActionButton[] = [
  { id: "import-video", label: "导入视频", icon: "upload", variant: "primary" },
  { id: "start-detection", label: "启动检测", icon: "play", variant: "primary" },
  { id: "stop-detection", label: "停止检测", icon: "stop-circle", variant: "secondary" },
  { id: "export-report", label: "导出报告", icon: "file-output", variant: "secondary" },
];

export const detectionStatusText = "未开始 / 检测中 / 检测完成";
