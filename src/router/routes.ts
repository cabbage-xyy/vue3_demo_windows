import type { RouteRecordRaw } from "vue-router";
import AppMainLayout from "@/layouts/AppMainLayout.vue";
import HotspotDetectionPage from "@/pages/HotspotDetectionPage.vue";
import StationManagementPage from "@/pages/StationManagementPage.vue";
import { routeNames } from "@/router/route-names";

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
