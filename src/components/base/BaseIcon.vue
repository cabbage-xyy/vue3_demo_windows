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
  home: ["M3 11.5L12 4l9 7.5", "M6 10v9h12v-9"],
  station: [
    "M7 7h10",
    "M7 12h10",
    "M7 17h6",
    "M4 4h16v16H4z",
    "M14 17h6",
  ],
  thermal: ["M7 4h10v4H7z", "M6 8h12v10H6z", "M10 12h4", "M10 16h4"],
  monitor: ["M4 5h16v12H4z", "M10 21h4", "M8 17h8"],
  report: ["M7 4h10v16H7z", "M9 8h6", "M9 12h6", "M9 16h4"],
  setting: [
    "M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8",
    "M12 2v3",
    "M12 19v3",
    "M4.93 4.93l2.12 2.12",
    "M16.95 16.95l2.12 2.12",
    "M2 12h3",
    "M19 12h3",
    "M4.93 19.07l2.12-2.12",
    "M16.95 7.05l2.12-2.12",
  ],
  "chevron-down": ["M6 9l6 6l6-6"],
  dot: ["M12 11.5a0.5 0.5 0 1 0 0 1a0.5 0.5 0 1 0 0-1", "M12 12h0"],
  progress: ["M12 3a9 9 0 1 0 9 9", "M12 3v6"],
  crown: ["M3 18h18", "M4 18l2-10l6 5l6-5l2 10"],
  play: ["M8 6v12l10-6z"],
  upload: ["M12 17V7", "M8 11l4-4l4 4", "M5 18h14"],
  "stop-circle": ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", "M9 9h6v6H9z"],
  "file-output": ["M7 3h7l4 4v14H7z", "M14 3v4h4", "M10 14h4", "M12 10v8"],
  "more-horizontal": ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
};

const paths = computed(() => iconPaths[props.name] ?? []);
</script>
