<template>
  <div class="page-grid">
    <section class="surface-card content-card">
      <div class="section-heading">
        <h3>报告任务中心</h3>
        <span>生成、审批、导出一体化管理</span>
      </div>

      <div class="task-grid">
        <article v-for="report in reports" :key="report.name" class="report-card">
          <div>
            <strong>{{ report.name }}</strong>
            <p>{{ report.desc }}</p>
          </div>
          <span class="status-pill">{{ report.status }}</span>
        </article>
      </div>
    </section>

    <section class="surface-card content-card">
      <div class="section-heading">
        <h3>模板规范</h3>
        <span>支持多业务线统一输出</span>
      </div>

      <ul class="template-list">
        <li v-for="template in templates" :key="template.title">
          <strong>{{ template.title }}</strong>
          <p>{{ template.desc }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "ReportCenterPage",
});

const reports = [
  {
    name: "锡山一号站巡检报告",
    status: "生成中",
    desc: "已完成图像汇总与热斑标签整理，等待模板渲染。",
  },
  {
    name: "滨湖二号站异常复盘报告",
    status: "待审批",
    desc: "质量复核已通过，等待区域经理确认后导出。",
  },
  {
    name: "华东周报",
    status: "已完成",
    desc: "已同步到归档中心并推送至管理层邮箱。",
  },
];

const templates = [
  {
    title: "标准巡检模板 V2.3",
    desc: "适用于常规电站巡检，内置热斑图谱与整改建议章节。",
  },
  {
    title: "异常专项模板",
    desc: "聚焦单站异常事件分析，适合重大告警的专项复盘。",
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

.section-heading span,
.report-card p,
.template-list p {
  color: #7588a4;
}

.task-grid,
.template-list {
  padding: 18px 22px 0;
  margin: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}

.report-card,
.template-list li {
  padding: 16px;
  border: 1px solid #e8eff8;
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.report-card strong,
.template-list strong {
  color: #152238;
}

.report-card p,
.template-list p {
  margin: 8px 0 0;
  line-height: 1.6;
}

.status-pill {
  min-width: 72px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(45, 140, 255, 0.1);
  color: #1a64e8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
