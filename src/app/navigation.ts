import type { IconName } from "@/types/ui";
import { routeNames, type AppRouteName } from "@/router/route-names";

export interface AppNavigationItem {
  label: string;
  routeName?: AppRouteName;
  icon: IconName;
  description: string;
  marker?: string;
}

// 侧边栏导航元数据：图标、路由和说明都从这里派发给主布局。
export const appNavigationItems: AppNavigationItem[] = [
  {
    label: "电站管理",
    routeName: routeNames.stationManagement,
    icon: "station",
    description: "维护电站资产、运行状态和巡检基础信息。",
  },
  {
    label: "热斑管理",
    routeName: routeNames.hotspotManagement,
    icon: "database",
    description: "维护热斑样本、规则和任务基线。",
  },
  {
    label: "热斑检测",
    routeName: routeNames.hotspotDetection,
    icon: "monitor",
    description: "执行视频检测、查看结果与导出报告。",
  },
];
