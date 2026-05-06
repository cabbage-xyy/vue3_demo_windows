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
              <option value="处理中">处理中</option>
              <option value="已停运">已停运</option>
            </select>

            <button type="button" class="primary-command" @click="openCreateForm">
              <BaseIcon name="plus" :size="16" />
              新增电站
            </button>
          </div>
        </div>

        <div
          ref="stationTableRef"
          class="station-table"
          :class="{ 'is-vertical-scrolling': isVerticalScrolling }"
          role="table"
          aria-label="电站列表"
          @scroll="handleTableScroll"
          @wheel="handleTableWheel"
        >
          <div class="table-content">
          <div class="table-row table-head" role="row">
            <span role="columnheader">公司名称</span>
            <span role="columnheader">电站名称</span>
            <span role="columnheader">电站地址</span>
            <span role="columnheader">屋顶编号</span>
            <span role="columnheader">屋顶名称</span>
            <span role="columnheader">容量</span>
            <span role="columnheader">类型</span>
            <span role="columnheader">负责人</span>
            <span role="columnheader">天气</span>
            <span role="columnheader">经度</span>
            <span role="columnheader">纬度</span>
            <span role="columnheader">状态</span>
            <span role="columnheader">操作</span>
          </div>

          <div class="table-body">
            <div v-for="station in filteredStations" :key="station.id" class="table-row" role="row">
              <span role="cell" class="cell-text" :title="station.companyName">{{ station.companyName || "未填写" }}</span>
              <div class="station-name" role="cell">
                <button type="button" class="station-link" @click="openStationDetail(station)">
                  {{ station.name }}
                </button>
              </div>
              <span role="cell" class="cell-text" :title="station.region">{{ station.region }}</span>
              <span role="cell">{{ station.roofNumber }}</span>
              <span role="cell" class="cell-text" :title="station.roofName">{{ station.roofName || "未填写" }}</span>
              <span role="cell">{{ station.capacity }}</span>
              <span role="cell">{{ station.type }}</span>
              <span role="cell">{{ station.owner }}</span>
              <span role="cell">{{ station.weather }}</span>
              <span role="cell">{{ station.longitude }}</span>
              <span role="cell">{{ station.latitude }}</span>
              <span role="cell" class="status-cell">
                <span class="status-pill" :class="station.status">{{ station.status }}</span>
              </span>
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

            <p v-if="isLoadingStations" class="empty-state">正在加载电站数据...</p>
            <p v-else-if="filteredStations.length === 0" class="empty-state">暂无匹配电站</p>
          </div>
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
            公司名称
            <input v-model.trim="stationForm.companyName" required type="text" />
          </label>
          <label>
            电站名称
            <input v-model.trim="stationForm.name" required type="text" />
          </label>
          <label>
            电站地址
            <input v-model.trim="stationForm.region" required type="text" />
          </label>
          <label>
            屋顶编号
            <input v-model.trim="stationForm.roofNumber" required type="text" />
          </label>
          <label>
            屋顶名称
            <input v-model.trim="stationForm.roofName" required type="text" />
          </label>
          <label>
            容量
            <input v-model.trim="stationForm.capacity" required type="text" />
          </label>
          <label>
            类型
            <input v-model.trim="stationForm.type" required type="text" />
          </label>
          <label>
            负责人
            <input v-model.trim="stationForm.owner" required type="text" />
          </label>
          <label>
            天气
            <input v-model.trim="stationForm.weather" required type="text" />
          </label>
          <label>
            经度
            <input v-model.trim="stationForm.longitude" required type="text" />
          </label>
          <label>
            纬度
            <input v-model.trim="stationForm.latitude" required type="text" />
          </label>
          <div class="srt-import-field">
            <button type="button" class="srt-import-button" @click="triggerSrtFileInput">
              导入SRT文件
            </button>
            <input
              ref="srtFileInputRef"
              class="srt-file-input"
              type="file"
              accept=".srt,text/plain"
              @change="handleSrtFileChange"
            />
          </div>
          <label>
            运行状态
            <select v-model="stationForm.status">
              <option value="运行中">运行中</option>
              <option value="处理中">处理中</option>
              <option value="已停运">已停运</option>
            </select>
          </label>
          <button type="submit" class="save-button">
            {{ formMode === "create" ? "创建电站" : "保存修改" }}
          </button>
        </form>
      </aside>
    </div>

    <div v-if="selectedStation" class="detail-overlay" @click.self="closeStationDetail">
      <aside class="detail-panel station-detail-scroll" aria-label="电站详情">
        <header>
          <div>
            <p class="eyebrow">Station detail</p>
            <h2>{{ selectedStation.name }}</h2>
            <span class="detail-code">{{ selectedStation.code }}</span>
          </div>
          <button type="button" class="ghost-icon" aria-label="关闭电站详情" @click="closeStationDetail">
            <BaseIcon name="x" :size="16" />
          </button>
        </header>

        <section class="detail-hero">
          <div>
            <span>公司名称</span>
            <strong>{{ selectedStation.companyName || "未填写" }}</strong>
          </div>
          <div>
            <span>电站名称</span>
            <strong>{{ selectedStation.name || "未填写" }}</strong>
          </div>
          <div>
            <span>运行状态</span>
            <strong class="status-pill" :class="selectedStation.status">{{ selectedStation.status }}</strong>
          </div>
        </section>

        <section class="detail-section">
          <h3>数据库信息</h3>
          <dl class="detail-grid">
            <div>
              <dt>电站地址</dt>
              <dd>{{ selectedStation.region || "未填写" }}</dd>
            </div>
            <div>
              <dt>屋顶编号</dt>
              <dd>{{ selectedStation.roofNumber || "未填写" }}</dd>
            </div>
            <div>
              <dt>屋顶名称</dt>
              <dd>{{ selectedStation.roofName || "未填写" }}</dd>
            </div>
            <div>
              <dt>容量</dt>
              <dd>{{ selectedStation.capacity || "未填写" }}</dd>
            </div>
            <div>
              <dt>类型</dt>
              <dd>{{ selectedStation.type || "未填写" }}</dd>
            </div>
            <div>
              <dt>负责人</dt>
              <dd>{{ selectedStation.owner || "未填写" }}</dd>
            </div>
            <div>
              <dt>天气</dt>
              <dd>{{ selectedStation.weather || "未填写" }}</dd>
            </div>
            <div>
              <dt>经度</dt>
              <dd>{{ selectedStation.longitude || "未填写" }}</dd>
            </div>
            <div>
              <dt>纬度</dt>
              <dd>{{ selectedStation.latitude || "未填写" }}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>
                <span class="status-pill" :class="selectedStation.status">{{ selectedStation.status }}</span>
              </dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

defineOptions({
  name: "StationManagementPage",
});

type StationStatus = "运行中" | "处理中" | "已停运";

interface StationRecord {
  id: number;
  name: string;
  code: string;
  region: string;
  capacity: string;
  status: StationStatus;
  owner: string;
  companyName?: string;
  stationName?: string;
  roofName?: string;
  roofNumber?: string;
  type?: string;
  weather?: string;
  longitude?: string;
  latitude?: string;
  companyId?: string;
  minLongitude?: string;
  maxLongitude?: string;
  minLatitude?: string;
  maxLatitude?: string;
  originalRoofName?: string;
}

interface StationManagementApiRecord {
  id?: number | string | null;
  code?: string | null;
  name?: string | null;
  stationName?: string | null;
  companyName?: string | null;
  roofName?: string | null;
  region?: string | null;
  capacity?: string | number | null;
  status?: string | null;
  owner?: string | null;
  type?: string | null;
  weather?: string | null;
  longitude?: number | string | null;
  latitude?: number | string | null;
  minLongitude?: number | string | null;
  maxLongitude?: number | string | null;
  minLatitude?: number | string | null;
  maxLatitude?: number | string | null;
  raw?: {
    id?: number | string | null;
    name?: string | null;
    station_name?: string | null;
    station_address?: string | null;
    roof_number?: number | string | null;
    roof_name?: string | null;
    size?: string | number | null;
    type?: string | null;
    person?: string | null;
    weather?: string | null;
    longitude?: number | string | null;
    latitude?: number | string | null;
    company_id?: number | string | null;
    min_longitude?: number | string | null;
    max_longitude?: number | string | null;
    min_latitude?: number | string | null;
    max_latitude?: number | string | null;
    status?: string | null;
  } | null;
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
  companyName: "",
  stationName: "",
  roofName: "",
  roofNumber: "",
  type: "",
  weather: "",
  longitude: "",
  latitude: "",
  companyId: "",
  minLongitude: "",
  maxLongitude: "",
  minLatitude: "",
  maxLatitude: "",
  originalRoofName: "",
});

const stations = ref<StationRecord[]>([]);
const isLoadingStations = ref(false);

const searchKeyword = ref("");
const statusFilter = ref<StationStatus | "all">("all");
const formMode = ref<FormMode>("create");
const editingStationId = ref<number | null>(null);
const isFormOpen = ref(false);
const selectedStation = ref<StationRecord | null>(null);
const stationForm = reactive<StationForm>(createEmptyForm());
const stationTableRef = ref<HTMLElement | null>(null);
const srtFileInputRef = ref<HTMLInputElement | null>(null);
const isVerticalScrolling = ref(false);
let lastTableScrollTop = 0;
let verticalScrollbarTimer: ReturnType<typeof window.setTimeout> | null = null;

const normalizeStationStatus = (status: string | null | undefined): StationStatus => {
  if (
    status === "运行中" ||
    status === "处理中" ||
    status === "已停运"
  ) {
    return status;
  }
  return "运行中";
};

const normalizeStationRecord = (record: StationManagementApiRecord, index: number): StationRecord => {
  const idNumber = Number(record.id);
  const id = Number.isFinite(idNumber) ? idNumber : Date.now() + index;
  const stationName = record.stationName || record.name || "未命名电站";
  const capacityText = record.capacity === null || record.capacity === undefined ? "未填写" : String(record.capacity);

  return {
    id,
    name: stationName,
    code: record.code || `STATION-${id}`,
    region: record.region || record.raw?.station_address || "未填写",
    capacity: capacityText,
    status: normalizeStationStatus(record.status || record.raw?.status),
    owner: record.owner || record.raw?.person || "未填写",
    companyName: record.companyName || record.raw?.name || "",
    stationName,
    roofName: record.roofName || record.raw?.roof_name || "",
    roofNumber: formatNullableValue(record.raw?.roof_number),
    type: formatNullableValue(record.type || record.raw?.type),
    weather: formatNullableValue(record.weather || record.raw?.weather),
    longitude: formatNullableValue(record.longitude ?? record.raw?.longitude),
    latitude: formatNullableValue(record.latitude ?? record.raw?.latitude),
    companyId: formatNullableValue(record.raw?.company_id),
    minLongitude: formatNullableValue(record.minLongitude ?? record.raw?.min_longitude),
    maxLongitude: formatNullableValue(record.maxLongitude ?? record.raw?.max_longitude),
    minLatitude: formatNullableValue(record.minLatitude ?? record.raw?.min_latitude),
    maxLatitude: formatNullableValue(record.maxLatitude ?? record.raw?.max_latitude),
    originalRoofName: record.roofName || record.raw?.roof_name || "",
  };
};

const formatNullableValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "未填写";
  }

  return String(value);
};

const fetchStations = async () => {
  isLoadingStations.value = true;

  try {
    const response = await fetch("http://127.0.0.1:8000/station-management/stations");

    if (!response.ok) {
      console.error("获取电站列表失败：", response.status, response.statusText);
      return;
    }

    const result = await response.json();
    const apiRecords = Array.isArray(result.data) ? result.data : [];

    refreshStationsFromApiRecords(apiRecords);
  } catch (error) {
    console.error("获取电站列表接口调用失败：", error);
  } finally {
    isLoadingStations.value = false;
  }
};

const refreshStationsFromApiRecords = (apiRecords: StationManagementApiRecord[]) => {
  stations.value = apiRecords.map((record: StationManagementApiRecord, index: number) =>
    normalizeStationRecord(record, index),
  );
};

const buildStationManagementPayload = () => ({
  company_name: stationForm.companyName,
  station_name: stationForm.name,
  station_address: stationForm.region,
  roof_number: stationForm.roofNumber || "",
  roof_name: stationForm.roofName,
  size: stationForm.capacity,
  type: stationForm.type || "",
  person: stationForm.owner,
  weather: stationForm.weather || "",
  longitude: stationForm.longitude || null,
  latitude: stationForm.latitude || null,
  min_longitude: stationForm.minLongitude || null,
  max_longitude: stationForm.maxLongitude || null,
  min_latitude: stationForm.minLatitude || null,
  max_latitude: stationForm.maxLatitude || null,
  status: stationForm.status,
  original_roof_name: stationForm.originalRoofName || stationForm.roofName,
});

const triggerSrtFileInput = () => {
  srtFileInputRef.value?.click();
};

const extractAverageCoordinateFromSrt = (srtText: string) => {
  const latitudeMatches = [...srtText.matchAll(/\[latitude:\s*(-?\d+(?:\.\d+)?)\]/gi)];
  const longitudeMatches = [...srtText.matchAll(/\[longitude:\s*(-?\d+(?:\.\d+)?)\]/gi)];
  const coordinateCount = Math.min(latitudeMatches.length, longitudeMatches.length);

  if (coordinateCount === 0) {
    return null;
  }

  let latitudeTotal = 0;
  let longitudeTotal = 0;

  for (let index = 0; index < coordinateCount; index += 1) {
    latitudeTotal += Number(latitudeMatches[index][1]);
    longitudeTotal += Number(longitudeMatches[index][1]);
  }

  return {
    latitude: latitudeTotal / coordinateCount,
    longitude: longitudeTotal / coordinateCount,
    count: coordinateCount,
  };
};

const handleSrtFileChange = async (event: Event) => {
  const inputElement = event.target as HTMLInputElement;
  const srtFile = inputElement.files?.[0];

  if (!srtFile) {
    return;
  }

  try {
    const srtText = await srtFile.text();
    const averageCoordinate = extractAverageCoordinateFromSrt(srtText);

    if (!averageCoordinate) {
      window.alert("未在SRT文件中读取到经纬度信息");
      return;
    }

    stationForm.longitude = averageCoordinate.longitude.toFixed(9).replace(/0+$/, "").replace(/\.$/, "");
    stationForm.latitude = averageCoordinate.latitude.toFixed(9).replace(/0+$/, "").replace(/\.$/, "");
  } catch (error) {
    console.error("读取SRT文件失败：", error);
    window.alert("读取SRT文件失败，请确认文件格式是否正确");
  } finally {
    inputElement.value = "";
  }
};

const showVerticalScrollbarTemporarily = () => {
  isVerticalScrolling.value = true;

  if (verticalScrollbarTimer) {
    window.clearTimeout(verticalScrollbarTimer);
  }

  verticalScrollbarTimer = window.setTimeout(() => {
    isVerticalScrolling.value = false;
  }, 900);
};

const handleTableScroll = () => {
  const tableElement = stationTableRef.value;

  if (!tableElement) {
    return;
  }

  if (tableElement.scrollTop !== lastTableScrollTop) {
    lastTableScrollTop = tableElement.scrollTop;
    showVerticalScrollbarTemporarily();
  }
};

const handleTableWheel = (event: WheelEvent) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    showVerticalScrollbarTemporarily();
  }
};

const filteredStations = computed(() => {
  const keyword = searchKeyword.value.toLowerCase();

  return stations.value.filter((station) => {
    const matchesKeyword = [
      station.name,
      station.code,
      station.region,
      station.owner,
      station.companyName,
      station.roofName,
      station.roofNumber,
      station.type,
      station.weather,
      station.longitude,
      station.latitude,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
    const matchesStatus = statusFilter.value === "all" || station.status === statusFilter.value;

    return matchesKeyword && matchesStatus;
  });
});

const summaryItems = computed(() => {
  const totalCapacity = stations.value.reduce((sum, station) => {
    const capacityValue = Number.parseFloat(station.capacity);
    return Number.isFinite(capacityValue) ? sum + capacityValue : sum;
  }, 0);

  return [
    { label: "电站总数", value: stations.value.length.toString().padStart(2, "0") },
    { label: "运行中", value: stations.value.filter((station) => station.status === "运行中").length },
    { label: "处理中", value: stations.value.filter((station) => station.status === "处理中").length },
    { label: "总容量", value: `${totalCapacity.toFixed(1)} MW` },
  ];
});


const assignForm = (station: StationForm) => {
  stationForm.name = station.name;
  stationForm.code = station.code;
  stationForm.region = station.region;
  stationForm.capacity = station.capacity;
  stationForm.status = station.status;
  stationForm.owner = station.owner;
  stationForm.companyName = station.companyName || "";
  stationForm.stationName = station.stationName || station.name;
  stationForm.roofName = station.roofName || "";
  stationForm.roofNumber = station.roofNumber || "";
  stationForm.type = station.type || "";
  stationForm.weather = station.weather || "";
  stationForm.longitude = station.longitude || "";
  stationForm.latitude = station.latitude || "";
  stationForm.companyId = station.companyId || "";
  stationForm.minLongitude = station.minLongitude || "";
  stationForm.maxLongitude = station.maxLongitude || "";
  stationForm.minLatitude = station.minLatitude || "";
  stationForm.maxLatitude = station.maxLatitude || "";
  stationForm.originalRoofName = station.originalRoofName || station.roofName || "";
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

const openStationDetail = (station: StationRecord) => {
  selectedStation.value = station;
};

const closeStationDetail = () => {
  selectedStation.value = null;
};

const closeForm = () => {
  isFormOpen.value = false;
  resetForm();
};

const saveStation = async () => {
  const isEditing = formMode.value === "edit" && editingStationId.value !== null;
  const url = isEditing
    ? `http://127.0.0.1:8000/station-management/stations/${editingStationId.value}`
    : "http://127.0.0.1:8000/station-management/stations";

  try {
    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildStationManagementPayload()),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      window.alert(result.detail || result.message || "电站信息保存失败");
      return;
    }

    const apiRecords = Array.isArray(result.data) ? result.data : [];
    refreshStationsFromApiRecords(apiRecords);
    resetForm();
    isFormOpen.value = false;
  } catch (error) {
    console.error("保存电站信息接口调用失败：", error);
    window.alert("保存电站信息接口调用失败，请确认后端服务已启动");
  }
};

const deleteStation = async (stationId: number) => {
  const targetStation = stations.value.find((station) => station.id === stationId);

  if (!targetStation) {
    window.alert("未找到要删除的电站记录");
    return;
  }

  const confirmed = window.confirm("确认删除该电站？");

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/station-management/stations/${stationId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      window.alert(result.detail || result.message || "电站信息删除失败");
      return;
    }

    const apiRecords = Array.isArray(result.data) ? result.data : [];
    refreshStationsFromApiRecords(apiRecords);

    if (editingStationId.value === stationId) {
      resetForm();
    }
  } catch (error) {
    console.error("删除电站信息接口调用失败：", error);
    window.alert("删除电站信息接口调用失败，请确认后端服务已启动");
  }
};

onMounted(() => {
  void fetchStations();
});
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
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(115, 139, 171, 0.42) transparent;
  padding-bottom: 0;
}

.station-table.is-vertical-scrolling {
  scrollbar-color: rgba(115, 139, 171, 0.46) transparent;
}

.station-table::-webkit-scrollbar {
  width: 0;
  height: 8px;
}

.station-table.is-vertical-scrolling::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.station-table::-webkit-scrollbar-track {
  border-radius: 999px;
  background: transparent;
}

.station-table.is-vertical-scrolling::-webkit-scrollbar-track {
  background: transparent;
}

.station-table::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(115, 139, 171, 0.42);
}

.station-table.is-vertical-scrolling::-webkit-scrollbar-thumb {
  background: rgba(115, 139, 171, 0.42);
}

.station-table.is-vertical-scrolling::-webkit-scrollbar-thumb:hover {
  background: rgba(82, 111, 151, 0.58);
}

.table-content {
  display: table;
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0 6px;
}

.station-table::-webkit-scrollbar-corner {
  background: transparent;
}

.table-body {
  display: table-row-group;
}


.table-row {
  display: table-row;
  min-height: 48px;
  font-size: 14px;
}

.table-row > * {
  display: table-cell;
  height: 48px;
  padding: 0 20px;
  border-top: 1px solid rgba(224, 232, 243, 0.85);
  border-bottom: 1px solid rgba(224, 232, 243, 0.85);
  background: #ffffff;
  vertical-align: middle;
  white-space: nowrap;
}

.table-row > * + * {
  padding-left: 20px;
}

.table-row > *:first-child {
  border-left: 1px solid rgba(224, 232, 243, 0.85);
  border-radius: 8px 0 0 8px;
}

.table-row > *:last-child {
  position: sticky;
  right: 0;
  z-index: 2;
  border-right: 1px solid rgba(224, 232, 243, 0.85);
  border-radius: 0 8px 8px 0;
  padding-right: 12px;
  padding-left: 12px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.76), #ffffff 18px),
    #ffffff;
  box-shadow: -12px 0 18px rgba(255, 255, 255, 0.88);
}

.table-head {
  position: sticky;
  top: 0;
  z-index: 2;
  color: #70839f;
  font-size: 12px;
  font-weight: 700;
}

.table-head > * {
  height: 32px;
  background: #f5f8fd;
}

.table-head span:last-child {
  z-index: 3;
  background:
    linear-gradient(90deg, rgba(245, 248, 253, 0.72), #f5f8fd 18px),
    #f5f8fd;
  text-align: center;
}

.station-name {
  white-space: nowrap;
}

.cell-text {
  white-space: nowrap;
}

.station-link {
  max-width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  font: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.station-link:hover,
.station-link:focus-visible {
  color: #1f66ed;
  text-decoration: underline;
  text-underline-offset: 4px;
  outline: none;
}

.status-cell {
  text-align: center;
}

.status-pill {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  height: auto;
  min-height: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

.status-pill.运行中 {
  color: #0a8f5a;
  background: #e9f8f1;
}


.status-pill.处理中 {
  color: #1d5fd1;
  background: #eaf3ff;
}

.status-pill.已停运 {
  color: #6b7280;
  background: #eef1f5;
}


.row-actions {
  display: table-cell;
  min-width: 76px;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}

.row-actions button + button {
  margin-left: 6px;
}

.row-actions button,
.ghost-icon {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: #ffffff;
  color: #0b0f18;
  display: inline-flex;
  vertical-align: middle;
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

.form-overlay,
.detail-overlay {
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

.form-panel,
.detail-panel {
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

.form-panel header,
.detail-panel header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.form-panel h2,
.detail-panel h2 {
  font-size: 20px;
}

.detail-panel {
  width: min(720px, 100%);
}

.station-detail-scroll {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.station-detail-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.detail-code {
  display: inline-flex;
  margin-top: 8px;
  border-radius: 999px;
  background: #eef5ff;
  color: #2b66dd;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 800;
}

.detail-hero {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.detail-hero > div,
.detail-section {
  border: 1px solid rgba(224, 232, 243, 0.82);
  border-radius: 16px;
  background: rgba(248, 251, 255, 0.72);
}

.detail-hero > div {
  min-width: 0;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.detail-hero span,
.detail-grid dt {
  color: #71829b;
  font-size: 12px;
  font-weight: 800;
}

.detail-hero strong {
  min-width: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1.1;
}

.detail-section {
  padding: 14px;
}

.detail-section + .detail-section {
  margin-top: 12px;
}

.detail-section h3 {
  margin: 0 0 12px;
  color: #172033;
  font-size: 15px;
}

.detail-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-grid div {
  min-width: 0;
  border-bottom: 1px solid rgba(224, 232, 243, 0.72);
  padding-bottom: 10px;
}

.detail-grid dt,
.detail-grid dd {
  margin: 0;
}

.detail-grid dd {
  margin-top: 5px;
  color: #1f2c42;
  font-size: 14px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.station-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.station-form label {
  display: grid;
  gap: 6px;
  color: #5f7088;
  font-size: 12px;
  font-weight: 700;
}

.station-form label:nth-last-child(2),
.station-form .save-button {
  grid-column: 1 / -1;
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

.srt-import-field {
  display: flex;
  align-items: end;
}

.srt-import-button {
  width: 100%;
  height: 38px;
  border: 1px dashed #9ec5ff;
  border-radius: 12px;
  background: rgba(239, 247, 255, 0.84);
  color: #1f66ed;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    color 0.16s ease;
}

.srt-import-button:hover {
  border-color: #5c9cff;
  background: rgba(227, 240, 255, 0.98);
  color: #174fc0;
}

.srt-file-input {
  display: none;
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

  .station-table {
    overflow-x: hidden;
  }

  .table-content {
    display: block;
    width: 100%;
    min-width: 0;
    border-spacing: 0;
  }

  .table-row {
    display: grid;
    width: 100%;
    min-width: 0;
    grid-template-columns: 1fr;
  }

  .table-row > * {
    position: static;
    display: block;
    height: auto;
    border: 0;
    border-bottom: 1px solid rgba(224, 232, 243, 0.72);
    border-radius: 0;
    padding: 8px 10px;
    box-shadow: none;
  }

  .status-cell {
    text-align: left;
  }

  .table-body {
    display: grid;
    width: 100%;
    min-width: 0;
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

  .detail-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .station-form {
    grid-template-columns: 1fr;
  }

  .station-form label:nth-last-child(2),
  .station-form .save-button {
    grid-column: auto;
  }

  .srt-import-field {
    align-items: stretch;
  }
}
</style>
