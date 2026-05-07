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

// 本地 SVG path 注册表：所有页面按钮/菜单只通过 IconName 取图标，保持视觉资产集中维护。
const iconPaths: Record<IconName, string[]> = {
  home: ["M4 11.5 12 5l8 6.5", "M6 10v9h12v-9", "M10 19v-5h4v5"],
  monitor: ["M4 5h16v12H4z", "M10 21h4", "M8 17h8"],
  station: ["M4 20h16", "M6 20V9l6-5l6 5v11", "M9 20v-6h6v6", "M10 9h4"],
  roof: ["M4 13h16", "M6 13l6-7l6 7", "M7 13v7h10v-7", "M10 20v-4h4v4"],
  bot: ["M12 7V4", "M7 9h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z", "M9 14h.01", "M15 14h.01", "M9 18h6"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", "M10 21h4"],
  "chevron-down": ["M6 9l6 6l6-6"],
  "chevron-right": ["M9 6l6 6l-6 6"],
  x: ["M18 6L6 18", "M6 6l12 12"],
  dot: ["M12 11.5a0.5 0.5 0 1 0 0 1a0.5 0.5 0 1 0 0-1", "M12 12h0"],
  progress: ["M12 3a9 9 0 1 0 9 9", "M12 3v6"],
  crown: ["M3 18h18", "M4 18l2-10l6 5l6-5l2 10"],
  info: ["M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18", "M12 11v6", "M12 7h.01"],
  flame: ["M12 22c4 0 7-2.7 7-6.8c0-2.7-1.5-5-4.3-6.9c.1 2.4-.8 3.8-2.1 4.6c.3-3.6-1.7-6.3-4.2-8.9c.3 3.6-2.4 5.9-3.1 8.7C4.3 16.6 7.2 22 12 22z"],
  clock: ["M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18", "M12 7v5l3 2"],
  calendar: ["M7 3v4", "M17 3v4", "M4 8h16", "M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z"],
  camera: ["M4 8h3l2-3h6l2 3h3v11H4z", "M12 17a4 4 0 1 0 0-8a4 4 0 0 0 0 8"],
  volume: ["M4 10v4h4l5 4V6L8 10H4z", "M16 9a4 4 0 0 1 0 6", "M18.5 6.5a8 8 0 0 1 0 11"],
  play: ["M8 6v12l10-6z"],
  pause: ["M8 5v14", "M16 5v14"],
  plus: ["M12 5v14", "M5 12h14"],
  eye: ["M2.5 12s3.5-6 9.5-6s9.5 6 9.5 6s-3.5 6-9.5 6s-9.5-6-9.5-6z", "M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6"],
  edit: ["M12 5H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6", "M14.5 4.5a2.1 2.1 0 0 1 3 3L10 15l-4 1l1-4l7.5-7.5z"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M6 6l1 15h10l1-15", "M10 11v6", "M14 11v6"],
  search: ["M11 19a8 8 0 1 0 0-16a8 8 0 0 0 0 16", "M21 21l-4.35-4.35"],
  send: ["M22 2L11 13", "M22 2l-7 20l-4-9l-9-4z"],
  upload: ["M12 17V7", "M8 11l4-4l4 4", "M5 18h14"],
  download: ["M12 7v10", "M8 13l4 4l4-4", "M5 19h14"],
  "stop-circle": ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", "M9 9h6v6H9z"],
  "file-output": ["M7 3h7l4 4v14H7z", "M14 3v4h4", "M10 14h4", "M12 10v8"],
  "file-text": ["M7 3h7l4 4v14H7z", "M14 3v4h4", "M10 12h5", "M10 16h5", "M10 8h1"],
  settings: ["M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6", "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1l-2 3.4l-.2-.1a1.7 1.7 0 0 0-1.9.2l-.7.4a1.7 1.7 0 0 0-1 1.6V23h-4v-.5a1.7 1.7 0 0 0-1-1.6l-.7-.4a1.7 1.7 0 0 0-1.9-.2l-.2.1l-2-3.4l.1-.1A1.7 1.7 0 0 0 4.6 15v-.8a1.7 1.7 0 0 0-.9-1.6l-.2-.1l2-3.4l.2.1a1.7 1.7 0 0 0 1.9-.2l.7-.4a1.7 1.7 0 0 0 1-1.6V6h4v.5a1.7 1.7 0 0 0 1 1.6l.7.4a1.7 1.7 0 0 0 1.9.2l.2-.1l2 3.4l-.2.1a1.7 1.7 0 0 0-.9 1.6z"],
  database: ["M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3s-3.1 3-7 3s-7-1.3-7-3z", "M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6", "M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"],
  maximize: ["M8 3H5a2 2 0 0 0-2 2v3", "M16 3h3a2 2 0 0 1 2 2v3", "M21 16v3a2 2 0 0 1-2 2h-3", "M8 21H5a2 2 0 0 1-2-2v-3"],
  "more-horizontal": ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
};

// 未注册图标回落为空数组，避免渲染异常破坏按钮布局。
const paths = computed(() => iconPaths[props.name] ?? []);
</script>
