<script setup lang="ts">
import { ref, watch } from 'vue'
import { playAlarm } from '../services/sound'
import { useDeviceStore } from '../stores/devices'
import type { Alarm } from '../types'

const store = useDeviceStore()
const current = ref<Alarm | null>(null)
const visible = ref(false)
let autoClose = 0
const seen = new Set<string>()

function time(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false })
}

watch(
  () => store.alarms[0]?.id,
  () => {
    const a = store.alarms[0]
    if (!a || a.handled || seen.has(a.id)) return
    seen.add(a.id)
    current.value = a
    visible.value = true
    playAlarm()
    clearTimeout(autoClose)
    autoClose = window.setTimeout(() => { visible.value = false }, 6000)
  }
)

function close() {
  visible.value = false
  clearTimeout(autoClose)
}

async function handle() {
  if (current.value) await store.resolveAlarm(current.value)
  close()
}
</script>

<template>
  <Transition name="dialog">
    <div v-if="visible && current" class="alarm-dialog-mask">
      <div class="alarm-dialog" :class="{ high: current.level === 'high' }">
        <div class="dialog-glow"></div>
        <div class="dialog-icon">⚠</div>
        <div class="dialog-content">
          <div class="dialog-title">
            {{ current.level === 'high' ? '高危报警' : '设备报警' }}
            <i>{{ current.typeName }}</i>
          </div>
          <div class="dialog-device">{{ current.deviceName }}</div>
          <div class="dialog-msg">{{ current.message }}</div>
          <div class="dialog-time">{{ time(current.createdAt) }}</div>
        </div>
        <div class="dialog-actions">
          <button class="d-btn primary" @click="handle">立即处理</button>
          <button class="d-btn ghost" @click="close">知道了</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.alarm-dialog-mask {
  position: fixed; inset: 0; z-index: 1000;
  display: grid; place-items: center;
  background: rgba(2, 6, 14, 0.45); backdrop-filter: blur(2px);
}
.alarm-dialog {
  position: relative; width: 420px; padding: 26px 28px;
  background: linear-gradient(160deg, rgba(40, 16, 18, 0.95), rgba(16, 20, 32, 0.96));
  border: 1px solid rgba(255, 77, 79, 0.6);
  box-shadow: 0 0 40px rgba(255, 77, 79, 0.35);
  display: grid; grid-template-columns: 64px 1fr; gap: 18px;
}
.alarm-dialog.high { border-color: #ff7a00; box-shadow: 0 0 44px rgba(255, 122, 0, 0.45); }
.dialog-glow {
  position: absolute; inset: 0; pointer-events: none;
  animation: dialogFlash 1s infinite;
}
@keyframes dialogFlash { 50% { box-shadow: inset 0 0 30px rgba(255, 77, 79, 0.25); } }
.dialog-icon {
  width: 64px; height: 64px; border-radius: 50%;
  display: grid; place-items: center; font-size: 30px; color: #ff4d4f;
  background: rgba(255, 77, 79, 0.15); border: 1px solid rgba(255, 77, 79, 0.5);
  animation: iconPulse 1.2s infinite;
}
@keyframes iconPulse { 50% { transform: scale(1.08); } }
.dialog-title { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.dialog-title i {
  font-style: normal; font-size: 11px; padding: 2px 7px; border-radius: 4px;
  background: rgba(255, 77, 79, 0.2); color: #ff9c9d;
}
.dialog-device { font-size: 15px; margin-top: 8px; }
.dialog-msg { font-size: 13px; color: #ffb0b1; margin-top: 6px; }
.dialog-time { font-size: 11px; color: #9fc4e6; margin-top: 8px; font-family: Consolas, monospace; }
.dialog-actions { grid-column: 1 / -1; display: flex; gap: 12px; margin-top: 6px; }
.d-btn { flex: 1; padding: 10px 0; border-radius: 8px; font-size: 14px; cursor: pointer; }
.d-btn.primary { background: linear-gradient(90deg, #ff4d4f, #ff7a45); color: #fff; border: none; }
.d-btn.ghost { background: transparent; color: #cfe0f5; border: 1px solid rgba(159, 196, 230, 0.4); }

.dialog-enter-active, .dialog-leave-active { transition: opacity 0.3s; }
.dialog-enter-active .alarm-dialog, .dialog-leave-active .alarm-dialog { transition: transform 0.3s; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
.dialog-enter-from .alarm-dialog, .dialog-leave-to .alarm-dialog { transform: scale(0.9); }
</style>
