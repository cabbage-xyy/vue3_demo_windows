<template>
  <div class="dashboard-main">
    <DashboardTopBar
      :filters="headerFilters"
      :status-text="detectionStatusText"
      :progress-text="detectionProgressText"
    />

    <div class="dashboard-content">
      <section class="content-block">
        <VideoComparisonPanel :videos="videoCards" />
        <MetricsRow :metrics="metricCards" />
        <ActionToolbar :actions="actionButtons" />
      </section>

      <section class="log-grid">
        <LogPanel v-for="section in logSections" :key="section.id" :section="section" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionToolbar from "@/features/hotspot-detection/components/ActionToolbar.vue";
import DashboardTopBar from "@/features/hotspot-detection/components/DashboardTopBar.vue";
import LogPanel from "@/features/hotspot-detection/components/LogPanel.vue";
import MetricsRow from "@/features/hotspot-detection/components/MetricsRow.vue";
import VideoComparisonPanel from "@/features/hotspot-detection/components/VideoComparisonPanel.vue";
import {
  actionButtons,
  detectionProgressText,
  detectionStatusText,
  headerFilters,
  logSections,
  metricCards,
  videoCards,
} from "@/features/hotspot-detection/mock/dashboardData";

defineOptions({
  name: "HotspotDetectionDashboard",
});
</script>

<style scoped>
.dashboard-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-content {
  display: grid;
  gap: 18px;
}

.content-block {
  border: 1px solid #e4eaf4;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
  display: grid;
  gap: 18px;
}

.log-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 960px) {
  .dashboard-content {
    gap: 12px;
  }

  .content-block {
    padding: 12px;
  }

  .log-grid {
    grid-template-columns: 1fr;
  }
}
</style>
