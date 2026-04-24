<template>
  <div class="app-shell">
    <div class="app-window">
      <nav class="app-topbar" aria-label="主导航">
        <RouterLink class="brand-panel" :to="{ name: routeNames.hotspotDetection }">
          <img class="brand-logo" :src="sunorenLogo" alt="SUNOREN 芯能科技" />
        </RouterLink>

        <div class="menu">
          <RouterLink
            v-for="item in appNavigationItems"
            :key="item.routeName"
            class="menu-item"
            :class="{ 'is-active': item.routeName === route.name }"
            :to="{ name: item.routeName }"
          >
            <BaseIcon :name="item.icon" :size="14" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>

        <div class="header-badges">
          <span class="badge">
            <strong>128</strong>
            在线设备
          </span>
          <span class="badge">
            <strong>06</strong>
            待处理告警
          </span>
          <div class="assistant-entry">
            <button type="button" class="ai-command" @click="toggleAssistant">
              <BaseIcon name="bot" :size="16" />
              AI 指令
            </button>

            <section v-if="isAssistantOpen" class="assistant-panel" aria-label="AI 指令助手">
              <header class="assistant-header">
                <div>
                  <strong>AI 指令助手</strong>
                  <span>输入任务指令后执行</span>
                </div>
                <button type="button" class="icon-action" aria-label="关闭" @click="closeAssistant">
                  <BaseIcon name="x" :size="16" />
                </button>
              </header>

              <div class="suggestions">
                <button
                  v-for="suggestion in commandSuggestions"
                  :key="suggestion"
                  type="button"
                  @click="runCommand(suggestion)"
                >
                  {{ suggestion }}
                </button>
              </div>

              <div class="chat-list">
                <article
                  v-for="message in messages"
                  :key="message.id"
                  class="chat-message"
                  :class="message.role"
                >
                  {{ message.text }}
                </article>
              </div>

              <form class="command-form" @submit.prevent="submitCommand">
                <input v-model.trim="commandText" type="text" placeholder="例如：开始检测当前视频" />
                <button type="submit" aria-label="发送指令">
                  <BaseIcon name="send" :size="16" />
                </button>
              </form>
            </section>
          </div>
        </div>
      </nav>

      <div class="app-main">
        <main class="app-content">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { appNavigationItems } from "@/app/navigation";
import BaseIcon from "@/components/base/BaseIcon.vue";
import { routeNames } from "@/router/route-names";
import sunorenLogo from "@/assets/sunoren-logo.svg";

defineOptions({
  name: "AppMainLayout",
});

const route = useRoute();

interface AssistantMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
}

const commandSuggestions = ["开始检测当前视频", "导出本次检测报告", "列出异常组件", "停止检测任务"];

const isAssistantOpen = ref(false);
const commandText = ref("");
const messages = ref<AssistantMessage[]>([
  {
    id: 1,
    role: "assistant",
    text: "你好，我可以执行检测、电站查询、停止任务、导出报告等指令。",
  },
]);

const toggleAssistant = () => {
  isAssistantOpen.value = !isAssistantOpen.value;
};

const closeAssistant = () => {
  isAssistantOpen.value = false;
};

const runCommand = (command: string) => {
  const trimmedCommand = command.trim();

  if (!trimmedCommand) {
    return;
  }

  messages.value.push({
    id: Date.now(),
    role: "user",
    text: trimmedCommand,
  });
  messages.value.push({
    id: Date.now() + 1,
    role: "assistant",
    text: `已执行：${trimmedCommand}`,
  });
  commandText.value = "";
};

const submitCommand = () => {
  runCommand(commandText.value);
};
</script>

<style scoped>
.app-shell {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 10px;
  background: #dfe6ee;
  color: #161d2b;
  overflow: hidden;
  box-sizing: border-box;
}

.app-window {
  width: 100%;
  max-width: none;
  height: 100%;
  margin: 0;
  box-sizing: border-box;
  border: 1px solid rgba(210, 221, 235, 0.72);
  border-radius: 4px;
  background:
    linear-gradient(135deg, rgba(229, 238, 255, 0.85), rgba(255, 255, 255, 0.72) 38%),
    #f8fbff;
  box-shadow: 0 8px 24px rgba(38, 54, 76, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-topbar {
  min-height: 58px;
  padding: 10px 24px 8px;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto minmax(180px, 1fr);
  align-items: center;
  gap: 18px;
}

.brand-panel {
  width: max-content;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.brand-logo {
  width: 158px;
  height: 44px;
  display: block;
  object-fit: contain;
}

.menu {
  min-width: 0;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(218, 228, 242, 0.86);
  display: inline-flex;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 10px 26px rgba(47, 91, 150, 0.08);
}

.menu-item {
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  color: #47566d;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.menu-item:hover,
.menu-item.is-active {
  color: #ffffff;
  background: linear-gradient(135deg, #3495ff 0%, #236bf4 100%);
  box-shadow: 0 8px 18px rgba(47, 130, 255, 0.28);
}

.app-main {
  min-width: 0;
  padding: 0 22px 14px;
  flex: 1;
  overflow: hidden;
}

.header-badges {
  justify-self: end;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  min-height: 34px;
  min-width: 92px;
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid rgba(220, 229, 241, 0.92);
  background: rgba(255, 255, 255, 0.78);
  color: #6c7d95;
  display: grid;
  align-content: center;
  gap: 2px;
  font-size: 12px;
  box-shadow: 0 12px 28px rgba(47, 91, 150, 0.07);
}

.badge strong {
  color: #192132;
  font-size: 16px;
  line-height: 1;
}

.assistant-entry {
  position: relative;
}

.ai-command {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid #2f7dfa;
  color: #ffffff;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent 45%),
    linear-gradient(135deg, #3495ff 0%, #236bf4 100%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 10px 22px rgba(47, 130, 255, 0.22);
  cursor: pointer;
}

.assistant-panel {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  z-index: 90;
  width: min(380px, calc(100vw - 48px));
  max-height: min(520px, calc(100vh - 220px));
  border: 1px solid rgba(216, 226, 241, 0.95);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 60px rgba(36, 58, 91, 0.18);
  padding: 14px;
  overflow: hidden;
}

.assistant-panel::before {
  content: "";
  position: absolute;
  top: -7px;
  right: 28px;
  width: 14px;
  height: 14px;
  border-left: 1px solid rgba(216, 226, 241, 0.95);
  border-top: 1px solid rgba(216, 226, 241, 0.95);
  background: rgba(255, 255, 255, 0.96);
  transform: rotate(45deg);
}

.assistant-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.assistant-header div {
  display: grid;
  gap: 4px;
}

.assistant-header strong {
  color: #121826;
  font-size: 15px;
}

.assistant-header span {
  color: #7d8da5;
  font-size: 12px;
}

.icon-action {
  width: 28px;
  height: 28px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #ffffff;
  color: #5b6b82;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.suggestions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.suggestions button {
  min-height: 30px;
  border: 1px solid #dce7f6;
  border-radius: 999px;
  background: #f6f9ff;
  color: #2d5fbe;
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
}

.chat-list {
  max-height: 240px;
  overflow-y: auto;
  display: grid;
  gap: 8px;
  padding: 2px 2px 10px;
}

.chat-message {
  max-width: 86%;
  border-radius: 14px;
  padding: 9px 11px;
  color: #243149;
  background: #f1f5fb;
  line-height: 1.5;
  font-size: 13px;
}

.chat-message.user {
  justify-self: end;
  color: #ffffff;
  background: #2f83ff;
}

.command-form {
  display: grid;
  grid-template-columns: 1fr 36px;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #e7edf7;
}

.command-form input {
  min-width: 0;
  height: 36px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #f8fbff;
  color: #1f2c42;
  padding: 0 13px;
  font: inherit;
  outline: none;
}

.command-form input:focus {
  border-color: #83b8ff;
  box-shadow: 0 0 0 3px rgba(47, 130, 255, 0.12);
}

.command-form button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: #2f83ff;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.app-content {
  min-width: 0;
  min-height: 100%;
}

@media (max-width: 1080px) {
  .app-shell {
    padding: 8px;
  }

  .app-topbar {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .header-badges {
    justify-self: stretch;
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .app-shell {
    padding: 0;
  }

  .app-window {
    border-radius: 0;
  }

  .app-topbar,
  .app-main {
    padding-left: 16px;
    padding-right: 16px;
  }

  .menu {
    width: 100%;
  }

  .menu-item {
    flex: 1;
    justify-content: center;
  }

  .header-badges {
    width: 100%;
    justify-content: stretch;
  }

  .badge {
    flex: 1;
  }
}
</style>
