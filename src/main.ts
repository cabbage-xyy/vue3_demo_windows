
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./styles/base.css";

// 单一启动入口：注册路由和全局基础样式，业务页面从路由树进入。
createApp(App).use(router).mount("#app");
