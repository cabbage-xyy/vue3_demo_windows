<template>
  <!-- 数字孪生演示场景：用 CSS 阵列表达组件识别过程，不依赖外部 3D 引擎。 -->
  <section class="twin-scene detectionCanvas" aria-label="屋顶光伏组件热斑检测数字孪生视图">
    <div
      class="detection-viewport"
      :class="{
        'is-idle-preview': isIdlePreview && !prefersReducedMotion,
        'is-running': detectionStatus === 'running' && !prefersReducedMotion,
        'is-paused': detectionStatus === 'paused',
        'is-completed': detectionStatus === 'completed' || prefersReducedMotion,
      }"
      aria-label="无人机巡检检测视窗"
    >
      <div class="pv-array-wrap">
        <div class="array-plane">
          <div class="array-glow" aria-hidden="true"></div>
          <div class="scan-band" aria-hidden="true"></div>
          <div class="pv-idle-motion">
            <div
              v-for="gridCopy in gridCopies"
              :key="gridCopy"
              class="pv-array"
              aria-label="组件阵列 A-03"
            >
              <div
                v-for="row in panelRows"
                :key="row.index"
                class="pv-row"
              >
                <div
                  v-for="panel in row.panels"
                  :key="panel.key"
                  class="pv-panel"
                  :class="{
                    'is-hotspot-module': Boolean(panel.hotspot && visibleHotspotIds.has(panel.hotspot.id)),
                    'is-selected-module': panel.hotspot?.moduleCode === selectedComponent,
                  }"
                  @click="panel.hotspot && emit('select-component', panel.hotspot.moduleCode)"
                >
                  <span
                    v-if="panel.hotspot && visibleRecognitionIds.has(panel.hotspot.id)"
                    class="recognition-box"
                    aria-hidden="true"
                  ></span>
                  <div
                    v-if="panel.hotspot && visibleHotspotIds.has(panel.hotspot.id)"
                    class="hotspot-marker"
                    :class="[`is-${panel.hotspot.severity}`, { 'has-label': visibleLabelIds.has(panel.hotspot.id) }]"
                    :aria-label="`${panel.hotspot.moduleCode} ${panel.hotspot.type} 温差 ${temperatureLabel(panel.hotspot.temperatureDelta)}`"
                  >
                    <span class="hotspot-core"></span>
                    <span v-if="visibleLabelIds.has(panel.hotspot.id)" class="hotspot-label">
                      <strong>{{ panel.hotspot.moduleCode }}</strong>
                      <span>{{ panel.hotspot.type }}</span>
                      <em>+{{ temperatureLabel(panel.hotspot.temperatureDelta) }}</em>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { HotspotMarker } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "PhotovoltaicTwinScene",
});

// 父级只控制检测状态和选中组件，场景内部负责动画排程和热点可见性。
interface PhotovoltaicTwinSceneProps {
  markers: HotspotMarker[];
  selectedComponent: string;
  detectionStatus: "idlePreview" | "idle" | "imported" | "running" | "paused" | "completed";
  animationRunId: number;
}

const props = defineProps<PhotovoltaicTwinSceneProps>();
const emit = defineEmits<{
  "select-component": [componentId: string];
  "detection-complete": [];
}>();

const markerByCode = computed(() => new Map(props.markers.map((marker) => [marker.moduleCode, marker])));

// 演示热点布局：真实 marker 可覆盖严重程度和温差信息。
const hotspotLayout = {
  "4-9": { id: "a03-18", moduleCode: "A-03-18", type: "高温热斑", temperatureDelta: "18.6°C", severity: "high" },
  "7-5": { id: "a03-24", moduleCode: "A-03-24", type: "疑似热斑", temperatureDelta: "12.4°C", severity: "medium" },
  "6-4": { id: "a03-31", moduleCode: "A-03-31", type: "遮挡热斑", temperatureDelta: "9.8°C", severity: "medium" },
  "3-13": { id: "a04-07", moduleCode: "A-04-07", type: "局部过热", temperatureDelta: "15.2°C", severity: "high" },
  "5-3": { id: "b01-12", moduleCode: "B-01-12", type: "隐裂疑似", temperatureDelta: "8.6°C", severity: "medium" },
} as const;

const panelRowCount = 18;
const panelColumnCount = 20;
const gridCopies = ["grid-a", "grid-b", "grid-c"];

const panelRows = computed(() =>
  Array.from({ length: panelRowCount }, (_, rowIndex) => {
    const rowNumber = rowIndex + 1;

    return {
      index: rowNumber,
      panels: Array.from({ length: panelColumnCount }, (_, panelIndex) => {
        const columnNumber = panelIndex + 1;
        const fallbackCode = `A-03-${String(rowIndex * panelColumnCount + columnNumber).padStart(2, "0")}`;
        const hotspot = hotspotLayout[`${rowNumber}-${columnNumber}` as keyof typeof hotspotLayout];
        const moduleCode = hotspot?.moduleCode ?? fallbackCode;
        const marker = hotspot ? markerByCode.value.get(hotspot.moduleCode) : undefined;

        return {
          key: `${rowNumber}-${columnNumber}`,
          moduleCode,
          hotspot: hotspot
            ? {
                id: hotspot.id,
                moduleCode: hotspot.moduleCode,
                type: hotspot.type,
                severity: marker?.severity ?? hotspot.severity,
                temperatureDelta: marker?.temperatureDelta ?? hotspot.temperatureDelta,
              }
            : undefined,
        };
      }),
    };
  }),
);

const visibleHotspotIds = ref(new Set<string>());
const visibleLabelIds = ref(new Set<string>());
const visibleRecognitionIds = ref(new Set<string>());
const prefersReducedMotion = ref(false);
const timers: number[] = [];
const idlePreviewIds = ["a03-18", "a03-24", "a03-31", "a04-07", "b01-12"];
const idlePreviewIndex = ref(0);
const isIdlePreview = computed(() => ["idlePreview", "idle", "imported"].includes(props.detectionStatus));

// 所有动画定时器集中登记，状态切换和卸载时统一清理。
const clearTimers = () => {
  while (timers.length > 0) {
    window.clearTimeout(timers.pop());
  }
};

const revealHotspot = (id: string) => {
  visibleHotspotIds.value = new Set([...visibleHotspotIds.value, id]);
};

const revealRecognition = (id: string) => {
  visibleRecognitionIds.value = new Set([id]);
};

const revealLabel = (id: string) => {
  visibleLabelIds.value = new Set([...visibleLabelIds.value, id]);
};

const revealAllHotspots = () => {
  visibleRecognitionIds.value = new Set(["a03-18"]);
  visibleHotspotIds.value = new Set(["a03-24", "a03-18"]);
  visibleLabelIds.value = new Set(["a03-24", "a03-18"]);
};

const resetHotspotVisibility = () => {
  visibleRecognitionIds.value = new Set();
  visibleHotspotIds.value = new Set();
  visibleLabelIds.value = new Set();
};

// 空闲预览循环展示不同热点，降低未检测时画面静止感。
const scheduleIdlePreview = () => {
  clearTimers();
  resetHotspotVisibility();

  if (prefersReducedMotion.value) {
    visibleHotspotIds.value = new Set(["a03-18"]);
    visibleLabelIds.value = new Set(["a03-18"]);
    return;
  }

  const runCycle = () => {
    const hotspotId = idlePreviewIds[idlePreviewIndex.value % idlePreviewIds.length]!;
    idlePreviewIndex.value += 1;
    resetHotspotVisibility();
    revealRecognition(hotspotId);
    timers.push(window.setTimeout(() => revealHotspot(hotspotId), 300));
    timers.push(window.setTimeout(() => revealLabel(hotspotId), 620));
    timers.push(window.setTimeout(() => {
      visibleLabelIds.value = new Set();
    }, 3000));
    timers.push(window.setTimeout(resetHotspotVisibility, 3300));
    timers.push(window.setTimeout(runCycle, 6100));
  };

  timers.push(window.setTimeout(runCycle, 700));
};

const scheduleDetectionSequence = () => {
  clearTimers();
  resetHotspotVisibility();

  if (prefersReducedMotion.value) {
    revealAllHotspots();
    emit("detection-complete");
    return;
  }

  timers.push(window.setTimeout(() => revealHotspot("a03-24"), 800));
  timers.push(window.setTimeout(() => revealLabel("a03-24"), 1100));
  timers.push(window.setTimeout(() => revealHotspot("a03-18"), 1800));
  timers.push(window.setTimeout(() => revealLabel("a03-18"), 2100));
  timers.push(window.setTimeout(() => emit("detection-complete"), 2800));
};

function temperatureLabel(value: string) {
  return value.replace("°C", "℃");
}

watch(
  () => props.animationRunId,
  () => {
    if (props.detectionStatus === "running") {
      scheduleDetectionSequence();
    }
  },
);

// 检测状态变化驱动画面，避免模板里直接处理动画副作用。
watch(
  () => props.detectionStatus,
  (status) => {
    if (status === "idlePreview" || status === "idle" || status === "imported") {
      scheduleIdlePreview();
      return;
    }

    if (status === "paused") {
      clearTimers();
      return;
    }

    if (status === "running") {
      scheduleDetectionSequence();
      return;
    }

    if (status === "completed") {
      clearTimers();
      revealAllHotspots();
    }
  },
);

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isIdlePreview.value) {
    scheduleIdlePreview();
    return;
  }

  if (prefersReducedMotion.value) {
    revealAllHotspots();
  }
});

onBeforeUnmount(clearTimers);
</script>

<style scoped>
/* 数字孪生场景使用纯 CSS 网格和动画，尺寸由父级容器约束。 */
.twin-scene {
  position: relative;
  min-height: 0;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 54% 34%, rgba(76, 157, 255, 0.14), transparent 36%),
    radial-gradient(circle at 34% 74%, rgba(58, 205, 210, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(248, 252, 255, 0.1), rgba(235, 247, 255, 0.04));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.detection-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: 18px;
  transform: translateY(0);
}

.twin-scene::before {
  position: absolute;
  inset: 9% 6% 8%;
  height: auto;
  content: "";
  background:
    linear-gradient(90deg, transparent, rgba(85, 166, 245, 0.08), transparent),
    repeating-linear-gradient(90deg, rgba(60, 145, 224, 0.08) 0 1px, transparent 1px 38px),
    repeating-linear-gradient(0deg, rgba(60, 145, 224, 0.07) 0 1px, transparent 1px 34px);
  mask-image: radial-gradient(ellipse at 50% 42%, #000 0 42%, transparent 74%);
  opacity: 0.58;
  pointer-events: none;
}

.pv-array-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 0;
  box-sizing: border-box;
  perspective: 920px;
  transform: translateY(12px);
  transition: transform 0.5s ease;
}

.detection-viewport.is-running .pv-array-wrap {
  animation: inspectionPan 2.8s cubic-bezier(0.22, 0.72, 0.16, 1) forwards;
}

.detection-viewport.is-idle-preview .pv-idle-motion {
  animation: idlePreviewPan 18s linear infinite;
}

.detection-viewport.is-paused .pv-array-wrap {
  transform: translateY(-8px);
}

.detection-viewport.is-completed .pv-array-wrap {
  transform: translateY(-18px);
}

.pv-idle-motion {
  position: relative;
  width: max-content;
  display: grid;
  row-gap: var(--grid-loop-gap);
  --grid-loop-gap: 9px;
  --grid-loop-distance: calc(-33.333333% - 3px);
  transform-style: preserve-3d;
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.array-plane {
  position: relative;
  width: max-content;
  max-width: 118%;
  --solar-scene-scale: 2.64;
  transform: translateX(-178px) perspective(860px) rotateX(34deg) rotateZ(-3deg) translateY(-12px)
    scale(var(--solar-scene-scale));
  transform-origin: center 68%;
  transform-style: preserve-3d;
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.array-glow {
  position: absolute;
  inset: 20% -4% -18%;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, rgba(63, 153, 239, 0.16), rgba(86, 183, 246, 0.06) 42%, transparent 74%);
  filter: blur(16px);
  pointer-events: none;
}

.scan-band {
  position: absolute;
  z-index: 5;
  top: 6%;
  bottom: 3%;
  left: -18%;
  width: 14%;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(105, 193, 255, 0.18), rgba(218, 246, 255, 0.34), transparent);
  filter: blur(1px);
  mix-blend-mode: screen;
  opacity: 0;
  pointer-events: none;
  transform: skewX(-14deg);
}

.detection-viewport.is-running .scan-band {
  animation: scanSweep 2.5s ease-out forwards;
}

.detection-viewport.is-idle-preview .scan-band {
  animation: idleScanSweep 7.5s ease-in-out infinite;
}

.pv-array {
  position: relative;
  width: max-content;
  display: grid;
  gap: 9px;
  padding: 0;
  overflow: visible;
  transform-style: preserve-3d;
}

.pv-row {
  display: grid;
  grid-template-columns: repeat(20, clamp(70px, 6.7vw, 88px));
  gap: 6px;
  width: max-content;
}

.pv-panel {
  position: relative;
  display: block;
  flex: 0 0 clamp(70px, 6.7vw, 88px);
  width: clamp(70px, 6.7vw, 88px);
  height: clamp(37px, 3.55vw, 46px);
  border: 1px solid rgba(168, 213, 248, 0.58);
  border-radius: 4px;
  background:
    linear-gradient(112deg, rgba(255, 255, 255, 0.28) 0 1px, transparent 2px 38%),
    repeating-linear-gradient(90deg, rgba(223, 243, 255, 0.16) 0 1px, transparent 1px 18%),
    repeating-linear-gradient(0deg, rgba(160, 215, 255, 0.12) 0 1px, transparent 1px 36%),
    linear-gradient(145deg, rgba(13, 77, 141, 0.92) 0%, rgba(22, 103, 178, 0.9) 52%, rgba(29, 126, 214, 0.88) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    inset 0 -8px 14px rgba(16, 76, 142, 0.14),
    0 6px 14px rgba(45, 116, 185, 0.1);
  overflow: visible;
}

.pv-panel::before {
  position: absolute;
  inset: 10% 49% 10% auto;
  width: 1px;
  content: "";
  background: rgba(221, 244, 255, 0.2);
  box-shadow:
    -32px 0 0 rgba(221, 244, 255, 0.16),
    32px 0 0 rgba(221, 244, 255, 0.14);
  pointer-events: none;
}

.pv-panel::after {
  position: absolute;
  inset: 0;
  content: "";
  border-radius: inherit;
  background:
    linear-gradient(120deg, transparent 0 38%, rgba(255, 255, 255, 0.16) 46%, transparent 54% 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 38%);
  opacity: 0.44;
  pointer-events: none;
}

.pv-panel.is-hotspot-module,
.pv-panel.is-selected-module {
  border-color: rgba(255, 174, 84, 0.46);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.34),
    inset 0 -8px 14px rgba(20, 79, 142, 0.2),
    0 0 18px rgba(255, 124, 42, 0.26),
    0 10px 18px rgba(45, 116, 185, 0.14);
}

.recognition-box {
  position: absolute;
  z-index: 5;
  inset: -5px;
  border: 1px solid rgba(96, 165, 250, 0.82);
  border-radius: 7px;
  background: rgba(96, 165, 250, 0.06);
  box-shadow:
    0 0 0 1px rgba(219, 234, 254, 0.34),
    0 0 18px rgba(96, 165, 250, 0.26);
  pointer-events: none;
  animation: recognitionAppear 0.28s ease-out both;
}

.recognition-box::before,
.recognition-box::after {
  position: absolute;
  width: 8px;
  height: 8px;
  content: "";
  pointer-events: none;
}

.recognition-box::before {
  left: -1px;
  top: -1px;
  border-left: 2px solid rgba(96, 165, 250, 0.9);
  border-top: 2px solid rgba(96, 165, 250, 0.9);
  border-radius: 5px 0 0;
}

.recognition-box::after {
  right: -1px;
  bottom: -1px;
  border-right: 2px solid rgba(96, 165, 250, 0.9);
  border-bottom: 2px solid rgba(96, 165, 250, 0.9);
  border-radius: 0 0 5px;
}

.hotspot-marker {
  position: absolute;
  z-index: 6;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: hotspotAppear 0.3s ease-out both;
}

.hotspot-core {
  position: absolute;
  left: 0;
  top: 0;
  width: 15px;
  height: 15px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 42% 42%, #fff6c8 0 12%, #ffb23f 25%, #ff5a24 58%, rgba(255, 65, 35, 0.18) 100%);
  box-shadow:
    0 0 0 8px rgba(255, 125, 43, 0.12),
    0 0 18px rgba(255, 91, 29, 0.66),
    0 0 36px rgba(255, 155, 45, 0.34);
  transform: translate(-50%, -50%);
}

.hotspot-core::before,
.hotspot-core::after {
  position: absolute;
  inset: -13px;
  content: "";
  border-radius: inherit;
  border: 1px solid rgba(255, 150, 45, 0.36);
  animation: hotspotPulse 2.4s ease-out infinite;
}

.hotspot-core::after {
  inset: -22px;
  animation-delay: 0.6s;
  opacity: 0.5;
}

.hotspot-marker.is-medium .hotspot-core {
  width: 14px;
  height: 14px;
  box-shadow:
    0 0 0 6px rgba(255, 149, 43, 0.12),
    0 0 18px rgba(255, 111, 30, 0.66),
    0 0 34px rgba(255, 174, 52, 0.32);
}

.hotspot-marker.is-medium {
  left: 52%;
  top: 50%;
}

.hotspot-label {
  position: absolute;
  left: 18px;
  top: -48px;
  min-width: 88px;
  padding: 7px 9px 8px;
  border: 1px solid rgba(191, 219, 254, 0.55);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow:
    0 10px 24px rgba(37, 99, 235, 0.14),
    0 2px 10px rgba(15, 23, 42, 0.06);
  color: #163454;
  backdrop-filter: blur(12px);
  transform: translate3d(12px, -34px, 20px) rotateX(-18deg) rotateY(4deg) rotateZ(0deg);
  transform-origin: left bottom;
  transform-style: preserve-3d;
  animation: labelAppear 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.hotspot-label::before {
  position: absolute;
  left: -31px;
  bottom: 4px;
  width: 33px;
  height: 1px;
  content: "";
  background: rgba(249, 115, 22, 0.42);
  box-shadow: 0 0 7px rgba(249, 115, 22, 0.22);
  transform: rotate(33deg);
  transform-origin: right center;
}

.hotspot-label strong,
.hotspot-label span,
.hotspot-label em {
  display: block;
  font-style: normal;
  line-height: 1.15;
  white-space: nowrap;
}

.hotspot-label strong {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}

.hotspot-label span {
  margin-top: 3px;
  color: #355a7d;
  font-size: 10px;
  font-weight: 700;
}

.hotspot-label em {
  margin-top: 3px;
  color: #e95b25;
  font-size: 13px;
  font-weight: 800;
}

@keyframes hotspotPulse {
  0% {
    transform: scale(0.45);
    opacity: 0.72;
  }

  100% {
    transform: scale(1.25);
    opacity: 0;
  }
}

@keyframes recognitionAppear {
  0% {
    opacity: 0;
    transform: scale(0.92);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes inspectionPan {
  0% {
    transform: translateY(42px);
  }

  100% {
    transform: translateY(-18px);
  }
}

@keyframes idlePreviewPan {
  0% {
    transform: translate3d(-6px, 0, 0);
  }

  25% {
    transform: translate3d(6px, calc(-8.333333% - 0.75px), 0);
  }

  50% {
    transform: translate3d(-8px, calc(-16.666667% - 1.5px), 0);
  }

  75% {
    transform: translate3d(5px, calc(-25% - 2.25px), 0);
  }

  100% {
    transform: translate3d(-6px, var(--grid-loop-distance), 0);
  }
}

@keyframes scanSweep {
  0% {
    left: -18%;
    opacity: 0;
  }

  18%,
  72% {
    opacity: 0.8;
  }

  100% {
    left: 104%;
    opacity: 0;
  }
}

@keyframes idleScanSweep {
  0%,
  28% {
    left: -18%;
    opacity: 0;
  }

  45%,
  62% {
    opacity: 0.46;
  }

  86%,
  100% {
    left: 104%;
    opacity: 0;
  }
}

@keyframes hotspotAppear {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.6);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes labelAppear {
  0% {
    opacity: 0;
    transform: translate3d(8px, -18px, 8px) rotateX(-8deg) rotateY(2deg) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translate3d(12px, -34px, 20px) rotateX(-18deg) rotateY(4deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .detection-viewport.is-idle-preview .pv-idle-motion,
  .detection-viewport.is-idle-preview .scan-band,
  .recognition-box,
  .detection-viewport.is-running .pv-array-wrap,
  .detection-viewport.is-running .scan-band,
  .hotspot-marker,
  .hotspot-core::before,
  .hotspot-core::after,
  .hotspot-label {
    animation: none;
  }

  .detection-viewport.is-running .pv-array-wrap,
  .detection-viewport.is-completed .pv-array-wrap {
    transform: translateY(-18px);
  }

  .detection-viewport.is-idle-preview .pv-idle-motion {
    transform: translate3d(0, 0, 0);
  }
}

@media (max-width: 900px) {
  .array-plane {
    --solar-scene-scale: 1.66;
    max-width: 108%;
    transform: translateX(-72px) perspective(820px) rotateX(33deg) rotateZ(-3deg) translateY(36px)
      scale(var(--solar-scene-scale));
  }

  .pv-panel {
    flex-basis: clamp(60px, 8.4vw, 76px);
    width: clamp(60px, 8.4vw, 76px);
    height: clamp(32px, 4.5vw, 40px);
  }

  .pv-row {
    grid-template-columns: repeat(20, clamp(60px, 8.4vw, 76px));
  }

}
</style>
