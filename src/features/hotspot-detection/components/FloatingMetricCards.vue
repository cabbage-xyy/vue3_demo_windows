<template>
  <!-- 浮动指标卡片：用于展示更丰富的检测指标，可按 tone 切换视觉强调。 -->
  <section class="metric-cloud" aria-label="检测关键指标">
    <article v-for="metric in metrics" :key="metric.id" class="metric-card" :class="metric.tone">
      <div>
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <p>{{ metric.helper }}</p>
      </div>
      <i v-if="metric.id === 'confidence'" class="metric-ring"></i>
      <i v-else-if="metric.id === 'duration'" class="metric-wave"></i>
      <i v-else-if="metric.id === 'abnormal-module'" class="metric-heat"></i>
      <i v-else class="metric-bar"><b></b></i>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { DetectionMetric } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "FloatingMetricCards",
});

// 指标数据由父级组装，本组件只负责四种 tone 的视觉表达。
interface FloatingMetricCardsProps {
  metrics: DetectionMetric[];
}

defineProps<FloatingMetricCardsProps>();
</script>

<style scoped>
.metric-cloud {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.metric-card {
  min-width: 0;
  min-height: 88px;
  border: 1px solid rgba(218, 230, 246, 0.94);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(246, 250, 255, 0.68)),
    #ffffff;
  padding: 11px 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  box-shadow: 0 14px 30px rgba(47, 78, 124, 0.09);
  backdrop-filter: blur(12px);
}

.metric-card span,
.metric-card p {
  margin: 0;
  color: #71829b;
  font-size: 12px;
  font-weight: 800;
}

.metric-card strong {
  color: #101929;
  font-size: 24px;
  line-height: 1;
}

.metric-ring {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background:
    radial-gradient(circle at center, #ffffff 0 47%, transparent 49%),
    conic-gradient(#2f83ff 0 94%, #e5eefb 94% 100%);
}

.metric-wave {
  width: 52px;
  height: 30px;
  background:
    linear-gradient(135deg, transparent 0 14%, #2f83ff 15% 17%, transparent 18% 30%, #2f83ff 31% 34%, transparent 35% 48%, #2f83ff 49% 52%, transparent 53%);
  opacity: 0.82;
}

.metric-heat {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 58% 45%, rgba(255, 91, 110, 0.95), rgba(247, 169, 40, 0.52) 30%, transparent 56%),
    linear-gradient(135deg, #eaf4ff, #f8fbff);
}

.metric-bar {
  position: relative;
  width: 54px;
  height: 7px;
  border-radius: 999px;
  background: #e6eef9;
  overflow: hidden;
}

.metric-bar b {
  display: block;
  width: 32%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f7a928, #ff5b6e);
}

.metric-card.blue {
  box-shadow: inset 0 3px 0 #3b8cff, 0 16px 32px rgba(47, 78, 124, 0.1);
}

.metric-card.cyan {
  box-shadow: inset 0 3px 0 #1dbbd0, 0 16px 32px rgba(47, 78, 124, 0.1);
}

.metric-card.orange {
  box-shadow: inset 0 3px 0 #f7a928, 0 16px 32px rgba(47, 78, 124, 0.1);
}

.metric-card.red {
  box-shadow: inset 0 3px 0 #ff5b6e, 0 16px 32px rgba(47, 78, 124, 0.1);
}

@media (max-width: 1080px) {
  .metric-cloud {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
