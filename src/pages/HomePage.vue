<template>
  <div class="page-grid">
    <section class="hero-panel surface-card">
      <div class="hero-copy">
        <span class="status-chip">今日巡检任务正常推进</span>
        <h2>面向工业场景的热斑协同管理中台</h2>
        <p>
          统一承接电站巡检、热斑识别、告警闭环和报告归档流程，支撑多区域、多班组稳定运行。
        </p>
      </div>

      <div class="hero-stats">
        <article v-for="metric in overviewMetrics" :key="metric.label" class="metric-tile">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.note }}</small>
        </article>
      </div>
    </section>

    <section class="surface-card">
      <div class="section-heading">
        <h3>任务总览</h3>
        <span>本日巡检计划与执行情况</span>
      </div>

      <div class="task-grid">
        <article v-for="task in tasks" :key="task.name" class="task-card">
          <div>
            <strong>{{ task.name }}</strong>
            <p>{{ task.desc }}</p>
          </div>
          <span class="task-value">{{ task.value }}</span>
        </article>
      </div>
    </section>

    <section class="surface-card">
      <div class="section-heading">
        <h3>最新动态</h3>
        <span>最近 24 小时业务事件</span>
      </div>

      <ul class="timeline">
        <li v-for="item in activities" :key="item.time + item.title" class="timeline-item">
          <span class="timeline-time">{{ item.time }}</span>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "HomePage",
});

const overviewMetrics = [
  { label: "在线电站", value: "128", note: "较昨日 +6" },
  { label: "待复核热斑", value: "22", note: "高优先级 4 条" },
  { label: "报告生成中", value: "09", note: "平均耗时 4 分钟" },
  { label: "系统可用率", value: "99.98%", note: "近 30 日" },
];

const tasks = [
  { name: "无人机巡检", value: "18/24", desc: "飞行任务已完成 75%，其余任务预计 2 小时内结束。" },
  { name: "AI 检测队列", value: "32 帧", desc: "推理服务运行平稳，峰值资源占用处于安全阈值内。" },
  { name: "人工复核", value: "07 单", desc: "待复核样本集中在华东二区，建议优先分派白班处理。" },
];

const activities = [
  { time: "10:36", title: "锡山一号站检测完成", desc: "已自动同步热斑识别结果并进入报告生成流程。" },
  { time: "09:58", title: "报告模板版本升级", desc: "已切换到标准模板 V2.3，后续新报告默认使用新模板。" },
  { time: "09:21", title: "系统告警恢复", desc: "推理节点 03 短时抖动已恢复，未影响任务交付。" },
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

.hero-panel {
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 18px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(45, 140, 255, 0.1);
  color: #1a64e8;
  font-size: 13px;
  font-weight: 600;
}

.hero-copy h2 {
  margin: 16px 0 10px;
  font-size: 34px;
  line-height: 1.15;
  color: #132037;
}

.hero-copy p {
  margin: 0;
  max-width: 720px;
  color: #667a96;
  line-height: 1.7;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.metric-tile,
.task-card {
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
  border: 1px solid #e0ebf7;
}

.metric-tile span,
.section-heading span,
.task-card p,
.timeline-item p {
  color: #7588a4;
}

.metric-tile strong {
  margin-top: 10px;
  display: block;
  font-size: 30px;
  color: #122038;
}

.metric-tile small {
  margin-top: 8px;
  display: block;
}

.section-heading {
  padding: 20px 22px 0;
}

.section-heading h3 {
  margin: 0;
  font-size: 20px;
  color: #18253c;
}

.task-grid {
  padding: 18px 22px 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.task-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.task-card strong,
.timeline-item strong {
  color: #152238;
}

.task-card p,
.timeline-item p {
  margin: 8px 0 0;
  line-height: 1.6;
}

.task-value {
  font-size: 28px;
  font-weight: 700;
  color: #2066e8;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 18px 22px 22px;
  display: grid;
  gap: 14px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #edf2f8;
}

.timeline-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.timeline-time {
  color: #1f65e7;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .hero-panel,
  .task-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero-copy h2 {
    font-size: 26px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }
}
</style>
