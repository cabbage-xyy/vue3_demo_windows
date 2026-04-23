<template>
  <div class="page-grid">
    <section class="surface-card board-grid">
      <article v-for="item in boardCards" :key="item.label" class="board-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="dual-grid">
      <article class="surface-card content-card">
        <div class="section-heading">
          <h3>待处理热斑事件</h3>
          <span>按风险等级优先流转</span>
        </div>

        <ul class="event-list">
          <li v-for="event in events" :key="event.title" class="event-item">
            <div>
              <strong>{{ event.title }}</strong>
              <p>{{ event.desc }}</p>
            </div>
            <span class="risk-tag">{{ event.level }}</span>
          </li>
        </ul>
      </article>

      <article class="surface-card content-card">
        <div class="section-heading">
          <h3>处置建议</h3>
          <span>结合巡检策略的标准动作</span>
        </div>

        <ul class="action-list">
          <li v-for="action in actions" :key="action">{{ action }}</li>
        </ul>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "HotspotManagementPage",
});

const boardCards = [
  { label: "新增热斑", value: "12", note: "今日较昨日 -3" },
  { label: "高风险事件", value: "04", note: "需优先派单" },
  { label: "处理中", value: "09", note: "平均闭环 3.2 小时" },
  { label: "已关闭", value: "87", note: "本月累计" },
];

const events = [
  {
    title: "滨湖二号站 A-17 组件",
    desc: "温差峰值 21.4°C，建议立即安排现场复核。",
    level: "高风险",
  },
  {
    title: "高新园区站 C-03 组串",
    desc: "连续三次识别异常，可能存在接线松动问题。",
    level: "中风险",
  },
  {
    title: "南通沿海站 B-09 区域",
    desc: "热斑形态稳定，建议纳入下轮重点巡检。",
    level: "观察中",
  },
];

const actions = [
  "建立热斑事件分级标准，按照高、中、低风险形成自动派单规则。",
  "将复核结论回流到模型训练样本，提升重复场景识别准确率。",
  "把现场整改 SLA 接入报表统计，持续跟踪闭环效率。",
];
</script>

<style scoped>
.page-grid,
.dual-grid {
  display: grid;
  gap: 18px;
}

.surface-card {
  border: 1px solid #e3ebf6;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 32px rgba(13, 30, 67, 0.05);
}

.board-grid {
  padding: 22px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.board-card {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #e0ebf7;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
}

.board-card span,
.section-heading span,
.event-item p {
  color: #7588a4;
}

.board-card strong {
  margin-top: 8px;
  display: block;
  font-size: 30px;
  color: #122038;
}

.board-card p {
  margin: 8px 0 0;
  color: #7588a4;
}

.dual-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.content-card {
  padding-bottom: 20px;
}

.section-heading {
  padding: 20px 22px 0;
}

.section-heading h3 {
  margin: 0;
  font-size: 20px;
  color: #18253c;
}

.event-list,
.action-list {
  margin: 0;
  padding: 18px 22px 0;
  list-style: none;
}

.event-list {
  display: grid;
  gap: 14px;
}

.event-item {
  padding: 16px;
  border: 1px solid #e8eff8;
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.event-item strong {
  color: #152238;
}

.event-item p {
  margin: 8px 0 0;
  line-height: 1.6;
}

.risk-tag {
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

.action-list {
  display: grid;
  gap: 12px;
}

.action-list li {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f7faff;
  color: #21324d;
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .board-grid,
  .dual-grid {
    grid-template-columns: 1fr;
  }
}
</style>
