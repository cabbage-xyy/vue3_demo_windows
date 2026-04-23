<template>
  <section class="action-toolbar">
    <button
      v-for="buttonItem in actions"
      :key="buttonItem.id"
      type="button"
      class="action-button"
      :class="buttonItem.variant"
    >
      <BaseIcon :name="buttonItem.icon" :size="16" />
      <span>{{ buttonItem.label }}</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { ActionButton } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "ActionToolbar",
});

interface ActionToolbarProps {
  actions: ActionButton[];
}

defineProps<ActionToolbarProps>();
</script>

<style scoped>
.action-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.action-button {
  min-width: 228px;
  height: 56px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0;
  cursor: pointer;
}

.action-button.primary {
  background: linear-gradient(90deg, #2d8cff 0%, #2468f3 100%);
  color: #ffffff;
  border-color: #2f7dfa;
}

.action-button.secondary {
  background: #ffffff;
  color: #2b66dd;
  border-color: #d4e2f8;
}

@media (max-width: 740px) {
  .action-button {
    width: 100%;
    min-width: 0;
    font-size: 16px;
  }
}
</style>
