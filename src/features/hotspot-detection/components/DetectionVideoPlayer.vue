<template>
  <!-- 单个视频卡片：原始视频使用 video 控制，检测结果使用图片预览。 -->
  <article class="video-card" :class="{ 'result-image-card': isResultImageSequence }">
    <h2>{{ video.title }}</h2>

    <div class="player-shell">
      <div class="media-frame">
        <video
          v-if="mediaUrl && !isResultImageSequence"
          ref="videoRef"
          class="video-media"
          :src="mediaUrl"
          muted
          playsinline
          preload="metadata"
          @loadedmetadata="handleLoadedMetadata"
          @timeupdate="handleTimeUpdate"
          @ended="handleVideoEnded"
          @click="togglePlay"
        ></video>
        <img
          v-else
          class="video-media"
          :class="{ 'is-clickable-preview': isResultImageSequence }"
          :src="previewImageUrl"
          :alt="video.title"
          @click="openImagePreview"
        />

        <template v-if="isResultImageSequence && resultImageUrls.length > 1">
          <button
            v-if="canShowPreviousImage"
            type="button"
            class="image-nav image-nav-prev"
            aria-label="上一张检测结果图片"
            @click.stop="showPreviousImage"
          >
            ‹
          </button>
          <button
            v-if="canShowNextImage"
            type="button"
            class="image-nav image-nav-next"
            aria-label="下一张检测结果图片"
            @click.stop="showNextImage"
          >
            ›
          </button>

          <div class="image-dots" aria-label="检测结果图片切换指示器">
            <button
              v-for="(_, index) in resultImageUrls"
              :key="index"
              type="button"
              class="image-dot"
              :class="{ 'is-active': index === activeImageIndex }"
              :aria-label="`查看第 ${index + 1} 张检测结果图片`"
              @click.stop="activeImageIndex = index"
            ></button>
          </div>
        </template>

        <div v-if="showResultOverlay" class="hotspot-layer" aria-hidden="true">
          <span class="hotspot-marker marker-primary"></span>
          <span class="hotspot-marker marker-secondary"></span>
        </div>

        <button
          v-if="!isResultImageSequence"
          v-show="!isPlaying"
          type="button"
          class="center-play"
          :aria-label="`播放${video.title}`"
          @click.stop="togglePlay"
        >
          <BaseIcon name="play" :size="34" :stroke-width="1.8" />
        </button>
      </div>

      <footer v-if="!isResultImageSequence" class="player-controls">
        <div class="timeline-row">
          <button type="button" class="inline-play-button" :aria-label="`${isPlaying ? '暂停' : '播放'}${video.title}`" @click="togglePlay">
            <BaseIcon :name="isPlaying ? 'pause' : 'play'" :size="17" :stroke-width="2.8" />
          </button>
          <div
            class="timeline"
            role="progressbar"
            :aria-valuenow="clampedProgress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${video.title}播放进度`"
            @click="seekByTimeline"
          >
            <span class="timeline-track"></span>
            <span class="timeline-progress" :style="progressStyle"></span>
            <span class="timeline-knob" :style="knobStyle"></span>
          </div>
          <span class="control-time">{{ displayTime }}</span>
        </div>
      </footer>
    </div>
    <Teleport to="body">
      <div
        v-if="isPreviewOpen"
        class="image-preview-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="检测结果图片预览"
        @click.self="closeImagePreview"
      >
        <button
          type="button"
          class="image-preview-close"
          aria-label="关闭图片预览"
          @click="closeImagePreview"
        >
          ×
        </button>

        <img class="image-preview-content" :src="previewImageUrl" :alt="video.title" />
      </div>
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import type { VideoCard } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "DetectionVideoPlayer",
});

// 媒体 URL 可为空，此时回退到静态封面，避免未导入视频时出现空白卡片。
interface DetectionVideoPlayerProps {
  video: VideoCard;
  mediaUrl?: string | null;
  mediaUrls?: string[];
}

const props = withDefaults(defineProps<DetectionVideoPlayerProps>(), {
  mediaUrl: null,
  mediaUrls: () => [],
});

const videoRef = ref<HTMLVideoElement | null>(null);
const currentTime = ref(0);
const duration = ref(0);
const isPlaying = ref(false);
const activeImageIndex = ref(0);
const isPreviewOpen = ref(false);

// 播放控制状态只在本卡片内维护，不向父组件暴露视频播放器细节。
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const restSeconds = totalSeconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
};

const realVideoProgress = computed(() => {
  if (!props.mediaUrl || duration.value <= 0) {
    return props.video.progress ?? 0;
  }

  return (currentTime.value / duration.value) * 100;
});

const clampedProgress = computed(() => Math.max(0, Math.min(100, realVideoProgress.value)));
const progressStyle = computed(() => ({ width: `${clampedProgress.value}%` }));
const knobStyle = computed(() => ({ left: `${clampedProgress.value}%` }));
const showResultOverlay = computed(() => false);
const isResultImageSequence = computed(() => props.video.id === "result-video");
const resultImageUrls = computed(() => {
  if (!isResultImageSequence.value) {
    return [];
  }

  const urls = props.mediaUrls.filter(Boolean);

  if (urls.length > 0) {
    return urls;
  }

  return props.mediaUrl ? [props.mediaUrl] : [];
});
const canShowPreviousImage = computed(() => activeImageIndex.value > 0);
const canShowNextImage = computed(() => activeImageIndex.value < resultImageUrls.value.length - 1);
const previewImageUrl = computed(() => {
  if (isResultImageSequence.value) {
    return resultImageUrls.value[activeImageIndex.value] || props.video.imageUrl;
  }

  return props.video.imageUrl;
});
const displayTime = computed(() => {
  if (!props.mediaUrl || duration.value <= 0) {
    return props.video.duration;
  }

  return `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`;
});

// 导入新视频后自动尝试播放，失败时保留用户手动播放入口。
const handleLoadedMetadata = () => {
  if (!videoRef.value) {
    return;
  }

  duration.value = videoRef.value.duration;
  currentTime.value = videoRef.value.currentTime;

  void autoPlaySourceVideo();
};

const handleTimeUpdate = () => {
  if (!videoRef.value) {
    return;
  }

  currentTime.value = videoRef.value.currentTime;
};

const handleVideoEnded = () => {
  isPlaying.value = false;
  currentTime.value = duration.value;
};

const autoPlaySourceVideo = async () => {
  if (props.video.id !== "source-video" || !props.mediaUrl || !videoRef.value) {
    return;
  }

  try {
    videoRef.value.muted = true;
    videoRef.value.playsInline = true;

    if (videoRef.value.readyState === 0) {
      videoRef.value.load();
    }

    await videoRef.value.play();
    isPlaying.value = true;
  } catch (error) {
    isPlaying.value = false;
    console.warn("原始视频自动播放失败，需要用户手动点击播放：", error);
  }
};

const togglePlay = async () => {
  if (!videoRef.value || !props.mediaUrl) {
    return;
  }

  if (videoRef.value.paused) {
    await videoRef.value.play();
    isPlaying.value = true;
  } else {
    videoRef.value.pause();
    isPlaying.value = false;
  }
};

const seekByTimeline = (event: MouseEvent) => {
  if (!videoRef.value || !props.mediaUrl || duration.value <= 0) {
    return;
  }

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  videoRef.value.currentTime = ratio * duration.value;
  currentTime.value = videoRef.value.currentTime;
};

const showPreviousImage = () => {
  if (!canShowPreviousImage.value) {
    return;
  }

  activeImageIndex.value -= 1;
};

const showNextImage = () => {
  if (!canShowNextImage.value) {
    return;
  }

  activeImageIndex.value += 1;
};

const openImagePreview = () => {
  if (!isResultImageSequence.value || !previewImageUrl.value) {
    return;
  }

  isPreviewOpen.value = true;
};

const closeImagePreview = () => {
  isPreviewOpen.value = false;
};

const handlePreviewKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeImagePreview();
  }
};

watch(
  () => resultImageUrls.value.join("|"),
  () => {
    activeImageIndex.value = 0;
    isPreviewOpen.value = false;
  },
);

watch(
  () => props.mediaUrl,
  async () => {
    currentTime.value = 0;
    duration.value = 0;
    isPlaying.value = false;
    activeImageIndex.value = 0;
    isPreviewOpen.value = false;

    await nextTick();
    window.setTimeout(() => {
      void autoPlaySourceVideo();
    }, 80);
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("keydown", handlePreviewKeydown);

  window.setTimeout(() => {
    void autoPlaySourceVideo();
  }, 120);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handlePreviewKeydown);
});
</script>

<style scoped>
/* 视频卡片尺寸由父级网格控制，内部只负责播放器和时间轴。 */
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

.result-image-card .player-shell {
  grid-template-rows: auto;
  border-color: #d9e3f3;
  background: #f8fbff;
  box-shadow: 0 10px 22px rgba(23, 38, 61, 0.1);
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

video.video-media {
  cursor: pointer;
}

.result-image-card .video-media {
  cursor: default;
}

.result-image-card .media-frame {
  background: #ffffff;
}

.result-image-card .video-media {
  object-fit: contain;
}

.result-image-card .video-media.is-clickable-preview {
  cursor: zoom-in;
}

.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 42px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-content {
  max-width: min(1180px, calc(100vw - 96px));
  max-height: calc(100vh - 96px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.36);
}

.image-preview-close {
  position: fixed;
  top: 24px;
  right: 28px;
  z-index: 10000;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #172033;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}

.image-preview-close:hover {
  background: #ffffff;
  color: #1f66ed;
}

.image-nav {
  position: absolute;
  top: 50%;
  z-index: 3;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(214, 225, 240, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #1f2c42;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  line-height: 1;
  transform: translateY(-50%);
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(21, 39, 68, 0.16);
  backdrop-filter: blur(6px);
}

.image-nav:hover {
  background: #ffffff;
  color: #1f66ed;
  box-shadow: 0 10px 22px rgba(31, 102, 237, 0.2);
}

.image-nav-prev {
  left: 12px;
}

.image-nav-next {
  right: 12px;
}

.image-dots {
  position: absolute;
  left: 50%;
  bottom: 10px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transform: translateX(-50%);
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 6px 16px rgba(21, 39, 68, 0.12);
  backdrop-filter: blur(6px);
}

.image-dot {
  width: 7px;
  height: 7px;
  border: 0;
  border-radius: 999px;
  padding: 0;
  background: rgba(125, 143, 166, 0.45);
  cursor: pointer;
}

.image-dot.is-active {
  width: 8px;
  height: 8px;
  background: #16a66a;
  box-shadow: 0 0 0 3px rgba(22, 166, 106, 0.14);
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
  padding: 0 14px;
  display: flex;
  align-items: center;
}

.timeline-row {
  min-width: 0;
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.inline-play-button {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #d8e2f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  cursor: pointer;
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
