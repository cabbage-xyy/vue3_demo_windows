<template>
  <section class="ai-panel" aria-label="AI 助手对话">
    <header class="assistant-header">
      <strong>小芯助手</strong>
      <span class="online-status"><i aria-hidden="true"></i>在线</span>
    </header>

    <div ref="messageListRef" class="message-list">
      <template v-for="(message, index) in messages" :key="message.id">
        <article class="message-bubble" :class="message.role">
          <template v-if="message.role === 'thinking'">
            <span>正在分析</span>
            <i aria-hidden="true"></i>
            <i aria-hidden="true"></i>
            <i aria-hidden="true"></i>
          </template>
          <template v-else>
            <p>{{ message.text }}</p>
            <time>{{ message.time }}</time>
          </template>
        </article>

        <div v-if="index === 0 && visibleQuickActionCount > 0" class="quick-actions" aria-label="AI 快捷操作">
          <button
            v-for="command in quickCommands.slice(0, visibleQuickActionCount)"
            :key="command"
            type="button"
            @click="sendMessage(command)"
          >
            {{ command }}
          </button>
        </div>
      </template>
    </div>

    <form class="assistant-input" @submit.prevent="sendMessage(inputText)">
      <input v-model="inputText" type="text" placeholder="输入指令，例如：复核 A-03-18" />
      <button type="submit">发送</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { AiAssistantMessage } from "@/features/hotspot-detection/types/dashboard";

defineOptions({
  name: "EmbeddedAiAssistantPanel",
});

interface EmbeddedAiAssistantPanelProps {
  messages: AiAssistantMessage[];
}

const props = defineProps<EmbeddedAiAssistantPanelProps>();

interface ChatMessage {
  id: number;
  role: "ai" | "user" | "thinking";
  text: string;
  time: string;
}

const fallbackWelcomeMessage: ChatMessage = {
  id: 1,
  role: "ai",
  text: "您好，我是小芯助手",
  time: "09:12",
};

const defaultMessages: ChatMessage[] = [
  fallbackWelcomeMessage,
  {
    id: 2,
    role: "user",
    text: "帮我定位疑似热斑组件。",
    time: "09:12",
  },
  {
    id: 3,
    role: "ai",
    text: "发现 2 处异常，建议优先复核 A-03-18，温差 18.6℃。",
    time: "09:13",
  },
];

const inputText = ref("");
const messageListRef = ref<HTMLElement | null>(null);
const thinkingMessageId = ref<number | null>(null);
const visibleQuickActionCount = ref(0);
let replyTimer: number | null = null;
let welcomeTimer: number | null = null;
let quickActionsTimer: number | null = null;
const quickActionTimers: number[] = [];

const quickCommands = ["定位高风险组件", "生成诊断摘要", "导出巡检报告"];

const initialMessages: ChatMessage[] =
  props.messages.length > 0
    ? props.messages.slice(0, 3).map((message, index) => ({
        id: message.id,
        role: message.role === "user" ? "user" : "ai",
        text: index === 0 ? "您好，我是小芯助手" : message.text,
        time: index < 2 ? "09:12" : "09:13",
      }))
    : defaultMessages;

const welcomeMessage = initialMessages[0] ?? fallbackWelcomeMessage;
const messages = ref<ChatMessage[]>([]);

const formatTime = () => {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const createMessageId = () => Date.now() + Math.random();

const scrollToBottom = async () => {
  await nextTick();

  if (!messageListRef.value) {
    return;
  }

  messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
};

const removeThinkingMessage = () => {
  if (thinkingMessageId.value === null) {
    return;
  }

  messages.value = messages.value.filter((message) => message.id !== thinkingMessageId.value);
  thinkingMessageId.value = null;
};

const showThinkingMessage = () => {
  removeThinkingMessage();

  const messageId = createMessageId();
  thinkingMessageId.value = messageId;
  messages.value.push({
    id: messageId,
    role: "thinking",
    text: "正在分析",
    time: "",
  });
  void scrollToBottom();
};

const createAiReply = (text: string) => {
  if (text.includes("复核") || text.includes("A-03-18")) {
    return "已标记 A-03-18 为优先复核组件，建议查看红外温差和可见光遮挡情况。";
  }

  if (text.includes("报告")) {
    return "已整理当前检测摘要，可继续点击导出巡检报告。";
  }

  return "已收到指令，正在分析当前检测画面。";
};

const appendAiReply = (sourceText: string) => {
  if (replyTimer !== null) {
    window.clearTimeout(replyTimer);
  }

  showThinkingMessage();

  const delay = 500 + Math.round(Math.random() * 300);
  replyTimer = window.setTimeout(() => {
    removeThinkingMessage();
    messages.value.push({
      id: createMessageId(),
      role: "ai",
      text: createAiReply(sourceText),
      time: formatTime(),
    });
    replyTimer = null;
    void scrollToBottom();
  }, delay);
};

const sendMessage = (text: string) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  messages.value.push({
    id: createMessageId(),
    role: "user",
    text: trimmedText,
    time: formatTime(),
  });
  inputText.value = "";
  void scrollToBottom();
  appendAiReply(trimmedText);
};

const showQuickActionsSequentially = () => {
  visibleQuickActionCount.value = 0;

  quickCommands.forEach((_, index) => {
    const timer = window.setTimeout(() => {
      visibleQuickActionCount.value = index + 1;
    }, index * 100);

    quickActionTimers.push(timer);
  });
};

onMounted(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    messages.value = [welcomeMessage];
    visibleQuickActionCount.value = quickCommands.length;
    void scrollToBottom();
    return;
  }

  welcomeTimer = window.setTimeout(() => {
    messages.value = [welcomeMessage];
    void scrollToBottom();
  }, 300);

  quickActionsTimer = window.setTimeout(() => {
    showQuickActionsSequentially();
  }, 820);
});

onBeforeUnmount(() => {
  if (replyTimer !== null) {
    window.clearTimeout(replyTimer);
  }

  if (welcomeTimer !== null) {
    window.clearTimeout(welcomeTimer);
  }

  if (quickActionsTimer !== null) {
    window.clearTimeout(quickActionsTimer);
  }

  quickActionTimers.forEach((timer) => window.clearTimeout(timer));
});
</script>

<style scoped>
.ai-panel {
  min-width: 0;
  height: 100%;
  max-height: 100%;
  border: 0;
  border-radius: 0 18px 18px 0;
  background: transparent;
  padding: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-content: stretch;
  overflow: visible;
}

header {
  width: fit-content;
  border: 1px solid rgba(216, 229, 246, 0.76);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  padding: 7px 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 14px 34px rgba(45, 84, 132, 0.1);
  backdrop-filter: blur(14px);
}

.assistant-header {
  animation: headerFadeIn 280ms ease-out both;
}

.online-status {
  border-radius: 999px;
  background: #eaf8f2;
  color: #12805a;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.online-status i {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #23c77b;
  box-shadow: 0 0 0 0 rgba(35, 199, 123, 0.32);
  animation: onlinePulse 2.4s ease-in-out infinite;
}

header strong {
  color: #111827;
  font-size: 13px;
}

.message-list {
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 0;
  scrollbar-width: none;
}

.message-list::-webkit-scrollbar {
  display: none;
}

.message-bubble {
  width: fit-content;
  max-width: 75%;
  border: 1px solid rgba(219, 230, 245, 0.72);
  border-radius: 18px 18px 18px 6px;
  padding: 8px 12px;
  color: #27364f;
  background: rgba(255, 255, 255, 0.28);
  font-size: 12px;
  line-height: 1.45;
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(45, 84, 132, 0.06);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  animation: aiMessageIn 300ms ease-out both;
}

.message-bubble.ai {
  align-self: flex-start;
}

.message-bubble.user {
  align-self: flex-end;
  color: #ffffff;
  border-color: rgba(31, 102, 237, 0.68);
  border-radius: 18px 18px 6px 18px;
  background: linear-gradient(135deg, #3b98ff, #1f66ed);
  box-shadow: 0 10px 22px rgba(35, 105, 239, 0.18);
  animation-name: userMessageIn;
}

.message-bubble.thinking {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-color: rgba(214, 228, 246, 0.62);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  color: #71829b;
  padding: 6px 11px;
  font-size: 11px;
  font-weight: 800;
  animation-name: aiMessageIn;
}

.message-bubble.thinking i {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #3b98ff;
  opacity: 0.42;
  animation: typingDot 1.55s ease-in-out infinite;
}

.message-bubble.thinking i:nth-of-type(2) {
  animation-delay: 160ms;
}

.message-bubble.thinking i:nth-of-type(3) {
  animation-delay: 320ms;
}

.message-bubble p {
  margin: 0;
}

.message-bubble time {
  display: block;
  margin-top: 4px;
  color: rgba(113, 130, 155, 0.82);
  font-size: 10px;
  font-weight: 800;
}

.message-bubble.user time {
  color: rgba(255, 255, 255, 0.72);
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  max-width: 100%;
}

.quick-actions button {
  height: 25px;
  border: 1px solid rgba(194, 213, 244, 0.78);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  color: #245fce;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(45, 84, 132, 0.06);
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
  animation: commandFadeIn 320ms ease-out both;
}

.quick-actions button:hover {
  transform: translateY(-2px);
  border-color: rgba(113, 163, 244, 0.78);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12px 24px rgba(45, 84, 132, 0.11);
}

.assistant-input {
  max-width: 100%;
  align-self: end;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  transform: translateY(var(--assistant-input-offset, 0));
}

.assistant-input input {
  min-width: 0;
  height: 34px;
  border: 1px solid rgba(216, 229, 246, 0.76);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  padding: 0 12px;
  color: #1f2c42;
  font: inherit;
  outline: none;
  box-shadow: 0 12px 28px rgba(45, 84, 132, 0.08);
  backdrop-filter: blur(14px);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.assistant-input input:focus,
.assistant-input input:focus-visible {
  outline: none;
  border-color: rgba(37, 99, 235, 0.35);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.assistant-input button {
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #1f66ed;
  color: #ffffff;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

@keyframes onlinePulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(35, 199, 123, 0.28);
    transform: scale(1);
  }

  50% {
    box-shadow: 0 0 0 5px rgba(35, 199, 123, 0);
    transform: scale(0.94);
  }
}

@keyframes headerFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes commandFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
    box-shadow:
      0 8px 18px rgba(45, 84, 132, 0.05),
      0 0 0 rgba(59, 152, 255, 0);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    box-shadow:
      0 8px 18px rgba(45, 84, 132, 0.06),
      0 0 14px rgba(59, 152, 255, 0.1);
  }
}

@keyframes typingDot {
  0%,
  80%,
  100% {
    opacity: 0.32;
    transform: translateY(0);
  }

  40% {
    opacity: 0.82;
    transform: translateY(-2px);
  }
}

@keyframes aiMessageIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes userMessageIn {
  from {
    opacity: 0;
    transform: translateX(8px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .online-status i,
  .message-bubble.thinking i,
  .message-bubble,
  .assistant-header,
  .quick-actions button {
    animation: none;
  }

  .quick-actions button,
  .assistant-input input {
    transition: none;
  }

  .quick-actions button:hover {
    transform: none;
  }
}
</style>
