<template>
  <section class="station-page">
    <section class="summary-grid" aria-label="电站概览">
      <article v-for="item in summaryItems" :key="item.label" class="summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section class="workspace">
      <div class="table-panel">
        <div class="toolbar">
          <label class="search-box">
            <BaseIcon name="search" :size="16" />
            <input v-model.trim="searchKeyword" type="search" placeholder="搜索电站名称 / 区域 / 负责人" />
          </label>

          <div class="toolbar-actions">
            <select v-model="statusFilter" class="status-filter" aria-label="状态筛选">
              <option value="all">全部状态</option>
              <option value="运行中">运行中</option>
              <option value="维护中">维护中</option>
              <option value="离线">离线</option>
            </select>

            <button type="button" class="primary-command" @click="openCreateForm">
              <BaseIcon name="plus" :size="16" />
              新增电站
            </button>
          </div>
        </div>

        <div class="station-table" role="table" aria-label="电站列表">
          <div class="table-row table-head" role="row">
            <span role="columnheader">电站名称</span>
            <span role="columnheader">区域</span>
            <span role="columnheader">容量</span>
            <span role="columnheader">状态</span>
            <span role="columnheader">负责人</span>
            <span role="columnheader">操作</span>
          </div>

          <div class="table-body">
            <div v-for="station in filteredStations" :key="station.id" class="table-row" role="row">
              <div class="station-name" role="cell">
                <strong>{{ station.name }}</strong>
              </div>
              <span role="cell">{{ station.region }}</span>
              <span role="cell">{{ station.capacity }}</span>
              <span role="cell" class="status-pill" :class="station.status">{{ station.status }}</span>
              <span role="cell">{{ station.owner }}</span>
              <div class="row-actions" role="cell">
                <button type="button" aria-label="编辑电站" @click="openEditForm(station)">
                  <BaseIcon name="edit" :size="18" :stroke-width="2.6" />
                </button>
                <button type="button" aria-label="删除电站" @click="deleteStation(station.id)">
                  <BaseIcon name="trash" :size="17" :stroke-width="2.5" />
                </button>
              </div>
            </div>
          </div>

          <p v-if="filteredStations.length === 0" class="empty-state">暂无匹配电站</p>
        </div>
      </div>
    </section>

    <div v-if="isFormOpen" class="form-overlay" @click.self="closeForm">
      <aside class="form-panel" aria-label="电站表单">
        <header>
          <div>
            <p class="eyebrow">{{ formMode === "create" ? "Create" : "Edit" }}</p>
            <h2>{{ formMode === "create" ? "新增电站" : "编辑电站" }}</h2>
          </div>
          <button type="button" class="ghost-icon" aria-label="关闭表单" @click="closeForm">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <form class="station-form" @submit.prevent="saveStation">
          <label>
            电站名称
            <input v-model.trim="stationForm.name" required type="text" />
          </label>
          <label>
            电站编码
            <input v-model.trim="stationForm.code" required type="text" />
          </label>
          <label>
            所属区域
            <input v-model.trim="stationForm.region" required type="text" />
          </label>
          <label>
            装机容量
            <input v-model.trim="stationForm.capacity" required type="text" />
          </label>
          <label>
            运行状态
            <select v-model="stationForm.status">
              <option value="运行中">运行中</option>
              <option value="维护中">维护中</option>
              <option value="离线">离线</option>
            </select>
          </label>
          <label>
            负责人
            <input v-model.trim="stationForm.owner" required type="text" />
          </label>

          <button type="submit" class="save-button">
            {{ formMode === "create" ? "创建电站" : "保存修改" }}
          </button>
        </form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

defineOptions({
  name: "StationManagementPage",
});

type StationStatus = "运行中" | "维护中" | "离线";

interface StationRecord {
  id: number;
  name: string;
  code: string;
  region: string;
  capacity: string;
  status: StationStatus;
  owner: string;
}

type StationForm = Omit<StationRecord, "id">;
type FormMode = "create" | "edit";

const createEmptyForm = (): StationForm => ({
  name: "",
  code: "",
  region: "",
  capacity: "",
  status: "运行中",
  owner: "",
});

const stations = ref<StationRecord[]>([
  {
    id: 1,
    name: "嘉兴一号屋顶光伏电站",
    code: "SUN-JX-001",
    region: "浙江嘉兴",
    capacity: "18.6 MW",
    status: "运行中",
    owner: "刘海鑫",
  },
  {
    id: 2,
    name: "巴州戈壁集中式电站",
    code: "SUN-XJ-025",
    region: "新疆巴州",
    capacity: "52.4 MW",
    status: "维护中",
    owner: "陈卓",
  },
  {
    id: 3,
    name: "苏南工业园分布式电站",
    code: "SUN-SN-013",
    region: "江苏苏州",
    capacity: "9.8 MW",
    status: "运行中",
    owner: "王琪",
  },
  {
    id: 4,
    name: "海盐组件测试电站",
    code: "SUN-HY-006",
    region: "浙江海盐",
    capacity: "6.2 MW",
    status: "离线",
    owner: "赵宁",
  },
  {
    id: 5,
    name: "宁波湾区屋顶电站",
    code: "SUN-NB-018",
    region: "浙江宁波",
    capacity: "24.7 MW",
    status: "运行中",
    owner: "周航",
  },
  {
    id: 6,
    name: "常州高新区分布式电站",
    code: "SUN-CZ-032",
    region: "江苏常州",
    capacity: "31.5 MW",
    status: "维护中",
    owner: "林澈",
  },
  {
    id: 7,
    name: "绍兴纺织园光伏电站",
    code: "SUN-SX-011",
    region: "浙江绍兴",
    capacity: "12.3 MW",
    status: "运行中",
    owner: "许诺",
  },
  {
    id: 8,
    name: "湖州物流园储能光伏站",
    code: "SUN-HZ-029",
    region: "浙江湖州",
    capacity: "36.8 MW",
    status: "运行中",
    owner: "唐亦",
  },
  {
    id: 9,
    name: "杭州临平产业园电站",
    code: "SUN-HL-041",
    region: "浙江杭州",
    capacity: "21.4 MW",
    status: "运行中",
    owner: "沈知",
  },
  {
    id: 10,
    name: "嘉善智慧厂区光伏站",
    code: "SUN-JS-016",
    region: "浙江嘉善",
    capacity: "14.9 MW",
    status: "维护中",
    owner: "顾然",
  },
  {
    id: 11,
    name: "温州瓯海屋顶电站",
    code: "SUN-WZ-023",
    region: "浙江温州",
    capacity: "17.6 MW",
    status: "运行中",
    owner: "秦越",
  },
  {
    id: 12,
    name: "金华低碳园光伏电站",
    code: "SUN-JH-037",
    region: "浙江金华",
    capacity: "28.2 MW",
    status: "离线",
    owner: "邵宁",
  },
]);

const searchKeyword = ref("");
const statusFilter = ref<StationStatus | "all">("all");
const formMode = ref<FormMode>("create");
const editingStationId = ref<number | null>(null);
const isFormOpen = ref(false);
const stationForm = reactive<StationForm>(createEmptyForm());

const filteredStations = computed(() => {
  const keyword = searchKeyword.value.toLowerCase();

  return stations.value.filter((station) => {
    const matchesKeyword = [station.name, station.code, station.region, station.owner]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
    const matchesStatus = statusFilter.value === "all" || station.status === statusFilter.value;

    return matchesKeyword && matchesStatus;
  });
});

const summaryItems = computed(() => [
  { label: "电站总数", value: stations.value.length.toString().padStart(2, "0") },
  { label: "运行中", value: stations.value.filter((station) => station.status === "运行中").length },
  { label: "维护中", value: stations.value.filter((station) => station.status === "维护中").length },
  { label: "总容量", value: "274.4 MW" },
]);

const assignForm = (station: StationForm) => {
  stationForm.name = station.name;
  stationForm.code = station.code;
  stationForm.region = station.region;
  stationForm.capacity = station.capacity;
  stationForm.status = station.status;
  stationForm.owner = station.owner;
};

const resetForm = () => {
  formMode.value = "create";
  editingStationId.value = null;
  assignForm(createEmptyForm());
};

const openCreateForm = () => {
  resetForm();
  isFormOpen.value = true;
};

const openEditForm = (station: StationRecord) => {
  formMode.value = "edit";
  editingStationId.value = station.id;
  assignForm(station);
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  resetForm();
};

const saveStation = () => {
  if (formMode.value === "edit" && editingStationId.value !== null) {
    const stationIndex = stations.value.findIndex((station) => station.id === editingStationId.value);

    if (stationIndex >= 0) {
      stations.value[stationIndex] = {
        id: editingStationId.value,
        ...stationForm,
      };
    }
  } else {
    stations.value.unshift({
      id: Date.now(),
      ...stationForm,
    });
  }

  resetForm();
  isFormOpen.value = false;
};

const deleteStation = (stationId: number) => {
  const confirmed = window.confirm("确认删除该电站？");

  if (!confirmed) {
    return;
  }

  stations.value = stations.value.filter((station) => station.id !== stationId);

  if (editingStationId.value === stationId) {
    resetForm();
  }
};

</script>

<style scoped>
.station-page {
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
  border-radius: 14px;
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
  border-radius: 14px;
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
  border-radius: 18px;
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

.status-filter {
  border: 1px solid #dbe5f2;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.9)),
    #f8fbff;
  color: #26364f;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 8px 18px rgba(47, 91, 150, 0.08);
  cursor: pointer;
  appearance: none;
}

.status-filter {
  height: 36px;
  min-width: 128px;
  padding: 0 34px 0 14px;
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

.status-filter:hover {
  border-color: #bfd3f2;
  color: #1d5fd1;
}

.status-filter:focus {
  border-color: #79adff;
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 0 0 3px rgba(47, 130, 255, 0.13);
}

.station-table {
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto;
  align-content: start;
  gap: 6px;
  overflow: hidden;
  border-radius: 14px;
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
  border-radius: 12px;
  background: #ffffff;
  display: grid;
  grid-template-columns: minmax(280px, 1.7fr) minmax(130px, 0.9fr) minmax(110px, 0.75fr) minmax(110px, 0.7fr) minmax(110px, 0.7fr) 96px;
  align-items: center;
  gap: 12px;
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

.station-name {
  min-width: 0;
}

.station-name strong {
  color: #182438;
  font-size: 15px;
  line-height: 1.2;
}

.status-pill {
  width: max-content;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
}

.status-pill.运行中 {
  color: #0a8f5a;
  background: #e9f8f1;
}

.status-pill.维护中 {
  color: #c07900;
  background: #fff5df;
}

.status-pill.离线 {
  color: #9b4050;
  background: #fff0f2;
}

.row-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.row-actions button,
.ghost-icon {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: #ffffff;
  color: #0b0f18;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.row-actions button:hover {
  background: #f5f8fd;
  box-shadow: inset 0 0 0 1px #dbe5f2;
  transform: translateY(-1px);
}

.ghost-icon {
  border: 1px solid #dbe5f2;
  border-radius: 999px;
  color: #2b66dd;
}

.empty-state {
  margin: 0;
  border: 1px dashed #cbd8ea;
  border-radius: 14px;
  color: #7a8da8;
  padding: 22px;
  text-align: center;
}

.form-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  padding: 28px;
  background: rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-panel {
  width: min(520px, 100%);
  max-height: min(760px, calc(100vh - 56px));
  min-width: 0;
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.9)),
    #ffffff;
  padding: 20px;
  box-shadow: 0 28px 80px rgba(21, 39, 68, 0.24);
  overflow-y: auto;
}

.form-panel header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.form-panel h2 {
  font-size: 20px;
}

.station-form {
  display: grid;
  gap: 12px;
}

.station-form label {
  display: grid;
  gap: 6px;
  color: #5f7088;
  font-size: 12px;
  font-weight: 700;
}

.station-form input,
.station-form select {
  border: 1px solid #dbe5f2;
  border-radius: 12px;
  background: #ffffff;
  color: #21314a;
  font: inherit;
  height: 38px;
  padding: 0 11px;
}

.save-button {
  height: 42px;
  margin-top: 4px;
}

@media (max-width: 860px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-row {
    grid-template-columns: 1fr;
  }

  .table-head {
    display: none;
  }
}

@media (max-width: 560px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .form-overlay {
    padding: 10px;
  }

  .form-panel {
    width: 100%;
  }
}
</style>
