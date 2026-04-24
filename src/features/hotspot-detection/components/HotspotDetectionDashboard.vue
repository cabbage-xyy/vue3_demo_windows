<template>
  <div class="dashboard-main">
    <DashboardTopBar
      :filters="headerFilters"
      :status-text="detectionStatusText"
    />

    <div class="dashboard-content">
      <section class="content-block">
        <VideoComparisonPanel :videos="videoCards" />
        <div class="control-deck">
          <MetricsRow :metrics="metricCards" />
          <ActionToolbar :actions="actionButtons" />
        </div>

        <section class="operation-strip" aria-label="检测任务状态">
          <article class="task-card">
            <header>
              <span>当前任务</span>
              <strong>屋顶 A-03 热斑巡检</strong>
            </header>
            <div class="task-progress">
              <span></span>
            </div>
            <div class="task-meta">
              <span>已分析 32%</span>
              <span>预计剩余 06:48</span>
              <span>帧率 24 fps</span>
            </div>
          </article>

          <article class="event-card">
            <header>
              <span>异常提示</span>
              <strong>2 项待复核</strong>
            </header>
            <div class="event-list">
              <p>
                <span class="severity high"></span>
                A-03-18 组件温差 18.6°C
              </p>
              <p>
                <span class="severity medium"></span>
                A-03-24 组件疑似遮挡
              </p>
            </div>
          </article>

          <article class="health-card">
            <header>
              <span>设备健康</span>
              <strong>稳定</strong>
            </header>
            <div class="health-grid">
              <span>无人机 96%</span>
              <span>相机 98%</span>
              <span>链路 42ms</span>
            </div>
          </article>
        </section>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionToolbar from "@/features/hotspot-detection/components/ActionToolbar.vue";
import DashboardTopBar from "@/features/hotspot-detection/components/DashboardTopBar.vue";
import MetricsRow from "@/features/hotspot-detection/components/MetricsRow.vue";
import VideoComparisonPanel from "@/features/hotspot-detection/components/VideoComparisonPanel.vue";
import {
  actionButtons,
  detectionStatusText,
  headerFilters,
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
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dashboard-content {
  min-height: 0;
  flex: 1;
  display: grid;
}

.content-block {
  min-height: 0;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  padding: 10px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  gap: 10px;
  box-shadow: 0 18px 42px rgba(50, 71, 101, 0.08);
}

.control-deck {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 14px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(246, 250, 255, 0.86)),
    #ffffff;
  padding: 8px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 12px 24px rgba(50, 71, 101, 0.06);
}

.operation-strip {
  display: grid;
  grid-template-columns: minmax(280px, 1.4fr) minmax(260px, 1fr) minmax(240px, 0.8fr);
  gap: 10px;
}

.task-card,
.event-card,
.health-card {
  min-width: 0;
  min-height: 104px;
  border: 1px solid rgba(218, 228, 242, 0.92);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.88)),
    #ffffff;
  padding: 12px 14px;
  display: grid;
  align-content: space-between;
  gap: 10px;
  box-shadow: 0 12px 26px rgba(50, 71, 101, 0.06);
}

.operation-strip header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.operation-strip header span {
  color: #7d8da5;
  font-size: 12px;
  font-weight: 700;
}

.operation-strip header strong {
  min-width: 0;
  color: #142039;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-progress {
  height: 8px;
  border-radius: 999px;
  background: #e8f0fb;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(38, 54, 76, 0.08);
}

.task-progress span {
  width: 32%;
  height: 100%;
  display: block;
  border-radius: inherit;
  background: linear-gradient(90deg, #2f83ff, #31c3ff);
}

.task-meta,
.health-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.task-meta span,
.health-grid span {
  min-width: 0;
  border-radius: 12px;
  background: #f4f8fe;
  color: #52647f;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.event-list {
  display: grid;
  gap: 6px;
}

.event-list p {
  margin: 0;
  min-width: 0;
  border-radius: 10px;
  background: #f7faff;
  color: #2b3850;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
}

.severity {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.severity.high {
  background: #ff5b6e;
  box-shadow: 0 0 0 4px rgba(255, 91, 110, 0.12);
}

.severity.medium {
  background: #f7a928;
  box-shadow: 0 0 0 4px rgba(247, 169, 40, 0.14);
}

@media (max-width: 960px) {
  .dashboard-content {
    gap: 8px;
  }

  .content-block {
    padding: 10px;
  }

  .control-deck {
    grid-template-columns: 1fr;
  }

  .operation-strip {
    grid-template-columns: 1fr;
  }

  .task-card,
  .event-card,
  .health-card {
    min-height: 86px;
  }
}
</style>
