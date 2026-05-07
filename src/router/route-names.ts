// 路由名称集中管理，避免导航、重定向和页面判断散落硬编码字符串。
export const routeNames = {
  hotspotDetection: "hotspot-detection",
  hotspotManagement: "hotspot-management",
  stationManagement: "station-management",
} as const;

export type AppRouteName = (typeof routeNames)[keyof typeof routeNames];
