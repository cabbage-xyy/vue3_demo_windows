import type { IconName } from "@/types/ui";

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: IconName;
  isActive?: boolean;
}

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
  description: string;
}

export type ActionButtonVariant = "primary" | "secondary";

export interface ActionButton {
  id: string;
  label: string;
  icon: IconName;
  variant: ActionButtonVariant;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
}

export interface LogSection {
  id: string;
  title: string;
  entries: LogEntry[];
}
