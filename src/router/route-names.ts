export const routeNames = {
  home: "home",
  stationManagement: "station-management",
  hotspotManagement: "hotspot-management",
  hotspotDetection: "hotspot-detection",
  reportCenter: "report-center",
  reportArchive: "report-archive",
  systemSettings: "system-settings",
} as const;

export type AppRouteName = (typeof routeNames)[keyof typeof routeNames];
