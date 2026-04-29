<template>
  <section class="hotspot-management-page">
    <section class="summary-grid" aria-label="热斑治理概览">
      <article v-for="item in summaryItems" :key="item.label" class="summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section class="workspace" aria-label="热斑检测记录台账">
      <div class="table-panel">
        <div class="toolbar">
          <label class="search-box">
            <BaseIcon name="search" :size="16" />
            <input v-model.trim="searchKeyword" type="search" placeholder="搜索检测编号 / 电站 / 屋顶 / 负责人" />
          </label>

          <div class="toolbar-actions">
            <select v-model="severityFilter" class="filter-select" aria-label="风险等级筛选">
              <option value="all">全部等级</option>
              <option value="高风险">高风险</option>
              <option value="中风险">中风险</option>
              <option value="低风险">低风险</option>
            </select>

            <select v-model="statusFilter" class="filter-select" aria-label="处理状态筛选">
              <option value="all">全部状态</option>
              <option value="待复核">待复核</option>
              <option value="处理中">处理中</option>
              <option value="已闭环">已闭环</option>
            </select>

            <button type="button" class="primary-command" @click="openCreateForm">
              <BaseIcon name="plus" :size="16" />
              新增记录
            </button>
          </div>
        </div>

        <div class="hotspot-table" role="table" aria-label="热斑检测记录列表">
          <div class="table-row table-head" role="row">
            <span role="columnheader">检测编号</span>
            <span role="columnheader">所属电站</span>
            <span role="columnheader">屋顶区域</span>
            <span role="columnheader">检测时间</span>
            <span role="columnheader">热斑数</span>
            <span role="columnheader">最高风险</span>
            <span role="columnheader">处理状态</span>
            <span role="columnheader">负责人</span>
            <span role="columnheader">操作</span>
          </div>

          <div class="table-body">
            <div v-for="record in filteredRecords" :key="record.id" class="table-row" role="row">
              <div class="record-code" role="cell">
                <button type="button" class="record-link" @click="openRecordDetail(record)">
                  {{ record.code }}
                </button>
              </div>
              <span role="cell">{{ record.station }}</span>
              <span role="cell">{{ record.roof }}</span>
              <span role="cell">{{ record.inspectedAt }}</span>
              <strong role="cell" class="hotspot-count">{{ record.hotspots.length }}</strong>
              <span role="cell" class="severity-pill" :class="record.maxSeverity">{{ record.maxSeverity }}</span>
              <span role="cell" class="status-pill" :class="record.status">{{ record.status }}</span>
              <span role="cell">{{ record.owner }}</span>
              <div class="row-actions" role="cell">
                <button type="button" aria-label="编辑检测记录" @click="openEditForm(record)">
                  <BaseIcon name="edit" :size="18" :stroke-width="2.6" />
                </button>
                <button type="button" aria-label="删除检测记录" @click="deleteRecord(record.id)">
                  <BaseIcon name="trash" :size="17" :stroke-width="2.5" />
                </button>
              </div>
            </div>
          </div>

          <p v-if="filteredRecords.length === 0" class="empty-state">暂无匹配检测记录</p>
        </div>
      </div>
    </section>

    <div v-if="isFormOpen" class="form-overlay" @click.self="closeForm">
      <aside class="form-panel" aria-label="检测记录表单">
        <header>
          <div>
            <p class="eyebrow">{{ formMode === "create" ? "Create" : "Edit" }}</p>
            <h2>{{ formMode === "create" ? "新增检测记录" : "编辑检测记录" }}</h2>
          </div>
          <button type="button" class="ghost-icon" aria-label="关闭表单" @click="closeForm">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <form class="hotspot-form" @submit.prevent="saveRecord">
          <label>
            检测编号
            <input v-model.trim="recordForm.code" required type="text" />
          </label>
          <label>
            所属电站
            <input v-model.trim="recordForm.station" required type="text" />
          </label>
          <label>
            屋顶区域
            <input v-model.trim="recordForm.roof" required type="text" />
          </label>
          <label>
            检测时间
            <input v-model.trim="recordForm.inspectedAt" required type="text" />
          </label>
          <label>
            最高风险
            <select v-model="recordForm.maxSeverity">
              <option value="高风险">高风险</option>
              <option value="中风险">中风险</option>
              <option value="低风险">低风险</option>
            </select>
          </label>
          <label>
            处理状态
            <select v-model="recordForm.status">
              <option value="待复核">待复核</option>
              <option value="处理中">处理中</option>
              <option value="已闭环">已闭环</option>
            </select>
          </label>
          <label>
            负责人
            <input v-model.trim="recordForm.owner" required type="text" />
          </label>
          <label>
            热斑点位概述
            <input v-model.trim="recordForm.hotspotSummary" required type="text" />
          </label>

          <button type="submit" class="save-button">
            {{ formMode === "create" ? "创建记录" : "保存修改" }}
          </button>
        </form>
      </aside>
    </div>

    <div v-if="selectedRecord" class="detail-overlay" @click.self="closeRecordDetail">
      <aside class="detail-panel" aria-label="检测记录详情">
        <header>
          <div>
            <p class="eyebrow">Inspection detail</p>
            <h2>{{ selectedRecord.code }}</h2>
            <span class="detail-code">{{ selectedRecord.station }} · {{ selectedRecord.roof }}</span>
          </div>
          <button type="button" class="ghost-icon" aria-label="关闭检测记录详情" @click="closeRecordDetail">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <section class="detail-hero">
          <div>
            <span>最高风险</span>
            <strong class="severity-pill" :class="selectedRecord.maxSeverity">{{ selectedRecord.maxSeverity }}</strong>
          </div>
          <div>
            <span>处理状态</span>
            <strong class="status-pill" :class="selectedRecord.status">{{ selectedRecord.status }}</strong>
          </div>
          <div>
            <span>热斑数量</span>
            <strong>{{ selectedRecord.hotspots.length }}</strong>
          </div>
        </section>

        <section class="detail-section">
          <h3>基础信息</h3>
          <dl class="detail-grid">
            <div>
              <dt>检测编号</dt>
              <dd>{{ selectedRecord.code }}</dd>
            </div>
            <div>
              <dt>所属电站</dt>
              <dd>{{ selectedRecord.station }}</dd>
            </div>
            <div>
              <dt>屋顶区域</dt>
              <dd>{{ selectedRecord.roof }}</dd>
            </div>
            <div>
              <dt>检测时间</dt>
              <dd>{{ selectedRecord.inspectedAt }}</dd>
            </div>
            <div>
              <dt>负责人</dt>
              <dd>{{ selectedRecord.owner }}</dd>
            </div>
            <div>
              <dt>处置建议</dt>
              <dd>{{ selectedRecord.remediation }}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section">
          <h3>热斑明细</h3>
          <div class="hotspot-detail-list">
            <article v-for="hotspot in selectedRecord.hotspots" :key="hotspot.id" class="hotspot-detail-card">
              <div>
                <strong>{{ hotspot.module }}</strong>
                <span class="severity-pill" :class="hotspot.severity">{{ hotspot.severity }}</span>
              </div>
              <dl>
                <div>
                  <dt>温差</dt>
                  <dd>{{ hotspot.temperatureDelta }}</dd>
                </div>
                <div>
                  <dt>置信度</dt>
                  <dd>{{ hotspot.confidence }}</dd>
                </div>
                <div>
                  <dt>定位帧</dt>
                  <dd>{{ hotspot.frame }}</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

defineOptions({
  name: "HotspotManagementPage",
});

type HotspotSeverity = "高风险" | "中风险" | "低风险";
type HotspotStatus = "待复核" | "处理中" | "已闭环";

interface HotspotRecord {
  id: number;
  module: string;
  temperatureDelta: string;
  severity: HotspotSeverity;
  confidence: string;
  frame: string;
}

interface InspectionRecord {
  id: number;
  code: string;
  station: string;
  roof: string;
  inspectedAt: string;
  maxSeverity: HotspotSeverity;
  status: HotspotStatus;
  owner: string;
  hotspots: HotspotRecord[];
  hotspotSummary: string;
  remediation: string;
}

type InspectionForm = Omit<InspectionRecord, "id" | "hotspots" | "remediation">;
type FormMode = "create" | "edit";

const createEmptyForm = (): InspectionForm => ({
  code: "",
  station: "",
  roof: "",
  inspectedAt: "",
  maxSeverity: "中风险",
  status: "待复核",
  owner: "",
  hotspotSummary: "",
});

const inspectionRecords = ref<InspectionRecord[]>([
  {
    id: 1,
    code: "INSP-JX-20260429-001",
    station: "嘉兴一号屋顶光伏电站",
    roof: "屋顶 A 区",
    inspectedAt: "2026-04-29 09:12",
    maxSeverity: "高风险",
    status: "处理中",
    owner: "刘海鑫",
    hotspotSummary: "A-03-18、A-03-24 共 2 处热斑",
    hotspots: [
      { id: 101, module: "A-03-18", temperatureDelta: "18.6°C", severity: "高风险", confidence: "94%", frame: "00:37" },
      { id: 102, module: "A-03-24", temperatureDelta: "15.2°C", severity: "中风险", confidence: "89%", frame: "00:41" },
    ],
    remediation: "安排无人机复核并同步工单，优先检查旁路二极管与接线端子。",
  },
  {
    id: 2,
    code: "INSP-XJ-20260428-025",
    station: "巴州戈壁集中式电站",
    roof: "阵列 B-12",
    inspectedAt: "2026-04-28 16:40",
    maxSeverity: "中风险",
    status: "待复核",
    owner: "陈卓",
    hotspotSummary: "B-12-07 共 1 处热斑",
    hotspots: [
      { id: 201, module: "B-12-07", temperatureDelta: "11.4°C", severity: "中风险", confidence: "86%", frame: "01:12" },
    ],
    remediation: "纳入下一轮巡检计划，复核热像帧与组件遮挡情况。",
  },
  {
    id: 3,
    code: "INSP-SN-20260426-013",
    station: "苏南工业园分布式电站",
    roof: "研发楼 R 区",
    inspectedAt: "2026-04-26 11:20",
    maxSeverity: "低风险",
    status: "已闭环",
    owner: "王琪",
    hotspotSummary: "R-02-31、R-02-36 共 2 处热斑",
    hotspots: [
      { id: 301, module: "R-02-31", temperatureDelta: "7.8°C", severity: "低风险", confidence: "81%", frame: "00:28" },
      { id: 302, module: "R-02-36", temperatureDelta: "6.9°C", severity: "低风险", confidence: "78%", frame: "00:31" },
    ],
    remediation: "已完成清洗和复测，温差恢复到观察阈值以内。",
  },
  {
    id: 4,
    code: "INSP-HY-20260425-006",
    station: "海盐组件测试电站",
    roof: "测试棚 T 区",
    inspectedAt: "2026-04-25 14:06",
    maxSeverity: "高风险",
    status: "待复核",
    owner: "赵宁",
    hotspotSummary: "T-08-14、T-08-15、T-09-02 共 3 处热斑",
    hotspots: [
      { id: 401, module: "T-08-14", temperatureDelta: "21.2°C", severity: "高风险", confidence: "96%", frame: "02:04" },
      { id: 402, module: "T-08-15", temperatureDelta: "17.5°C", severity: "高风险", confidence: "91%", frame: "02:06" },
      { id: 403, module: "T-09-02", temperatureDelta: "10.1°C", severity: "中风险", confidence: "84%", frame: "02:18" },
    ],
    remediation: "建议立即停用对应支路并进行现场排查。",
  },
  {
    id: 5,
    code: "INSP-NB-20260424-018",
    station: "宁波湾区屋顶电站",
    roof: "仓储楼 C 区",
    inspectedAt: "2026-04-24 10:18",
    maxSeverity: "中风险",
    status: "处理中",
    owner: "周航",
    hotspotSummary: "C-05-22 共 1 处热斑",
    hotspots: [
      { id: 501, module: "C-05-22", temperatureDelta: "13.5°C", severity: "中风险", confidence: "88%", frame: "01:46" },
    ],
    remediation: "已派发检修工单，等待复测结果回填。",
  },
  {
    id: 6,
    code: "INSP-CZ-20260422-032",
    station: "常州高新区分布式电站",
    roof: "厂房 D 区",
    inspectedAt: "2026-04-22 15:32",
    maxSeverity: "低风险",
    status: "已闭环",
    owner: "林澈",
    hotspotSummary: "D-09-03 共 1 处热斑",
    hotspots: [
      { id: 601, module: "D-09-03", temperatureDelta: "6.4°C", severity: "低风险", confidence: "76%", frame: "00:54" },
    ],
    remediation: "复核为短时阴影影响，已归档。",
  },
  {
    id: 7,
    code: "INSP-SX-20260421-011",
    station: "绍兴纺织园光伏电站",
    roof: "织造车间 A 区",
    inspectedAt: "2026-04-21 09:46",
    maxSeverity: "高风险",
    status: "处理中",
    owner: "许诺",
    hotspotSummary: "A-11-09、A-11-12 共 2 处热斑",
    hotspots: [
      { id: 701, module: "A-11-09", temperatureDelta: "16.9°C", severity: "高风险", confidence: "92%", frame: "01:09" },
      { id: 702, module: "A-11-12", temperatureDelta: "12.8°C", severity: "中风险", confidence: "85%", frame: "01:15" },
    ],
    remediation: "建议更换异常组件并复核同串组件温升。",
  },
  {
    id: 8,
    code: "INSP-HZ-20260419-029",
    station: "湖州物流园储能光伏站",
    roof: "物流仓 E 区",
    inspectedAt: "2026-04-19 13:58",
    maxSeverity: "中风险",
    status: "待复核",
    owner: "唐亦",
    hotspotSummary: "E-04-27、E-05-02 共 2 处热斑",
    hotspots: [
      { id: 801, module: "E-04-27", temperatureDelta: "9.2°C", severity: "中风险", confidence: "83%", frame: "00:47" },
      { id: 802, module: "E-05-02", temperatureDelta: "8.6°C", severity: "低风险", confidence: "79%", frame: "00:52" },
    ],
    remediation: "等待下一次无人机巡检自动比对。",
  },
]);

const searchKeyword = ref("");
const severityFilter = ref<HotspotSeverity | "all">("all");
const statusFilter = ref<HotspotStatus | "all">("all");
const formMode = ref<FormMode>("create");
const editingRecordId = ref<number | null>(null);
const isFormOpen = ref(false);
const selectedRecord = ref<InspectionRecord | null>(null);
const recordForm = reactive<InspectionForm>(createEmptyForm());

const filteredRecords = computed(() => {
  const keyword = searchKeyword.value.toLowerCase();

  return inspectionRecords.value.filter((record) => {
    const matchesKeyword = [record.code, record.station, record.roof, record.owner, record.hotspotSummary]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
    const matchesSeverity = severityFilter.value === "all" || record.maxSeverity === severityFilter.value;
    const matchesStatus = statusFilter.value === "all" || record.status === statusFilter.value;

    return matchesKeyword && matchesSeverity && matchesStatus;
  });
});

const summaryItems = computed(() => [
  { label: "检测记录", value: inspectionRecords.value.length.toString().padStart(2, "0") },
  { label: "热斑总数", value: inspectionRecords.value.reduce((total, record) => total + record.hotspots.length, 0) },
  { label: "高风险记录", value: inspectionRecords.value.filter((record) => record.maxSeverity === "高风险").length },
  { label: "闭环率", value: `${Math.round((inspectionRecords.value.filter((record) => record.status === "已闭环").length / inspectionRecords.value.length) * 100)}%` },
]);

const assignForm = (record: InspectionForm) => {
  recordForm.code = record.code;
  recordForm.station = record.station;
  recordForm.roof = record.roof;
  recordForm.inspectedAt = record.inspectedAt;
  recordForm.maxSeverity = record.maxSeverity;
  recordForm.status = record.status;
  recordForm.owner = record.owner;
  recordForm.hotspotSummary = record.hotspotSummary;
};

const resetForm = () => {
  formMode.value = "create";
  editingRecordId.value = null;
  assignForm(createEmptyForm());
};

const openCreateForm = () => {
  resetForm();
  isFormOpen.value = true;
};

const openEditForm = (record: InspectionRecord) => {
  formMode.value = "edit";
  editingRecordId.value = record.id;
  assignForm(record);
  isFormOpen.value = true;
};

const openRecordDetail = (record: InspectionRecord) => {
  selectedRecord.value = record;
};

const closeRecordDetail = () => {
  selectedRecord.value = null;
};

const closeForm = () => {
  isFormOpen.value = false;
  resetForm();
};

const saveRecord = () => {
  if (formMode.value === "edit" && editingRecordId.value !== null) {
    const recordIndex = inspectionRecords.value.findIndex((record) => record.id === editingRecordId.value);

    if (recordIndex >= 0) {
      const currentRecord = inspectionRecords.value[recordIndex];

      if (!currentRecord) {
        return;
      }

      inspectionRecords.value[recordIndex] = {
        ...currentRecord,
        ...recordForm,
        id: editingRecordId.value,
      };
    }
  } else {
    inspectionRecords.value.unshift({
      id: Date.now(),
      ...recordForm,
      hotspots: [
        { id: Date.now() + 1, module: "待复核组件", temperatureDelta: "待复核", severity: recordForm.maxSeverity, confidence: "待识别", frame: "待定位" },
      ],
      remediation: "待生成闭环建议，请完成复核后补充处置策略。",
    });
  }

  resetForm();
  isFormOpen.value = false;
};

const deleteRecord = (recordId: number) => {
  const confirmed = window.confirm("确认删除该检测记录？");

  if (!confirmed) {
    return;
  }

  inspectionRecords.value = inspectionRecords.value.filter((record) => record.id !== recordId);

  if (editingRecordId.value === recordId) {
    resetForm();
  }

  if (selectedRecord.value?.id === recordId) {
    closeRecordDetail();
  }
};
</script>

<style scoped>
.hotspot-management-page {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  overflow: hidden;
}

.workspace,
.summary-card {
  border: 1px solid rgba(224, 232, 243, 0.92);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 42px rgba(50, 71, 101, 0.08);
}

.eyebrow {
  margin: 0 0 6px;
  color: #7c8da5;
  font-size: 12px;
  font-weight: 700;
}

.form-panel h2 {
  margin: 0;
  color: #111827;
}

.primary-command,
.save-button {
  border: 1px solid rgba(31, 102, 237, 0.72);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 46%),
    linear-gradient(135deg, #3b98ff 0%, #1f66ed 100%);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 12px 22px rgba(35, 105, 239, 0.22);
  font-weight: 700;
  cursor: pointer;
}

.primary-command {
  height: 40px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-card {
  min-height: 50px;
  border-radius: 8px;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-card span {
  color: #7b8ba2;
  font-size: 13px;
  font-weight: 700;
}

.summary-card strong {
  color: #0f1728;
  font-size: 22px;
  line-height: 1;
}

.workspace {
  min-height: 0;
  border-radius: 8px;
  padding: 10px 10px 12px;
  overflow: hidden;
}

.table-panel {
  min-width: 0;
  display: grid;
  grid-template-rows: auto auto;
  gap: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-right: 14px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.search-box {
  flex: 1;
  min-width: 220px;
  height: 36px;
  border: 1px solid #dbe5f2;
  border-radius: 999px;
  background: #f8fbff;
  color: #7889a2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
}

.search-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1f2c42;
  font: inherit;
}

.filter-select {
  height: 36px;
  min-width: 116px;
  border: 1px solid #dbe5f2;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.9)),
    #f8fbff;
  color: #26364f;
  padding: 0 34px 0 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 8px 18px rgba(47, 91, 150, 0.08);
  cursor: pointer;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #58708f 50%),
    linear-gradient(135deg, #58708f 50%, transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.9));
  background-position:
    calc(100% - 18px) 14px,
    calc(100% - 12px) 14px,
    0 0;
  background-size:
    6px 6px,
    6px 6px,
    100% 100%;
  background-repeat: no-repeat;
}

.hotspot-table {
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto;
  align-content: start;
  gap: 6px;
  overflow: hidden;
  border-radius: 8px;
}

.table-body {
  min-height: 0;
  max-height: 464px;
  display: grid;
  align-content: start;
  gap: 6px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0;
  scrollbar-width: none;
}

.table-body::-webkit-scrollbar {
  display: none;
}

.table-row {
  min-height: 48px;
  border: 1px solid rgba(224, 232, 243, 0.85);
  border-radius: 8px;
  background: #ffffff;
  display: grid;
  grid-template-columns: minmax(190px, 1.25fr) minmax(190px, 1.2fr) minmax(120px, 0.8fr) minmax(138px, 0.86fr) minmax(70px, 0.45fr) minmax(92px, 0.6fr) minmax(92px, 0.6fr) minmax(88px, 0.58fr) 82px;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  font-size: 14px;
}

.table-head {
  min-height: 32px;
  color: #70839f;
  background: #f5f8fd;
  font-size: 12px;
  font-weight: 700;
}

.table-head span:last-child {
  text-align: center;
}

.record-code {
  min-width: 0;
}

.record-link {
  max-width: 100%;
  border: 0;
  background: transparent;
  color: #182438;
  padding: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-link:hover,
.record-link:focus-visible {
  color: #1f66ed;
  text-decoration: underline;
  text-underline-offset: 4px;
  outline: none;
}

.hotspot-count {
  color: #0f1728;
  font-size: 16px;
  font-weight: 900;
}

.severity-pill,
.status-pill {
  width: max-content;
  min-width: 56px;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.severity-pill.高风险 {
  background: #ffe8ec;
  color: #c9364b;
}

.severity-pill.中风险 {
  background: #fff1d7;
  color: #b66d00;
}

.severity-pill.低风险 {
  background: #e8f6ff;
  color: #1b6ec8;
}

.status-pill.待复核 {
  background: #eef3fb;
  color: #58708f;
}

.status-pill.处理中 {
  background: #e6f8ee;
  color: #07965e;
}

.status-pill.已闭环 {
  background: #e9f2ff;
  color: #246fd4;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.row-actions button,
.ghost-icon {
  border: 0;
  background: transparent;
  color: #101827;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.row-actions button:hover,
.ghost-icon:hover {
  color: #1f66ed;
}

.empty-state {
  margin: 18px 0 0;
  color: #7d8da5;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
}

.form-overlay,
.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(15, 23, 38, 0.28);
  display: flex;
  justify-content: flex-end;
}

.form-panel,
.detail-panel {
  width: min(440px, 92vw);
  height: 100%;
  background: #ffffff;
  box-shadow: -18px 0 38px rgba(18, 31, 51, 0.16);
  padding: 24px;
  overflow-y: auto;
}

.form-panel header,
.detail-panel header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.hotspot-form {
  display: grid;
  gap: 12px;
}

.hotspot-form label {
  color: #64748b;
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
}

.hotspot-form input,
.hotspot-form select {
  height: 38px;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #f8fbff;
  color: #162033;
  padding: 0 12px;
  font: inherit;
}

.save-button {
  height: 42px;
  margin-top: 6px;
}

.detail-code {
  color: #7c8da5;
  display: inline-flex;
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
}

.detail-hero {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 18px;
}

.detail-hero div,
.detail-grid div {
  border: 1px solid rgba(224, 232, 243, 0.86);
  border-radius: 8px;
  background: #f8fbff;
  padding: 10px;
}

.detail-hero span,
.detail-grid dt {
  color: #71829b;
  font-size: 12px;
  font-weight: 800;
}

.detail-hero strong {
  display: block;
  margin-top: 8px;
  color: #101827;
  font-size: 17px;
}

.detail-section h3 {
  margin: 0 0 10px;
  color: #101827;
  font-size: 16px;
}

.detail-grid {
  margin: 0;
  display: grid;
  gap: 8px;
}

.detail-grid dd {
  margin: 6px 0 0;
  color: #172033;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.hotspot-detail-list {
  display: grid;
  gap: 8px;
}

.hotspot-detail-card {
  border: 1px solid rgba(224, 232, 243, 0.86);
  border-radius: 8px;
  background: #ffffff;
  padding: 10px;
  display: grid;
  gap: 10px;
}

.hotspot-detail-card > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.hotspot-detail-card > div strong {
  color: #101827;
  font-size: 15px;
}

.hotspot-detail-card dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.hotspot-detail-card dl div {
  min-width: 0;
  border: 1px solid rgba(224, 232, 243, 0.72);
  border-radius: 8px;
  background: #f8fbff;
  padding: 8px;
}

.hotspot-detail-card dt,
.hotspot-detail-card dd {
  margin: 0;
}

.hotspot-detail-card dt {
  color: #71829b;
  font-size: 12px;
  font-weight: 800;
}

.hotspot-detail-card dd {
  margin-top: 5px;
  color: #172033;
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 1280px) {
  .table-row {
    grid-template-columns: minmax(180px, 1.2fr) minmax(170px, 1.12fr) minmax(104px, 0.72fr) minmax(122px, 0.8fr) minmax(64px, 0.42fr) minmax(86px, 0.56fr) minmax(86px, 0.56fr) minmax(78px, 0.52fr) 76px;
    gap: 8px;
    font-size: 13px;
  }
}

@media (max-width: 980px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
    padding-right: 0;
  }

  .toolbar-actions {
    margin-left: 0;
    flex-wrap: wrap;
  }
}

@media (max-width: 720px) {
  .summary-grid,
  .detail-hero {
    grid-template-columns: 1fr;
  }
}
</style>
