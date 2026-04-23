<template>
  <div class="page-grid">
    <section class="dual-grid">
      <article class="surface-card content-card">
        <div class="section-heading">
          <h3>模型与检测阈值</h3>
          <span>建议将参数管理纳入版本控制</span>
        </div>

        <ul class="config-list">
          <li v-for="item in modelConfigs" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </li>
        </ul>
      </article>

      <article class="surface-card content-card">
        <div class="section-heading">
          <h3>通知策略</h3>
          <span>保障关键告警及时触达</span>
        </div>

        <ul class="config-list">
          <li v-for="item in notificationConfigs" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </li>
        </ul>
      </article>
    </section>

    <section class="surface-card content-card">
      <div class="section-heading">
        <h3>系统治理建议</h3>
        <span>适合作为下一阶段建设事项</span>
      </div>

      <ul class="recommend-list">
        <li v-for="item in recommendations" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "SystemSettingsPage",
});

const modelConfigs = [
  { label: "热斑告警阈值", value: "18.5°C" },
  { label: "连续帧确认数", value: "6 帧" },
  { label: "样本回流周期", value: "每周一次" },
];

const notificationConfigs = [
  { label: "短信通知", value: "高风险事件开启" },
  { label: "邮件推送", value: "日报与周报开启" },
  { label: "审批提醒", value: "超时 30 分钟升级" },
];

const recommendations = [
  "为模型阈值、报告模板、归档策略建立环境隔离与版本发布流程。",
  "补齐角色权限矩阵，区分巡检员、复核员、管理者的操作边界。",
  "对关键链路增加健康探针和日志聚合，便于快速排查异常。",
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

.dual-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
.config-list span {
  color: #7588a4;
}

.config-list,
.recommend-list {
  margin: 0;
  padding: 18px 22px 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.config-list li,
.recommend-list li {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f7faff;
  color: #21324d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.config-list strong {
  color: #152238;
}

.recommend-list li {
  display: block;
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .dual-grid {
    grid-template-columns: 1fr;
  }
}
</style>
