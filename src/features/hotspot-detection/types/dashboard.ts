import type { IconName } from "@/types/ui";

export interface HeaderFilter {
  id: string;
  label: string;
  value: string;
}

export interface VideoCard {
  id: string;
  title: string;
  imageUrl: string;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string;
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
  startTime: string;
  endTime: string | null;
  hasHotspot: boolean | null;
  abnormalCount: number;
}
