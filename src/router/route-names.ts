export const routeNames = {
  hotspotDetection: "hotspot-detection",
  hotspotManagement: "hotspot-management",
  stationManagement: "station-management",
} as const;

export type AppRouteName = (typeof routeNames)[keyof typeof routeNames];
