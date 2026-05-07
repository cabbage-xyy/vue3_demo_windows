<template>
  <!-- 应用根节点只负责挂载路由视图，具体页面外壳由 layout 管理。 -->
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";

defineOptions({
  name: "App",
});
</script>

<style></style>
