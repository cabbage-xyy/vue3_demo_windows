<template>
  <!-- 诊断信息面板：展示定位结论和关键指标，不触发检测流程副作用。 -->
  <aside class="diagnostic-panel" aria-label="热斑诊断信息">
    <header>
      <span>Diagnosis</span>
      <strong>智能定位结果</strong>
    </header>

    <div class="thermal-card">
      <div class="thermal-map">
        <span class="thermal-core"></span>
      </div>
      <div>
        <p>主异常组件</p>
        <strong>A-03-18</strong>
        <span>温差 18.6°C</span>
      </div>
    </div>

    <div class="insight-list">
      <article v-for="insight in insights" :key="insight.id">
        <span>{{ insight.label }}</span>
        <strong>{{ insight.value }}</strong>
        <em v-if="insight.status">{{ insight.status }}</em>
      </article>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { DiagnosticInsight } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "DiagnosticInsightPanel",
});

// 诊断条目由父级提供，组件只负责卡片化展示。
interface DiagnosticInsightPanelProps {
  insights: DiagnosticInsight[];
}

defineProps<DiagnosticInsightPanelProps>();
</script>

<style scoped>
.diagnostic-panel {
  min-width: 0;
  border: 1px solid rgba(212, 226, 245, 0.68);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.58);
  padding: 14px;
  display: grid;
  gap: 12px;
  box-shadow: 0 18px 42px rgba(45, 84, 132, 0.1);
  backdrop-filter: blur(14px);
}

header {
  display: grid;
  gap: 3px;
}

header span {
  color: #71829b;
  font-size: 11px;
  font-weight: 800;
}

header strong {
  color: #111827;
  font-size: 15px;
}

.thermal-card {
  border-radius: 16px;
  background: rgba(245, 249, 255, 0.62);
  padding: 10px;
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.thermal-map {
  position: relative;
  height: 72px;
  border-radius: 13px;
  background:
    radial-gradient(circle at 58% 42%, rgba(255, 91, 110, 0.92), rgba(247, 169, 40, 0.5) 18%, transparent 34%),
    linear-gradient(135deg, #123b72, #1ca8d0);
  overflow: hidden;
}

.thermal-map::before {
  content: "";
  position: absolute;
  inset: 10px;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px);
  background-size: 18px 16px;
}

.thermal-core {
  position: absolute;
  left: 54%;
  top: 38%;
  width: 13px;
  height: 13px;
  border-radius: 999px;
  background: #ff4058;
  box-shadow: 0 0 0 8px rgba(255, 64, 88, 0.22);
}

.thermal-card p,
.thermal-card span {
  margin: 0;
  color: #71829b;
  font-size: 12px;
  font-weight: 800;
}

.thermal-card strong {
  display: block;
  margin: 5px 0;
  color: #111827;
  font-size: 20px;
}

.insight-list {
  display: grid;
  gap: 8px;
}

.insight-list article {
  min-width: 0;
  border-bottom: 1px solid rgba(224, 232, 243, 0.78);
  padding: 8px 2px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
}

.insight-list article:last-child {
  border-bottom: 0;
}

.insight-list span {
  color: #71829b;
  font-size: 12px;
  font-weight: 800;
}

.insight-list strong {
  color: #172033;
  font-size: 13px;
}

.insight-list em {
  width: fit-content;
  border-radius: 999px;
  background: rgba(255, 91, 110, 0.12);
  color: #d72d45;
  padding: 3px 8px;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
}
</style>
