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
    label: "首页",
    routeName: routeNames.home,
    icon: "home",
    description: "查看平台总体运行态势与待处理事项。",
  },
  {
    label: "电站管理",
    routeName: routeNames.stationManagement,
    icon: "station",
    description: "管理电站台账、区域分布与设备健康度。",
  },
  {
    label: "热斑管理",
    routeName: routeNames.hotspotManagement,
    icon: "thermal",
    description: "跟踪热斑事件、处置流转与风险等级。",
  },
  {
    label: "热斑检测",
    routeName: routeNames.hotspotDetection,
    icon: "monitor",
    description: "执行视频检测、查看结果与导出报告。",
  },
  {
    label: "报告中心",
    routeName: routeNames.reportCenter,
    icon: "report",
    description: "统一管理报告生成任务、模板与审批状态。",
  },
  {
    label: "报告归档",
    routeName: routeNames.reportArchive,
    icon: "report",
    description: "沉淀历史报告、归档策略与审计记录。",
  },
  {
    label: "系统设置",
    routeName: routeNames.systemSettings,
    icon: "setting",
    description: "维护算法阈值、消息通知与系统参数。",
  },
];
