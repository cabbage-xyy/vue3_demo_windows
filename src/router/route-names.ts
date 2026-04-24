export const routeNames = {
  hotspotDetection: "hotspot-detection",
  stationManagement: "station-management",
} as const;

export type AppRouteName = (typeof routeNames)[keyof typeof routeNames];
