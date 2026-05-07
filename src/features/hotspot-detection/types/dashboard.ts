import type { IconName } from "@/types/ui";

// 热斑检测 feature 的共享 UI 数据结构，供 dashboard、工具栏、日志和指标组件复用。
export interface HeaderFilter {
  id: string;
  label: string;
  value: string;
  selected?: boolean;
}

export interface VideoCard {
  id: string;
  title: string;
  imageUrl: string;
  streamTitle?: string;
  currentTime?: string;
  duration?: string;
  progress?: number;
  fps?: string;
  resolution?: string;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string;
  helper?: string;
  icon?: IconName;
}

export type ActionButtonVariant = "primary" | "secondary";

export interface ActionButton {
  id: string;
  label: string;
  icon: IconName;
  variant: ActionButtonVariant;
}

export interface DetectionMetric {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "cyan" | "orange" | "red";
}

export interface HotspotMarker {
  id: string;
  moduleCode: string;
  x: number;
  y: number;
  severity: "high" | "medium";
  temperatureDelta: string;
}

export interface AiAssistantMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
}

export interface DiagnosticInsight {
  id: string;
  label: string;
  value: string;
  status?: string;
}

export interface RunLogItem {
  id: number;
  taskName: string;
  stationName: string;
  startTime: string;
  endTime: string | null;
  hotspotPositions: string[] | null;
  abnormalCount: number | null;
}

export interface StatusNotice {
  id: string;
  content: string;
  linkLabel?: string;
}
