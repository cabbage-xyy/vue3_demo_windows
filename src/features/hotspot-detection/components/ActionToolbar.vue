<template>
  <section class="action-toolbar">
    <button
      v-for="buttonItem in actions"
      :key="buttonItem.id"
      type="button"
      class="action-button"
      :class="buttonItem.variant"
      @click="emit('action', buttonItem.id)"
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

const emit = defineEmits<{
  action: [actionId: string];
}>();
</script>

<style scoped>
.action-toolbar {
  display: grid;
  grid-template-columns: repeat(4, max-content);
  gap: 8px;
  border: 1px solid rgba(213, 226, 245, 0.92);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(238, 245, 255, 0.78)),
    #f7faff;
  padding: 5px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 12px 22px rgba(46, 82, 134, 0.08);
}

.action-button {
  position: relative;
  min-width: 104px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    filter 0.16s ease;
}

.action-button::before {
  content: "";
  position: absolute;
  inset: 1px 1px auto;
  height: 42%;
  border-radius: 9px 9px 7px 7px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.action-button svg,
.action-button span {
  position: relative;
  z-index: 1;
}

.action-button.primary {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent 48%),
    linear-gradient(135deg, #43a4ff 0%, #276df2 58%, #1f62e4 100%);
  color: #ffffff;
  border-color: rgba(34, 104, 233, 0.9);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    inset 0 -2px 0 rgba(5, 44, 132, 0.22),
    0 10px 20px rgba(35, 105, 239, 0.24),
    0 2px 0 rgba(13, 72, 185, 0.18);
}

.action-button.secondary {
  background:
    linear-gradient(180deg, #ffffff 0%, #f6f9ff 54%, #edf4ff 100%);
  color: #245fc8;
  border-color: rgba(185, 207, 239, 0.98);
  box-shadow:
    inset 0 1px 0 #ffffff,
    inset 0 -1px 0 rgba(199, 216, 241, 0.62),
    0 8px 16px rgba(49, 91, 150, 0.1),
    0 1px 0 rgba(126, 158, 207, 0.18);
}

.action-button:hover {
  transform: translateY(-2px);
  filter: saturate(1.08);
}

.action-button.primary:hover {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.44),
    inset 0 -2px 0 rgba(5, 44, 132, 0.2),
    0 14px 24px rgba(35, 105, 239, 0.3),
    0 2px 0 rgba(13, 72, 185, 0.18);
}

.action-button.secondary:hover {
  border-color: rgba(125, 171, 238, 0.96);
  box-shadow:
    inset 0 1px 0 #ffffff,
    inset 0 -1px 0 rgba(199, 216, 241, 0.62),
    0 12px 20px rgba(49, 91, 150, 0.14),
    0 1px 0 rgba(126, 158, 207, 0.18);
}

.action-button:active {
  transform: translateY(0);
  box-shadow:
    inset 0 2px 7px rgba(21, 51, 95, 0.2),
    0 4px 10px rgba(49, 91, 150, 0.08);
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
