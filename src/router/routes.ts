import type { RouteRecordRaw } from "vue-router";
import AppMainLayout from "@/layouts/AppMainLayout.vue";
import HomePage from "@/pages/HomePage.vue";
import HotspotDetectionPage from "@/pages/HotspotDetectionPage.vue";
import HotspotManagementPage from "@/pages/HotspotManagementPage.vue";
import ReportArchivePage from "@/pages/ReportArchivePage.vue";
import ReportCenterPage from "@/pages/ReportCenterPage.vue";
import StationManagementPage from "@/pages/StationManagementPage.vue";
import SystemSettingsPage from "@/pages/SystemSettingsPage.vue";
import { routeNames } from "@/router/route-names";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppMainLayout,
    children: [
      {
        path: "",
        name: routeNames.home,
        component: HomePage,
        meta: {
          title: "首页",
          description: "查看协同平台的总览指标、任务进度和最近动态。",
        },
      },
      {
        path: "stations",
        name: routeNames.stationManagement,
        component: StationManagementPage,
        meta: {
          title: "电站管理",
          description: "管理电站资产、巡检状态与并网运行概况。",
        },
      },
      {
        path: "hotspots",
        name: routeNames.hotspotManagement,
        component: HotspotManagementPage,
        meta: {
          title: "热斑管理",
          description: "跟踪热斑事件、风险等级与处置闭环。",
        },
      },
      {
        path: "detection",
        name: routeNames.hotspotDetection,
        component: HotspotDetectionPage,
        meta: {
          title: "热斑检测",
          description: "执行热斑检测任务并查看分析结果。",
        },
      },
      {
        path: "reports",
        name: routeNames.reportCenter,
        component: ReportCenterPage,
        meta: {
          title: "报告中心",
          description: "管理报告生成、审批、导出和模板标准。",
        },
      },
      {
        path: "archives",
        name: routeNames.reportArchive,
        component: ReportArchivePage,
        meta: {
          title: "报告归档",
          description: "沉淀历史报告资产并跟踪归档与审计记录。",
        },
      },
      {
        path: "settings",
        name: routeNames.systemSettings,
        component: SystemSettingsPage,
        meta: {
          title: "系统设置",
          description: "配置模型阈值、通知渠道与权限安全策略。",
        },
      },
    ],
  },
];
