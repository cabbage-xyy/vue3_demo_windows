<template>
  <section class="metrics-row">
    <article v-for="metric in metrics" :key="metric.id" class="metric-card">
      <div class="metric-copy">
        <h3>{{ metric.title }}</h3>
      </div>
      <strong class="metric-value">{{ metric.value }}</strong>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { MetricCard } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "MetricsRow",
});

interface MetricsRowProps {
  metrics: MetricCard[];
}

defineProps<MetricsRowProps>();
</script>

<style scoped>
.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.metric-card {
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(224, 232, 243, 0.86);
  background: rgba(255, 255, 255, 0.78);
  padding: 6px 10px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.metric-copy {
  min-width: 0;
}

.metric-copy h3 {
  margin: 0;
  font-size: 12px;
  color: #1f2f48;
  white-space: nowrap;
}

.metric-value {
  color: #0f1728;
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0;
}

@media (max-width: 960px) {
  .metrics-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }

  .metric-card {
    min-height: 54px;
  }
}
</style>
