<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
      <section class="run-log-modal" aria-label="运行日志详情">
        <header>
          <div>
            <span>运行日志</span>
            <strong>热斑检测完整记录</strong>
          </div>
          <button type="button" aria-label="关闭运行日志" @click="emit('close')">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <div class="modal-table" role="table" aria-label="热斑检测完整运行日志">
          <div class="modal-row modal-head" role="row">
            <span role="columnheader">任务</span>
            <span role="columnheader">开始时间</span>
            <span role="columnheader">结束时间</span>
            <span role="columnheader">是否出现热斑</span>
          </div>
          <div class="modal-body">
            <div v-for="logItem in logs" :key="logItem.id" class="modal-row" role="row">
              <span role="cell">{{ logItem.taskName }}</span>
              <span role="cell">{{ logItem.startTime }}</span>
              <span role="cell">{{ logItem.endTime ?? "检测中" }}</span>
              <span role="cell">
                <strong class="hotspot-status" :class="statusClass(logItem.hasHotspot)">
                  {{ statusText(logItem.hasHotspot) }}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { RunLogItem } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "RunLogDetailModal",
});

interface RunLogDetailModalProps {
  open: boolean;
  logs: RunLogItem[];
}

defineProps<RunLogDetailModalProps>();

const emit = defineEmits<{
  close: [];
}>();

const statusText = (hasHotspot: boolean | null) => {
  if (hasHotspot === null) {
    return "待确认";
  }

  return hasHotspot ? "是" : "否";
};

const statusClass = (hasHotspot: boolean | null) => {
  if (hasHotspot === null) {
    return "pending";
  }

  return hasHotspot ? "danger" : "normal";
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(17, 27, 43, 0.28);
  display: grid;
  place-items: center;
  padding: 28px;
}

.run-log-modal {
  width: min(1120px, calc(100vw - 64px));
  height: min(640px, calc(100vh - 96px));
  min-height: 0;
  border: 1px solid rgba(216, 226, 241, 0.96);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 255, 0.94)),
    #ffffff;
  box-shadow: 0 26px 72px rgba(26, 43, 70, 0.24);
  padding: 16px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

header div {
  display: grid;
  gap: 4px;
}

header span {
  color: #7d8da5;
  font-size: 13px;
  font-weight: 800;
}

header strong {
  color: #142039;
  font-size: 18px;
}

header button {
  width: 34px;
  height: 34px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #ffffff;
  color: #52647f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-table {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
  overflow: hidden;
}

.modal-body {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.modal-row {
  min-height: 46px;
  border-radius: 10px;
  background: #f7faff;
  display: grid;
  grid-template-columns: minmax(180px, 1.2fr) minmax(160px, 1fr) minmax(160px, 1fr) minmax(130px, 0.7fr);
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  color: #2b3850;
  font-size: 13px;
  font-weight: 800;
}

.modal-head {
  color: #7d8da5;
}

.hotspot-status {
  width: fit-content;
  min-width: 44px;
  border-radius: 999px;
  display: inline-flex;
  justify-content: center;
  padding: 4px 10px;
}

.hotspot-status.danger {
  color: #d72d45;
  background: rgba(255, 91, 110, 0.12);
}

.hotspot-status.normal {
  color: #16835f;
  background: rgba(41, 190, 128, 0.12);
}

.hotspot-status.pending {
  color: #9a6a12;
  background: rgba(247, 169, 40, 0.14);
}
</style>
