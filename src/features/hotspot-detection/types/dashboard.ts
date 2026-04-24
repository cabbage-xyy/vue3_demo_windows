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
