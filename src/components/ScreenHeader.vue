<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useDeviceStore } from '../stores/devices'

const store = useDeviceStore()
const now = ref(new Date())
let t = 0
onMounted(() => {
  t = window.setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => clearInterval(t))

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function dateText() {
  const d = now.value
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 星期${week}`
}
function timeText() {
  const d = now.value
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
</script>

<template>
  <header class="screen-header">
    <div class="head-side">
      <span class="head-dot"></span>
      <span>{{ store.source === 'ws' ? '实时链路正常' : '演示数据' }}</span>
    </div>
    <div class="head-center">
      <span class="head-line left"></span>
      <h1>智慧安防监控指挥中心</h1>
      <span class="head-line right"></span>
    </div>
    <div class="head-side time">
      <span>{{ dateText() }}</span>
      <span class="clock">{{ timeText() }}</span>
    </div>
  </header>
</template>

<style scoped>
.screen-header {
  position: relative; display: grid;
  grid-template-columns: 1fr auto 1fr; align-items: center;
  height: 64px; flex: none;
}
.head-center { position: relative; display: flex; align-items: center; }
.head-center h1 {
  margin: 0; font-size: 30px; letter-spacing: 8px; font-weight: 700;
  background: linear-gradient(180deg, #ffffff, #6fc3ff);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  text-shadow: 0 0 24px rgba(93, 178, 232, 0.5);
  white-space: nowrap;
}
.head-line { height: 2px; width: 120px; position: relative; }
.head-line.left { background: linear-gradient(90deg, transparent, #5db2e8); margin-right: 18px; }
.head-line.right { background: linear-gradient(90deg, #5db2e8, transparent); margin-left: 18px; }
.head-side { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #9fc4e6; }
.head-side.time { justify-content: flex-end; }
.head-dot { width: 9px; height: 9px; border-radius: 50%; background: #36c46f; box-shadow: 0 0 10px #36c46f; animation: blink 1.4s infinite; }
.clock { font-family: Consolas, monospace; color: #6fc3ff; font-size: 16px; letter-spacing: 1px; }
@keyframes blink { 50% { opacity: 0.35; } }
</style>
