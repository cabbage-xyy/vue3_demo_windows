<template>
  <!-- 检测指标横排卡片：数值由 dashboard 派生后传入。 -->
  <section class="metrics-row" aria-label="检测指标">
    <article v-for="metric in metrics" :key="metric.id" class="metric-card">
      <header>
        <div class="metric-copy">
          <h3>{{ metric.title }}</h3>
          <strong>{{ metric.value }}</strong>
        </div>
        <span class="metric-icon">
          <BaseIcon :name="metric.icon ?? 'info'" :size="15" :stroke-width="2.4" />
        </span>
      </header>
    </article>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { MetricCard } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "MetricsRow",
});

// 指标组件只负责稳定展示，不维护检测进度状态。
interface MetricsRowProps {
  metrics: MetricCard[];
}

defineProps<MetricsRowProps>();
</script>

<style scoped>
.metrics-row {
  min-width: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.metric-card {
  width: 280px;
  min-width: 0;
  height: 62px;
  border: 1px solid rgba(224, 232, 243, 0.94);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.97);
  padding: 8px 16px;
  box-shadow: 0 12px 26px rgba(45, 73, 110, 0.07);
  display: flex;
  align-items: center;
  flex: 0 0 280px;
  overflow: hidden;
}

.metric-card header {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-copy {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.metric-card h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #121a28;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-icon {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #edf3fb;
  color: #a5b2c4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.metric-card strong {
  flex: 0 0 auto;
  color: #090e18;
  font-size: 28px;
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: 0;
}

@media (max-width: 1440px) {
  .metric-card {
    width: 270px;
    flex-basis: 270px;
    padding: 8px 14px;
  }
}

@media (max-width: 1180px) {
  .metrics-row {
    gap: 14px;
  }

  .metric-card {
    width: 260px;
    flex-basis: 260px;
  }
}

@media (max-width: 760px) {
  .metrics-row {
    flex-wrap: wrap;
  }
}
</style>
