<template>
  <Teleport to="body">
    <!-- 日志详情使用 Teleport 脱离检测面板裁剪，确保弹窗层级稳定。 -->
    <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
      <section class="run-log-modal" aria-label="检测记录详情">
        <header>
          <div>
            <span>检测记录</span>
            <strong>检测任务记录详情</strong>
          </div>
          <button type="button" aria-label="关闭检测记录" @click="emit('close')">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <div class="modal-table" role="table" aria-label="检测任务记录详情">
          <div class="modal-row modal-head" role="row">
            <span role="columnheader">公司名称</span>
            <span role="columnheader">电站名称</span>
            <span role="columnheader">屋顶名称</span>
            <span role="columnheader">检测开始时间</span>
            <span role="columnheader">检测结束时间</span>
            <span role="columnheader">检测状态</span>
            <span role="columnheader">异常组件数</span>
            <span role="columnheader">是否归档</span>
          </div>
          <div class="modal-body">
            <div v-for="logItem in logs" :key="logItem.id" class="modal-row" role="row">
              <span role="cell" class="text-cell">{{ extraText(logItem, "companyName", "未记录") }}</span>
              <span role="cell" class="text-cell">{{ logItem.stationName || "未记录" }}</span>
              <span role="cell" class="text-cell">{{ logItem.taskName || "未记录" }}</span>
              <span role="cell">{{ logItem.startTime || "未记录" }}</span>
              <span role="cell">{{ finishTimeText(logItem) }}</span>
              <span role="cell">
                <strong class="task-status" :class="taskStatusClass(logItem)">
                  {{ taskStatusText(logItem) }}
                </strong>
              </span>
              <span role="cell">
                <strong class="hotspot-status" :class="countClass(logItem.abnormalCount)">
                  {{ countText(logItem.abnormalCount) }}
                </strong>
              </span>
              <span role="cell">
                <strong class="archive-status" :class="archiveClass(logItem)">
                  {{ archiveText(logItem) }}
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

// 详情弹窗保持只读，所有日志更新都通过父级刷新后重新传入。
interface RunLogDetailModalProps {
  open: boolean;
  logs: RunLogItem[];
}

defineProps<RunLogDetailModalProps>();

const emit = defineEmits<{
  close: [];
}>();


type ExtendedRunLogItem = RunLogItem & {
  companyName?: string | null;
  isSavedToHotspotManagement?: boolean | null;
  taskStatus?: string | null;
};

// 后端日志扩展字段不进入基础类型，展示时在这里做安全读取和文案归一。
const extraText = (logItem: RunLogItem, key: "companyName", fallback: string) => {
  const value = (logItem as ExtendedRunLogItem)[key];
  return value || fallback;
};

const finishTimeText = (logItem: RunLogItem) => {
  return logItem.endTime || "未记录";
};

const taskStatusText = (logItem: RunLogItem) => {
  return (logItem as ExtendedRunLogItem).taskStatus || "检测中";
};

const taskStatusClass = (logItem: RunLogItem) => {
  const taskStatus = taskStatusText(logItem);

  if (taskStatus === "检测完毕") {
    return "finished";
  }

  if (taskStatus === "检测中断") {
    return "interrupted";
  }

  if (taskStatus === "检测失败") {
    return "failed";
  }

  return "running";
};

const countText = (abnormalCount: number | null) => {
  if (abnormalCount === null) {
    return "待确认";
  }

  return `${abnormalCount} 个`;
};

const countClass = (abnormalCount: number | null) => {
  if (abnormalCount === null) {
    return "pending";
  }

  return abnormalCount > 0 ? "danger" : "normal";
};

const archiveText = (logItem: RunLogItem) => {
  return (logItem as ExtendedRunLogItem).isSavedToHotspotManagement ? "已归档" : "未归档";
};

const archiveClass = (logItem: RunLogItem) => {
  return (logItem as ExtendedRunLogItem).isSavedToHotspotManagement ? "saved" : "unsaved";
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
  width: min(1320px, calc(100vw - 64px));
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
  grid-template-columns:
    minmax(140px, 1fr)
    minmax(130px, 0.9fr)
    minmax(120px, 0.82fr)
    minmax(145px, 0.9fr)
    minmax(145px, 0.9fr)
    minmax(86px, 0.58fr)
    minmax(92px, 0.56fr)
    minmax(82px, 0.52fr);
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

.text-cell {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.hotspot-status,
.archive-status,
.task-status {
  width: fit-content;
  min-width: 48px;
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

.archive-status.saved {
  color: #246fd4;
  background: rgba(36, 111, 212, 0.12);
}

.archive-status.unsaved {
  color: #8a6470;
  background: rgba(138, 100, 112, 0.12);
}

.task-status.finished {
  color: #16835f;
  background: rgba(41, 190, 128, 0.12);
}

.task-status.running {
  color: #246fd4;
  background: rgba(36, 111, 212, 0.12);
}

.task-status.interrupted {
  color: #9a6a12;
  background: rgba(247, 169, 40, 0.14);
}

.task-status.failed {
  color: #d72d45;
  background: rgba(255, 91, 110, 0.12);
}
</style>
