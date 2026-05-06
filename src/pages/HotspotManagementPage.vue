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
            <input v-model.trim="searchKeyword" type="search" placeholder="搜索检测编号 / 公司 / 电站 / 屋顶 / 缺陷类型" />
          </label>

          <div class="toolbar-actions">

            <select v-model="statusFilter" class="filter-select" aria-label="处理状态筛选">
              <option value="all">全部状态</option>
              <option value="未处理">未处理</option>
              <option value="处理中">处理中</option>
              <option value="已处理">已处理</option>
            </select>

          </div>
        </div>

        <div class="hotspot-table-scroll">
          <table class="hotspot-table" aria-label="热斑检测记录列表">
            <thead>
              <tr class="table-row table-head">
                <th scope="col">检测编号</th>
                <th scope="col">公司名称</th>
                <th scope="col">电站名称</th>
                <th scope="col">屋顶名称</th>
                <th scope="col">检测时间</th>
                <th scope="col">异常组件数</th>
                <th scope="col">缺陷类型</th>
                <th scope="col">处理状态</th>
                <th scope="col">报告状态</th>
                <th scope="col">操作</th>
              </tr>
            </thead>

            <tbody class="table-body">
              <tr v-for="record in filteredRecords" :key="record.id" class="table-row">
                <td class="record-code">
                <button type="button" class="record-link" @click="openRecordDetail(record)">
                  {{ record.detectCode }}
                </button>
                </td>
                <td class="cell-text" :title="record.companyName">{{ record.companyName }}</td>
                <td class="cell-text" :title="record.stationName">{{ record.stationName }}</td>
                <td class="cell-text" :title="record.roofName">{{ record.roofName }}</td>
                <td>{{ record.detectTime }}</td>
                <td class="hotspot-count">{{ record.hotspotComponentCount }}</td>
                <td class="cell-text" :title="record.defectSummary">{{ record.defectSummary }}</td>
                <td><span class="status-pill" :class="record.processStatus">{{ record.processStatus }}</span></td>
                <td><span class="report-pill" :class="record.reportStatus">{{ record.reportStatus }}</span></td>
                <td class="row-actions">
                  <button type="button" aria-label="查看检测记录" @click="openRecordDetail(record)">
                    <BaseIcon name="eye" :size="18" :stroke-width="2.6" />
                  </button>
                  <button type="button" aria-label="删除检测记录" @click="deleteRecord(record.id)">
                    <BaseIcon name="trash" :size="17" :stroke-width="2.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-if="isLoadingRecords" class="empty-state">正在加载热斑检测记录...</p>
          <p v-else-if="filteredRecords.length === 0" class="empty-state">暂无匹配检测记录</p>
        </div>
      </div>
    </section>

    <div v-if="isFormOpen" class="form-overlay" @click.self="closeForm">
      <aside class="form-panel" aria-label="检测记录表单">
        <header>
          <div>
            <p class="eyebrow">Edit</p>
            <h2>编辑热斑检测记录</h2>
          </div>
          <button type="button" class="ghost-icon" aria-label="关闭表单" @click="closeForm">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <form class="hotspot-form" @submit.prevent="saveRecord">
          <label>
            检测编号
            <input v-model.trim="recordForm.detectCode" disabled type="text" />
          </label>
          <label>
            公司名称
            <input v-model.trim="recordForm.companyName" disabled type="text" />
          </label>
          <label>
            电站名称
            <input v-model.trim="recordForm.stationName" disabled type="text" />
          </label>
          <label>
            屋顶名称
            <input v-model.trim="recordForm.roofName" disabled type="text" />
          </label>
          <label>
            检测时间
            <input v-model.trim="recordForm.detectTime" disabled type="text" />
          </label>
          <label>
            异常组件数
            <input v-model.number="recordForm.hotspotComponentCount" min="0" type="number" />
          </label>
          <label>
            缺陷类型
            <input v-model.trim="recordForm.defectSummary" required type="text" />
          </label>
          <label>
            处理状态
            <select v-model="recordForm.processStatus">
              <option value="未处理">未处理</option>
              <option value="处理中">处理中</option>
              <option value="已处理">已处理</option>
            </select>
          </label>
          <label>
            报告状态
            <select v-model="recordForm.reportStatus">
              <option value="未生成">未生成</option>
              <option value="已生成">已生成</option>
            </select>
          </label>
          <label>
            报告路径
            <input v-model.trim="recordForm.reportPath" type="text" />
          </label>

          <button type="submit" class="save-button">保存修改</button>
        </form>
      </aside>
    </div>

    <div v-if="selectedRecord" class="detail-overlay" @click.self="closeRecordDetail">
      <aside class="detail-panel" aria-label="检测记录详情">
        <header>
          <div>
            <h2>{{ selectedRecord.detectCode }}</h2>
          </div>
          <button type="button" class="ghost-icon" aria-label="关闭检测记录详情" @click="closeRecordDetail">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <section class="detail-hero">
          <div>
            <span>异常组件数</span>
            <strong>{{ selectedRecord.hotspotComponentCount }}</strong>
          </div>
          <div>
            <span>处理状态</span>
            <strong class="status-pill" :class="selectedRecord.processStatus">{{ selectedRecord.processStatus }}</strong>
          </div>
          <div>
            <span>报告状态</span>
            <strong class="report-pill" :class="selectedRecord.reportStatus">{{ selectedRecord.reportStatus }}</strong>
          </div>
        </section>

        <section class="detail-section">
          <h3>基础信息</h3>
          <dl class="detail-grid">
            <div>
              <dt>检测编号</dt>
              <dd>{{ selectedRecord.detectCode }}</dd>
            </div>
            <div>
              <dt>公司名称</dt>
              <dd>{{ selectedRecord.companyName }}</dd>
            </div>
            <div>
              <dt>电站名称</dt>
              <dd>{{ selectedRecord.stationName }}</dd>
            </div>
            <div>
              <dt>屋顶名称</dt>
              <dd>{{ selectedRecord.roofName }}</dd>
            </div>
            <div>
              <dt>检测时间</dt>
              <dd>{{ selectedRecord.detectTime }}</dd>
            </div>
            <div>
              <dt>检测耗时</dt>
              <dd>{{ formatDuration(recordDurationValue(selectedRecord)) }}</dd>
            </div>
            <div>
              <dt>检测报告</dt>
              <dd>
                <button
                  type="button"
                  class="report-view-button"
                  :disabled="!selectedRecord.reportPath"
                  @click="openReportFile(selectedRecord)"
                >
                  查看报告
                </button>
              </dd>
            </div>
          </dl>
        </section>

        <section class="detail-section">
          <h3>检测结果</h3>
          <dl class="detail-grid">
            <div>
              <dt>异常组件数</dt>
              <dd>{{ selectedRecord.hotspotComponentCount }}</dd>
            </div>
            <div>
              <dt>缺陷类型</dt>
              <dd>{{ selectedRecord.defectSummary }}</dd>
            </div>
            <div>
              <dt>处理状态</dt>
              <dd>{{ selectedRecord.processStatus }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { invoke } from "@tauri-apps/api/core";
import { computed, onMounted, reactive, ref } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

defineOptions({
  name: "HotspotManagementPage",
});
type HotspotStatus = "未处理" | "处理中" | "已处理";
type ReportStatus = "未生成" | "已生成";

interface HotspotManagementApiRecord {
  id?: number | string | null;
  detectCode?: string | null;
  companyId?: number | string | null;
  companyName?: string | null;
  stationName?: string | null;
  roofId?: number | string | null;
  roofName?: string | null;
  videoPath?: string | null;
  reportPath?: string | null;
  detectTime?: string | null;
  detectDuration?: number | string | null;
  hotspotComponentCount?: number | string | null;
  defectSummary?: string | null;
  processStatus?: string | null;
  reportStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface HotspotRecord {
  id: number;
  detectCode: string;
  companyId?: string;
  companyName: string;
  stationName: string;
  roofId?: string;
  roofName: string;
  videoPath: string;
  reportPath: string;
  detectTime: string;
  detectDuration: string;
  hotspotComponentCount: number;
  defectSummary: string;
  processStatus: HotspotStatus;
  reportStatus: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

type HotspotForm = Omit<HotspotRecord, "id" | "companyId" | "roofId" | "createdAt" | "updatedAt">;

const createEmptyForm = (): HotspotForm => ({
  detectCode: "",
  companyName: "",
  stationName: "",
  roofName: "",
  videoPath: "",
  reportPath: "",
  detectTime: "",
  detectDuration: "0",
  hotspotComponentCount: 0,
  defectSummary: "热斑",
  processStatus: "未处理",
  reportStatus: "已生成",
});

const inspectionRecords = ref<HotspotRecord[]>([]);
const isLoadingRecords = ref(false);
const searchKeyword = ref("");
const statusFilter = ref<HotspotStatus | "all">("all");
const editingRecordId = ref<number | null>(null);
const isFormOpen = ref(false);
const selectedRecord = ref<HotspotRecord | null>(null);
const recordForm = reactive<HotspotForm>(createEmptyForm());

const normalizeProcessStatus = (status: string | null | undefined): HotspotStatus => {
  if (status === "未处理" || status === "处理中" || status === "已处理") {
    return status;
  }

  return "未处理";
};

const normalizeReportStatus = (status: string | null | undefined): ReportStatus => {
  if (status === "已生成" || status === "未生成") {
    return status;
  }

  return "未生成";
};

const formatNullableValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
};

const normalizeHotspotRecord = (record: HotspotManagementApiRecord, index: number): HotspotRecord => {
  const idNumber = Number(record.id);
  const id = Number.isFinite(idNumber) ? idNumber : Date.now() + index;
  const countNumber = Number(record.hotspotComponentCount);

  return {
    id,
    detectCode: record.detectCode || `HS-${id}`,
    companyId: formatNullableValue(record.companyId),
    companyName: record.companyName || "未填写",
    stationName: record.stationName || "未填写",
    roofId: formatNullableValue(record.roofId),
    roofName: record.roofName || "未填写",
    videoPath: record.videoPath || "",
    reportPath: record.reportPath || "",
    detectTime: record.detectTime || "未填写",
    detectDuration: formatNullableValue(record.detectDuration || 0),
    hotspotComponentCount: Number.isFinite(countNumber) ? countNumber : 0,
    defectSummary: record.defectSummary || "热斑",
    processStatus: normalizeProcessStatus(record.processStatus),
    reportStatus: normalizeReportStatus(record.reportStatus),
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
  };
};

const refreshRecordsFromApiRecords = (apiRecords: HotspotManagementApiRecord[]) => {
  inspectionRecords.value = apiRecords.map((record, index) => normalizeHotspotRecord(record, index));
};

const fetchHotspotRecords = async () => {
  isLoadingRecords.value = true;

  try {
    const response = await fetch("http://127.0.0.1:8000/hotspot-management/records");

    if (!response.ok) {
      console.error("获取热斑检测记录失败：", response.status, response.statusText);
      return;
    }

    const result = await response.json();
    const apiRecords = Array.isArray(result.data) ? result.data : [];
    refreshRecordsFromApiRecords(apiRecords);
  } catch (error) {
    console.error("获取热斑检测记录接口调用失败：", error);
  } finally {
    isLoadingRecords.value = false;
  }
};

const filteredRecords = computed(() => {
  const keyword = searchKeyword.value.toLowerCase();

  return inspectionRecords.value.filter((record) => {
    const matchesKeyword = [
      record.detectCode,
      record.companyName,
      record.stationName,
      record.roofName,
      record.defectSummary,
      record.processStatus,
      record.reportStatus,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
    const matchesStatus = statusFilter.value === "all" || record.processStatus === statusFilter.value;

    return matchesKeyword && matchesStatus;
  });
});

const summaryItems = computed(() => {
  const total = inspectionRecords.value.length;
  const handled = inspectionRecords.value.filter((record) => record.processStatus === "已处理").length;

  return [
    { label: "检测记录", value: total.toString().padStart(2, "0") },
    { label: "异常组件总数", value: inspectionRecords.value.reduce((sum, record) => sum + record.hotspotComponentCount, 0) },
    { label: "未处理记录", value: inspectionRecords.value.filter((record) => record.processStatus === "未处理").length },
    { label: "已生成报告", value: inspectionRecords.value.filter((record) => record.reportStatus === "已生成").length || `${total === 0 ? 0 : Math.round((handled / total) * 100)}%` },
  ];
});

const assignForm = (record: HotspotRecord | HotspotForm) => {
  recordForm.detectCode = record.detectCode;
  recordForm.companyName = record.companyName;
  recordForm.stationName = record.stationName;
  recordForm.roofName = record.roofName;
  recordForm.videoPath = record.videoPath;
  recordForm.reportPath = record.reportPath;
  recordForm.detectTime = record.detectTime;
  recordForm.detectDuration = record.detectDuration;
  recordForm.hotspotComponentCount = record.hotspotComponentCount;
  recordForm.defectSummary = record.defectSummary;
  recordForm.processStatus = record.processStatus;
  recordForm.reportStatus = record.reportStatus;
};

const resetForm = () => {
  editingRecordId.value = null;
  assignForm(createEmptyForm());
};

const openEditForm = (record: HotspotRecord) => {
  editingRecordId.value = record.id;
  assignForm(record);
  isFormOpen.value = true;
};

const openRecordDetail = (record: HotspotRecord) => {
  selectedRecord.value = record;
};

const openReportFile = async (record: HotspotRecord) => {
  if (!record.reportPath) {
    window.alert("当前记录暂无检测报告");
    return;
  }

  try {
    await invoke("open_report_file", { path: record.reportPath });
  } catch (error) {
    console.error("打开检测报告失败：", error);
    window.alert("打开检测报告失败，请确认报告文件仍存在");
  }
};

const closeRecordDetail = () => {
  selectedRecord.value = null;
};

const closeForm = () => {
  isFormOpen.value = false;
  resetForm();
};

const saveRecord = async () => {
  if (editingRecordId.value === null) {
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/hotspot-management/records/${editingRecordId.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        process_status: recordForm.processStatus,
        report_status: recordForm.reportStatus,
        report_path: recordForm.reportPath || null,
        defect_summary: recordForm.defectSummary,
        hotspot_component_count: recordForm.hotspotComponentCount,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      window.alert(result.detail || result.message || "热斑检测记录保存失败");
      return;
    }

    const apiRecords = Array.isArray(result.data) ? result.data : [];
    refreshRecordsFromApiRecords(apiRecords);
    resetForm();
    isFormOpen.value = false;
  } catch (error) {
    console.error("保存热斑检测记录接口调用失败：", error);
    window.alert("保存热斑检测记录接口调用失败，请确认后端服务已启动");
  }
};

const deleteRecord = async (recordId: number) => {
  const confirmed = window.confirm("确认删除该热斑检测记录？");

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/hotspot-management/records/${recordId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      window.alert(result.detail || result.message || "热斑检测记录删除失败");
      return;
    }

    const apiRecords = Array.isArray(result.data) ? result.data : [];
    refreshRecordsFromApiRecords(apiRecords);

    if (editingRecordId.value === recordId) {
      resetForm();
      isFormOpen.value = false;
    }

    if (selectedRecord.value?.id === recordId) {
      closeRecordDetail();
    }
  } catch (error) {
    console.error("删除热斑检测记录接口调用失败：", error);
    window.alert("删除热斑检测记录接口调用失败，请确认后端服务已启动");
  }
};

const recordDurationValue = (record: HotspotRecord) => Number(record.detectDuration);

const formatDuration = (duration: number) => {
  if (!Number.isFinite(duration) || duration <= 0) {
    return "未记录";
  }

  return `${duration.toFixed(2)} 分钟`;
};

onMounted(() => {
  void fetchHotspotRecords();
});
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
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
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

.hotspot-table-scroll {
  position: relative;
  min-height: 0;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 8px;
  padding-bottom: 8px;
  scrollbar-color: #b8c7dc #eef3fa;
  scrollbar-width: thin;
}

.hotspot-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0 6px;
  table-layout: auto;
}

.table-body:empty {
  display: none;
}

.hotspot-table-scroll::-webkit-scrollbar {
  height: 10px;
}

.hotspot-table-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: #eef3fa;
}

.hotspot-table-scroll::-webkit-scrollbar-thumb {
  border: 2px solid #eef3fa;
  border-radius: 999px;
  background: #b8c7dc;
}

.hotspot-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #95a9c3;
}

.table-row {
  min-height: 48px;
  font-size: 14px;
}

.table-row > th,
.table-row > td {
  height: 48px;
  border-top: 1px solid rgba(224, 232, 243, 0.85);
  border-bottom: 1px solid rgba(224, 232, 243, 0.85);
  background: #ffffff;
  padding: 6px 20px 6px 0;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.table-row > th:first-child,
.table-row > td:first-child {
  border-left: 1px solid rgba(224, 232, 243, 0.85);
  border-radius: 8px 0 0 8px;
  padding-left: 10px;
}

.table-row > th:last-child,
.table-row > td:last-child {
  position: sticky;
  right: 0;
  z-index: 2;
  border-right: 1px solid rgba(224, 232, 243, 0.85);
  border-radius: 0 8px 8px 0;
  padding: 6px 12px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.76), #ffffff 18px),
    #ffffff;
  box-shadow: -12px 0 18px rgba(255, 255, 255, 0.88);
}

.table-head {
  min-height: 32px;
  color: #70839f;
  font-size: 12px;
  font-weight: 700;
}

.table-head > th {
  height: 32px;
  background: #f5f8fd;
  font: inherit;
}

.table-head th:last-child {
  z-index: 3;
  background:
    linear-gradient(90deg, rgba(245, 248, 253, 0.72), #f5f8fd 18px),
    #f5f8fd;
  text-align: center;
}

.record-code {
  min-width: 0;
}

.cell-text {
  white-space: nowrap;
}

.record-link {
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

.status-pill,
.report-pill {
  width: max-content;
  min-width: 56px;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}


.status-pill.未处理 {
  background: #eef3fb;
  color: #58708f;
}

.status-pill.处理中 {
  background: #e6f8ee;
  color: #07965e;
}

.status-pill.已处理 {
  background: #e9f2ff;
  color: #246fd4;
}

.report-pill.未生成 {
  background: #fff1d7;
  color: #b66d00;
}

.report-pill.已生成 {
  background: #e9f2ff;
  color: #246fd4;
}

.row-actions {
  min-width: 82px;
  text-align: center;
  white-space: nowrap;
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

.row-actions button + button {
  margin-left: 12px;
}

.row-actions button:hover,
.ghost-icon:hover {
  color: #1f66ed;
}

.empty-state {
  position: absolute;
  inset: 38px 0 0;
  margin: 0;
  color: #7d8da5;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.form-overlay {
  justify-content: flex-end;
}

.detail-overlay {
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.form-panel {
  width: min(440px, 92vw);
  height: 100%;
  background: #ffffff;
  box-shadow: -18px 0 38px rgba(18, 31, 51, 0.16);
  padding: 24px;
  overflow-y: auto;
}

.detail-panel {
  width: min(980px, 92vw);
  max-height: min(760px, 86vh);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(18, 31, 51, 0.22);
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
  min-height: 50px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.detail-hero span,
.detail-grid dt {
  flex: 0 0 auto;
  color: #71829b;
  font-size: 12px;
  font-weight: 800;
}

.detail-hero strong {
  display: inline-flex;
  margin-top: 0;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.detail-grid dd {
  min-width: 0;
  margin: 0;
  color: #172033;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  text-align: right;
  overflow-wrap: anywhere;
}

.report-view-button {
  height: 32px;
  border: 1px solid rgba(36, 111, 212, 0.24);
  border-radius: 999px;
  background: #e9f2ff;
  color: #246fd4;
  padding: 0 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.report-view-button:hover,
.report-view-button:focus-visible {
  border-color: rgba(36, 111, 212, 0.44);
  background: #dcecff;
  outline: none;
}

.report-view-button:disabled {
  background: #eef3fb;
  color: #7c8da5;
  cursor: not-allowed;
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

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .summary-grid,
  .detail-hero {
    grid-template-columns: 1fr;
  }

  .detail-overlay {
    padding: 12px;
  }

  .detail-panel {
    width: 100%;
    max-height: 90vh;
  }
}

@media (min-width: 1180px) {
  .detail-panel {
    width: min(1120px, 88vw);
  }

  .detail-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
