<template>
  <!-- 状态通知面板：展示系统提示和跳转入口，不保存通知读取状态。 -->
  <section class="notice-panel" :aria-label="title">
    <header>
      <div class="panel-title">
        <span aria-hidden="true"></span>
        <h2>{{ title }}</h2>
      </div>
      <button type="button" class="panel-more" aria-label="更多">
        <BaseIcon name="more-horizontal" :size="24" :stroke-width="2.8" />
      </button>
    </header>

    <div class="notice-list">
      <article v-for="item in items" :key="item.id" class="notice-item">
        <p>{{ item.content }}</p>
        <a v-if="item.linkLabel" href="#" @click.prevent>
          {{ item.linkLabel }}
          <BaseIcon name="chevron-right" :size="15" :stroke-width="2.5" />
        </a>
      </article>
    </div>

    <p v-if="footer" class="panel-footer">{{ footer }}</p>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { StatusNotice } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "StatusNoticePanel",
});

// 通知内容由父级提供，footer 用于补充当前模块状态说明。
interface StatusNoticePanelProps {
  title: string;
  items: StatusNotice[];
  footer?: string;
}

defineProps<StatusNoticePanelProps>();
</script>

<style scoped>
.notice-panel {
  min-width: 0;
  min-height: 178px;
  border: 1px solid rgba(224, 232, 243, 0.94);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  padding: 22px 27px 23px;
  box-shadow: 0 12px 26px rgba(45, 73, 110, 0.07);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 21px;
}

header,
.panel-title,
.notice-item,
.notice-item a {
  min-width: 0;
  display: flex;
  align-items: center;
}

header {
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  gap: 16px;
}

.panel-title span {
  width: 4px;
  height: 25px;
  border-radius: 999px;
  background: #177bff;
}

.panel-title h2 {
  margin: 0;
  color: #101827;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.panel-more {
  width: 68px;
  height: 31px;
  border: 1px solid rgba(36, 134, 255, 0.52);
  border-radius: 10px;
  background: #ffffff;
  color: #1578f7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

.notice-list {
  min-width: 0;
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 15px;
  overflow: hidden;
}

.notice-item {
  justify-content: space-between;
  gap: 18px;
}

.notice-item p {
  min-width: 0;
  margin: 0;
  color: #162033;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.45;
}

.notice-item a {
  flex: 0 0 auto;
  gap: 12px;
  color: #0d73f6;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.panel-footer {
  margin: 0;
  color: #b9c1ce;
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 760px) {
  .notice-panel {
    padding: 20px;
  }

  .notice-item {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
