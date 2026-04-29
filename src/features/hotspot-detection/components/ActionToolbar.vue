<template>
  <section class="action-toolbar" aria-label="检测操作">
    <button
      v-for="buttonItem in actions"
      :key="buttonItem.id"
      type="button"
      class="action-button"
      :class="[buttonItem.variant, `action-${buttonItem.id}`]"
      :disabled="disabledActionIds.includes(buttonItem.id)"
      @click="emit('action', buttonItem.id)"
    >
      <BaseIcon :name="buttonItem.icon" :size="21" :stroke-width="2.7" />
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
  disabledActionIds?: string[];
}

withDefaults(defineProps<ActionToolbarProps>(), {
  disabledActionIds: () => [],
});

const emit = defineEmits<{
  action: [actionId: string];
}>();
</script>

<style scoped>
.action-toolbar {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, 46px);
  gap: 10px;
  align-content: start;
}

.action-button {
  min-width: 0;
  height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(38, 119, 233, 0.26);
  background: #ffffff;
  color: #1469df;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(44, 87, 145, 0.05);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

.action-button.primary {
  border-color: rgba(12, 103, 241, 0.95);
  background: linear-gradient(135deg, #178cff 0%, #096cf0 100%);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 10px 18px rgba(23, 124, 249, 0.22);
}

.action-button.secondary {
  border-color: #d5e1ef;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.action-button.action-import-video {
  border-color: rgba(64, 145, 255, 0.48);
  background: linear-gradient(180deg, #f7fbff 0%, #edf6ff 100%);
  color: #116cdd;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 8px 16px rgba(42, 126, 237, 0.08);
}

.action-button.action-start-detection {
  border-color: rgba(12, 103, 241, 0.95);
  background: linear-gradient(135deg, #178cff 0%, #096cf0 100%);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 12px 22px rgba(23, 124, 249, 0.26);
}

.action-button.action-stop-detection {
  border-color: rgba(213, 225, 239, 0.96);
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  color: #8aa1bd;
}

.action-button.action-stop-detection:not(:disabled) {
  border-color: rgba(231, 112, 112, 0.44);
  background: linear-gradient(180deg, #fffafa 0%, #fff4f4 100%);
  color: #d85151;
}

.action-button.action-export-report {
  border-color: rgba(186, 209, 238, 0.92);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  color: #1469df;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(42, 84, 140, 0.12);
}

.action-button:active {
  transform: translateY(0);
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
  transform: none;
  box-shadow: none;
}

@media (max-width: 1180px) {
  .action-toolbar {
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .action-toolbar {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }
}
</style>
