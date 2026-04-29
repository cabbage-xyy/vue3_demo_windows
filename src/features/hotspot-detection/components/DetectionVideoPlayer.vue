<template>
  <article class="video-card">
    <h2>{{ video.title }}</h2>

    <div class="player-shell">
      <div class="media-frame">
        <video
          v-if="mediaUrl"
          class="video-media"
          :src="mediaUrl"
          muted
          playsinline
          preload="metadata"
        ></video>
        <img v-else class="video-media" :src="video.imageUrl" :alt="video.title" />

        <div v-if="showResultOverlay" class="hotspot-layer" aria-hidden="true">
          <span class="hotspot-marker marker-primary"></span>
          <span class="hotspot-marker marker-secondary"></span>
        </div>

        <button type="button" class="center-play" :aria-label="`播放${video.title}`">
          <BaseIcon name="play" :size="34" :stroke-width="1.8" />
        </button>
      </div>

      <footer class="player-controls">
        <div class="timeline-row">
          <BaseIcon name="pause" :size="17" :stroke-width="2.8" />
          <div
            class="timeline"
            role="progressbar"
            :aria-valuenow="clampedProgress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${video.title}播放进度`"
          >
            <span class="timeline-track"></span>
            <span class="timeline-progress" :style="progressStyle"></span>
            <span class="timeline-knob" :style="knobStyle"></span>
          </div>
          <span class="control-time">{{ video.duration }}</span>
        </div>

        <button type="button" class="fullscreen-button" :aria-label="`放大${video.title}`" :title="`放大${video.title}`">
          <BaseIcon name="maximize" :size="18" :stroke-width="2.4" />
        </button>
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { VideoCard } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "DetectionVideoPlayer",
});

interface DetectionVideoPlayerProps {
  video: VideoCard;
  mediaUrl?: string | null;
}

const props = withDefaults(defineProps<DetectionVideoPlayerProps>(), {
  mediaUrl: null,
});

const clampedProgress = computed(() => Math.max(0, Math.min(100, props.video.progress ?? 0)));
const progressStyle = computed(() => ({ width: `${clampedProgress.value}%` }));
const knobStyle = computed(() => ({ left: `${clampedProgress.value}%` }));
const showResultOverlay = computed(() => props.video.id === "result-video");
</script>

<style scoped>
.video-card {
  min-width: 0;
  display: grid;
  grid-template-rows: auto auto;
  gap: 7px;
}

.video-card h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.player-shell {
  min-width: 0;
  min-height: 0;
  border: 1px solid #0f1726;
  border-radius: 7px;
  background: #121b2d;
  box-shadow: 0 14px 24px rgba(23, 38, 61, 0.16);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 36px;
  align-self: start;
}

.player-controls {
  background: linear-gradient(180deg, #131b2b 0%, #101827 100%);
  color: #d8e2f0;
}

.media-frame {
  position: relative;
  min-width: 0;
  aspect-ratio: 16 / 8;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(16, 24, 38, 0.08), rgba(16, 24, 38, 0.18)),
    #ced8e8;
}

.video-media {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.media-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 38, 0.04), rgba(15, 23, 38, 0.08));
  pointer-events: none;
}

.center-play {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 999px;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.48);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(13, 24, 40, 0.16);
}

.center-play svg {
  transform: translateX(2px);
  fill: currentColor;
}

.hotspot-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hotspot-marker {
  position: absolute;
  border: 2px solid rgba(255, 178, 54, 0.95);
  border-radius: 4px;
  box-shadow:
    0 0 0 2px rgba(255, 178, 54, 0.18),
    0 0 18px rgba(255, 90, 54, 0.28);
}

.marker-primary {
  left: 63%;
  top: 47%;
  width: 8%;
  height: 8%;
}

.marker-secondary {
  left: 38%;
  top: 58%;
  width: 6%;
  height: 6%;
}

.player-controls {
  min-width: 0;
  padding: 0 10px 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.timeline-row,
.control-buttons {
  min-width: 0;
  display: flex;
  align-items: center;
}

.timeline-row {
  flex: 1;
  gap: 10px;
}

.control-time {
  color: #aeb9c9;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.timeline {
  position: relative;
  min-width: 0;
  height: 18px;
  flex: 1;
}

.timeline-track,
.timeline-progress {
  position: absolute;
  left: 0;
  top: 50%;
  height: 3px;
  border-radius: 999px;
  transform: translateY(-50%);
}

.timeline-track {
  width: 100%;
  background: rgba(230, 238, 248, 0.26);
  box-shadow: inset 0 0 0 1px rgba(230, 238, 248, 0.05);
}

.timeline-progress {
  background: linear-gradient(90deg, #4aa3ff 0%, #1f7cff 100%);
  box-shadow: 0 0 10px rgba(31, 124, 255, 0.32);
}

.timeline-knob {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ffffff;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.25);
}

.fullscreen-button {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border: 1px solid rgba(219, 230, 246, 0.2);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.04);
  color: #d8e2f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.fullscreen-button:hover {
  border-color: rgba(74, 163, 255, 0.72);
  background: rgba(31, 124, 255, 0.16);
  color: #ffffff;
  transform: translateY(-1px);
}

@media (max-width: 980px) {
  .video-card {
    min-height: 360px;
  }
}

@media (max-width: 640px) {
  .player-shell {
    grid-template-rows: auto 38px;
  }

  .video-card h2 {
    font-size: 19px;
  }
}
</style>
