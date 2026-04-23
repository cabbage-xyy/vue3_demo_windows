<template>
  <section class="metrics-row">
    <article v-for="metric in metrics" :key="metric.id" class="metric-card">
      <div class="metric-header">
        <h3>{{ metric.title }}</h3>
        <button type="button" class="icon-button" aria-label="更多">
          <BaseIcon name="dot" :size="14" />
        </button>
      </div>
      <p class="metric-value">{{ metric.value }}</p>
      <p class="metric-description">{{ metric.description }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
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
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  min-height: 138px;
  border-radius: 8px;
  border: 1px solid #e4eaf4;
  background: #ffffff;
  padding: 16px 20px;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2f48;
}

.icon-button {
  width: 24px;
  height: 24px;
  border: 1px solid #e4ebf6;
  border-radius: 999px;
  background: #f8fbff;
  color: #8ea1be;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.metric-value {
  margin: 10px 0 8px;
  font-size: 44px;
  line-height: 1;
  font-weight: 700;
  color: #0f1728;
}

.metric-description {
  margin: 0;
  color: #9aa9bf;
  font-size: 12px;
}

@media (max-width: 1400px) {
  .metrics-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
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
}
</style>
