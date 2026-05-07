import type { RouteRecordRaw } from "vue-router";
import AppMainLayout from "@/layouts/AppMainLayout.vue";
import HotspotDetectionPage from "@/pages/HotspotDetectionPage.vue";
import HotspotManagementPage from "@/pages/HotspotManagementPage.vue";
import StationManagementPage from "@/pages/StationManagementPage.vue";
import { routeNames } from "@/router/route-names";

// 页面级路由只连接 layout 与 page，具体业务组件继续放在对应 feature/page 内部。
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppMainLayout,
    redirect: { name: routeNames.hotspotDetection },
    children: [
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
        path: "hotspots",
        name: routeNames.hotspotManagement,
        component: HotspotManagementPage,
        meta: {
          title: "热斑管理",
          description: "维护热斑样本、规则和任务基线。",
        },
      },
      {
        path: "stations",
        name: routeNames.stationManagement,
        component: StationManagementPage,
        meta: {
          title: "电站管理",
          description: "维护电站资产、运行状态和巡检基础信息。",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: routeNames.hotspotDetection },
  },
];
