<template>
  <div class="page-grid">
    <section class="surface-card summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="surface-card">
      <div class="section-heading">
        <h3>电站台账</h3>
        <span>按区域查看运行状态与设备健康度</span>
      </div>

      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>电站名称</th>
              <th>所属区域</th>
              <th>装机容量</th>
              <th>在线状态</th>
              <th>最近巡检</th>
              <th>健康评分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="station in stations" :key="station.name">
              <td>{{ station.name }}</td>
              <td>{{ station.region }}</td>
              <td>{{ station.capacity }}</td>
              <td>
                <span class="status-pill">{{ station.status }}</span>
              </td>
              <td>{{ station.inspectAt }}</td>
              <td>{{ station.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "StationManagementPage",
});

const summaryCards = [
  { label: "纳管电站", value: "128", note: "并网运行 121 座" },
  { label: "待巡检站点", value: "14", note: "华东区域占 8 座" },
  { label: "异常站点", value: "05", note: "建议 4 小时内处理" },
  { label: "平均健康度", value: "96.2", note: "环比上周 +1.8" },
];

const stations = [
  {
    name: "锡山一号站",
    region: "华东一区",
    capacity: "58MW",
    status: "运行中",
    inspectAt: "2026-04-23 09:40",
    score: "98",
  },
  {
    name: "滨湖二号站",
    region: "华东二区",
    capacity: "36MW",
    status: "待巡检",
    inspectAt: "2026-04-23 08:15",
    score: "95",
  },
  {
    name: "高新园区站",
    region: "华中一区",
    capacity: "24MW",
    status: "告警中",
    inspectAt: "2026-04-22 18:20",
    score: "89",
  },
];
</script>

<style scoped>
.page-grid {
  display: grid;
  gap: 18px;
}

.surface-card {
  border: 1px solid #e3ebf6;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 32px rgba(13, 30, 67, 0.05);
}

.summary-grid {
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #e0ebf7;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
}

.summary-card span,
.section-heading span {
  color: #7588a4;
}

.summary-card strong {
  margin-top: 8px;
  display: block;
  font-size: 30px;
  color: #122038;
}

.summary-card p {
  margin: 8px 0 0;
  color: #7588a4;
}

.section-heading {
  padding: 20px 22px 0;
}

.section-heading h3 {
  margin: 0;
  font-size: 20px;
  color: #18253c;
}

.table-shell {
  padding: 18px 22px 22px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #edf2f8;
  white-space: nowrap;
}

.data-table thead th {
  color: #7588a4;
  font-weight: 600;
}

.data-table tbody td {
  color: #18253c;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(45, 140, 255, 0.1);
  color: #1a64e8;
}

@media (max-width: 1080px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
