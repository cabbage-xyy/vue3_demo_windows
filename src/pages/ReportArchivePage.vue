<template>
  <div class="page-grid">
    <section class="surface-card overview-grid">
      <article v-for="item in archiveStats" :key="item.label" class="overview-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="surface-card content-card">
      <div class="section-heading">
        <h3>归档记录</h3>
        <span>支持追溯来源、下载与审计</span>
      </div>

      <div class="archive-list">
        <article v-for="record in archiveRecords" :key="record.title" class="archive-item">
          <div>
            <strong>{{ record.title }}</strong>
            <p>{{ record.meta }}</p>
          </div>
          <span>{{ record.retention }}</span>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "ReportArchivePage",
});

const archiveStats = [
  { label: "累计归档", value: "4,286", note: "含巡检与专项报告" },
  { label: "本月新增", value: "138", note: "自动归档占 93%" },
  { label: "即将到期", value: "12", note: "建议本周完成复核" },
  { label: "审计通过率", value: "100%", note: "最近 90 天" },
];

const archiveRecords = [
  {
    title: "华东一区周度巡检报告",
    meta: "归档时间 2026-04-22 18:30 · 来源 报告中心 · 操作人 系统自动归档",
    retention: "保留 5 年",
  },
  {
    title: "滨湖二号站异常专项报告",
    meta: "归档时间 2026-04-21 16:08 · 来源 人工提交 · 操作人 赵工",
    retention: "长期保留",
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

.overview-grid {
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.overview-card {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #e0ebf7;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
}

.overview-card span,
.section-heading span,
.archive-item p {
  color: #7588a4;
}

.overview-card strong {
  margin-top: 8px;
  display: block;
  font-size: 30px;
  color: #122038;
}

.overview-card p {
  margin: 8px 0 0;
}

.content-card {
  padding-bottom: 22px;
}

.section-heading {
  padding: 20px 22px 0;
}

.section-heading h3 {
  margin: 0;
  font-size: 20px;
  color: #18253c;
}

.archive-list {
  padding: 18px 22px 0;
  display: grid;
  gap: 14px;
}

.archive-item {
  padding: 16px;
  border: 1px solid #e8eff8;
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.archive-item strong {
  color: #152238;
}

.archive-item p {
  margin: 8px 0 0;
  line-height: 1.6;
}

.archive-item span {
  color: #1a64e8;
  white-space: nowrap;
}

@media (max-width: 1080px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
