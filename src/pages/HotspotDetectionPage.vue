<template>
  <!-- 路由页面薄封装：热斑检测业务全部收敛到 feature dashboard。 -->
  <HotspotDetectionDashboard />
</template>

<script setup lang="ts">
import HotspotDetectionDashboard from "@/features/hotspot-detection/components/HotspotDetectionDashboard.vue";

defineOptions({
  name: "HotspotDetectionPage",
});
</script>
