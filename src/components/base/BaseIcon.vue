<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="path in paths" :key="path" :d="path" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IconName } from "@/types/ui";

defineOptions({
  name: "BaseIcon",
});

interface BaseIconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<BaseIconProps>(), {
  size: 18,
  strokeWidth: 2,
});

const iconPaths: Record<IconName, string[]> = {
  monitor: ["M4 5h16v12H4z", "M10 21h4", "M8 17h8"],
  station: ["M4 20h16", "M6 20V9l6-5l6 5v11", "M9 20v-6h6v6", "M10 9h4"],
  bot: ["M12 7V4", "M7 9h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z", "M9 14h.01", "M15 14h.01", "M9 18h6"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", "M10 21h4"],
  "chevron-down": ["M6 9l6 6l6-6"],
  x: ["M18 6L6 18", "M6 6l12 12"],
  dot: ["M12 11.5a0.5 0.5 0 1 0 0 1a0.5 0.5 0 1 0 0-1", "M12 12h0"],
  progress: ["M12 3a9 9 0 1 0 9 9", "M12 3v6"],
  crown: ["M3 18h18", "M4 18l2-10l6 5l6-5l2 10"],
  play: ["M8 6v12l10-6z"],
  plus: ["M12 5v14", "M5 12h14"],
  edit: ["M12 5H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6", "M14.5 4.5a2.1 2.1 0 0 1 3 3L10 15l-4 1l1-4l7.5-7.5z"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M6 6l1 15h10l1-15", "M10 11v6", "M14 11v6"],
  search: ["M11 19a8 8 0 1 0 0-16a8 8 0 0 0 0 16", "M21 21l-4.35-4.35"],
  send: ["M22 2L11 13", "M22 2l-7 20l-4-9l-9-4z"],
  upload: ["M12 17V7", "M8 11l4-4l4 4", "M5 18h14"],
  "stop-circle": ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", "M9 9h6v6H9z"],
  "file-output": ["M7 3h7l4 4v14H7z", "M14 3v4h4", "M10 14h4", "M12 10v8"],
  maximize: ["M8 3H5a2 2 0 0 0-2 2v3", "M16 3h3a2 2 0 0 1 2 2v3", "M21 16v3a2 2 0 0 1-2 2h-3", "M8 21H5a2 2 0 0 1-2-2v-3"],
  "more-horizontal": ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
};

const paths = computed(() => iconPaths[props.name] ?? []);
</script>
