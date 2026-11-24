<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDeviceStore } from '../stores/devices'

const store = useDeviceStore()
const shown = ref({ total: 0, online: 0, alarm: 0, unhandled: 0 })

function animate(key: 'total' | 'online' | 'alarm' | 'unhandled', target: number) {
  const start = shown.value[key]
  const diff = target - start
  const begin = performance.now()
  const dur = 700
  const step = (t: number) => {
    const p = Math.min(1, (t - begin) / dur)
    const eased = 1 - Math.pow(1 - p, 3)
    shown.value[key] = Math.round(start + diff * eased)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(() => store.stats.total, (v) => animate('total', v))
watch(() => store.stats.online, (v) => animate('online', v))
watch(() => store.stats.alarmCount, (v) => animate('alarm', v))
watch(() => store.stats.unhandled, (v) => animate('unhandled', v))
onMounted(() => {
  shown.value = { total: 0, online: 0, alarm: 0, unhandled: 0 }
})

const kpis = [
  { key: 'total', label: '接入设备总量', get: () => shown.value.total, color: '#5db2e8', icon: '▦', pulse: false },
  { key: 'online', label: '当前在线设备', get: () => shown.value.online, color: '#36c46f', icon: '◉', pulse: false },
  { key: 'alarm', label: '实时报警设备', get: () => shown.value.alarm, color: '#ff4d4f', icon: '⚠', pulse: true },
  { key: 'unhandled', label: '待处理事件', get: () => shown.value.unhandled, color: '#ffb84d', icon: '✦', pulse: false }
] as const
</script>

<template>
  <div class="kpi-row">
    <div v-for="k in kpis" :key="k.key" class="kpi-card" :style="{ '--kpi': k.color }">
      <div class="kpi-icon" :class="{ pulse: k.pulse }">{{ k.icon }}</div>
      <div class="kpi-info">
        <div class="kpi-value">{{ k.get() }}</div>
        <div class="kpi-label">{{ k.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; flex: none; }
.kpi-card {
  display: flex; align-items: center; gap: 14px; padding: 14px 18px;
  background: linear-gradient(120deg, rgba(20, 32, 50, 0.85), rgba(10, 16, 26, 0.85));
  border: 1px solid color-mix(in srgb, var(--kpi) 35%, transparent);
  box-shadow: inset 0 0 20px color-mix(in srgb, var(--kpi) 10%, transparent);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
}
.kpi-icon {
  width: 44px; height: 44px; display: grid; place-items: center; font-size: 20px;
  color: var(--kpi); background: color-mix(in srgb, var(--kpi) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--kpi) 45%, transparent);
}
.kpi-icon.pulse { animation: kpiPulse 1.2s infinite; }
@keyframes kpiPulse { 50% { box-shadow: 0 0 16px var(--kpi); } }
.kpi-value { font-size: 28px; font-weight: 700; color: var(--kpi); font-family: Consolas, monospace; line-height: 1; }
.kpi-label { font-size: 12px; color: #9fc4e6; margin-top: 6px; letter-spacing: 1px; }
</style>
