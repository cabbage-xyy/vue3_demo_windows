import type { IconName } from "@/types/ui";
import { routeNames, type AppRouteName } from "@/router/route-names";

export interface AppNavigationItem {
  label: string;
  routeName: AppRouteName;
  icon: IconName;
  description: string;
}

export const appNavigationItems: AppNavigationItem[] = [
  {
    label: "热斑检测",
    routeName: routeNames.hotspotDetection,
    icon: "monitor",
    description: "执行视频检测、查看结果与导出报告。",
  },
  {
    label: "电站管理",
    routeName: routeNames.stationManagement,
    icon: "station",
    description: "新增、编辑、删除和查询电站资产。",
  },
];
