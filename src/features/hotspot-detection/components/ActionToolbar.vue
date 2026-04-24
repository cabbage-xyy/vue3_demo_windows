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
  display: grid;
  grid-template-columns: repeat(4, max-content);
  gap: 6px;
}

.action-button {
  min-width: 100px;
  height: 46px;
  border-radius: 11px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    filter 0.16s ease;
}

.action-button.primary {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 46%),
    linear-gradient(135deg, #3b98ff 0%, #1f66ed 100%);
  color: #ffffff;
  border-color: rgba(31, 102, 237, 0.72);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 -1px 0 rgba(0, 36, 115, 0.22),
    0 12px 22px rgba(35, 105, 239, 0.22);
}

.action-button.secondary {
  background:
    linear-gradient(180deg, #ffffff 0%, #f3f7ff 100%);
  color: #245fce;
  border-color: rgba(194, 213, 244, 0.95);
  box-shadow:
    inset 0 1px 0 #ffffff,
    0 8px 16px rgba(49, 91, 150, 0.09);
}

.action-button:hover {
  transform: translateY(-1px);
  filter: saturate(1.05);
}

.action-button:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 6px rgba(21, 51, 95, 0.18);
}

@media (max-width: 740px) {
  .action-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-button {
    width: 100%;
  }
}
</style>
