<script setup lang="ts">
import { useDeviceStore } from '../stores/devices'
const store = useDeviceStore()
const cards = [
  { label: '接入设备', value: () => store.stats.total, tone: '#5db2e8' },
  { label: '在线', value: () => store.stats.online, tone: '#36c46f' },
  { label: '离线', value: () => store.stats.offline, tone: '#8a8f99' },
  { label: '报警中', value: () => store.stats.alarmCount, tone: '#ff4d4f' },
  { label: '在线率', value: () => `${store.stats.onlineRate}%`, tone: '#d9b26a' },
  { label: '待处理报警', value: () => store.stats.unhandled, tone: '#ff9f43' }
]
</script>

<template>
  <div class="stats-bar">
    <div v-for="c in cards" :key="c.label" class="stat-card">
      <div class="stat-value" :style="{ color: c.tone }">{{ c.value() }}</div>
      <div class="stat-label">{{ c.label }}</div>
    </div>
  </div>
</template>
