<template>
  <section class="log-panel">
    <div class="panel-header">
      <h3>{{ section.title }}</h3>
      <button type="button" class="more-button" aria-label="更多">
        <BaseIcon name="more-horizontal" :size="16" />
      </button>
    </div>

    <ul class="log-list">
      <li v-for="entry in section.entries" :key="entry.id" class="log-item">
        <p class="message">{{ entry.message }}</p>
        <div class="meta">
          <span class="time">{{ entry.timestamp }}</span>
          <button v-if="entry.actionLabel" type="button" class="link-button">
            {{ entry.actionLabel }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { LogSection } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "LogPanel",
});

interface LogPanelProps {
  section: LogSection;
}

defineProps<LogPanelProps>();
</script>

<style scoped>
.log-panel {
  border: 1px solid #e4eaf4;
  border-radius: 8px;
  background: #ffffff;
  min-height: 232px;
  padding: 16px 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.panel-header h3 {
  margin: 0;
  padding-left: 12px;
  position: relative;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0;
  color: #141d2e;
}

.panel-header h3::before {
  content: "";
  width: 3px;
  height: 15px;
  border-radius: 2px;
  background: #2f88ff;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.more-button {
  width: 34px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid #cbdcf7;
  color: #3a6ddf;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.log-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.log-item {
  border-radius: 6px;
  padding: 8px 6px 10px;
}

.message {
  margin: 0;
  color: #1d2b42;
  line-height: 1.6;
}

.meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.time {
  color: #9ba8bc;
  font-size: 12px;
}

.link-button {
  border: 0;
  background: transparent;
  color: #2f6ce8;
  font-weight: 600;
  cursor: pointer;
}
</style>
