<template>
  <section class="video-panel">
    <article v-for="video in videos" :key="video.id" class="video-card">
      <h2 class="card-title">{{ video.title }}</h2>

      <div class="player-shell">
        <img :src="video.imageUrl" :alt="video.title" class="video-cover" />
        <button type="button" class="play-button" aria-label="播放">
          <BaseIcon name="play" :size="22" />
        </button>
        <div class="player-timeline">
          <div class="timeline-track"></div>
          <div class="timeline-progress"></div>
          <div class="timeline-knob"></div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { VideoCard } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "VideoComparisonPanel",
});

interface VideoComparisonPanelProps {
  videos: VideoCard[];
}

defineProps<VideoComparisonPanelProps>();
</script>

<style scoped>
.video-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.video-card {
  border: 1px solid rgba(224, 232, 243, 0.92);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  padding: 10px;
  box-shadow: 0 14px 30px rgba(50, 71, 101, 0.07);
}

.card-title {
  margin: 0 0 7px;
  color: #121a2b;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.1;
}

.player-shell {
  position: relative;
  height: clamp(290px, 41vh, 410px);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #d9e3f3;
  background: #0d1a3f;
}

.video-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.play-button {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48px;
  height: 48px;
  transform: translate(-50%, -50%);
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.34);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.player-timeline {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 12px;
  height: 14px;
}

.timeline-track {
  position: absolute;
  top: 50%;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%);
}

.timeline-progress {
  position: absolute;
  top: 50%;
  width: 26%;
  height: 2px;
  background: #2d8cff;
  transform: translateY(-50%);
}

.timeline-knob {
  position: absolute;
  top: 50%;
  left: 26%;
  width: 12px;
  height: 12px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #ffffff;
}

@media (max-width: 1180px) {
  .video-panel {
    grid-template-columns: 1fr;
  }
}
</style>
