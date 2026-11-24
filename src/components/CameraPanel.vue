<script setup lang="ts">
import { useDeviceStore } from '../stores/devices'
const store = useDeviceStore()
</script>

<template>
  <div class="camera-panel">
    <div class="panel-head"><span>现场摄像头</span><em>{{ store.selected?.name || '未选择设备' }}</em></div>
    <div class="camera-view" :class="{ live: store.selected && store.selected.status === 'alarm' }">
      <template v-if="store.selected">
        <div class="scanline"></div>
        <div class="cam-label">CAM · {{ store.selected.id }} · {{ store.selected.status === 'alarm' ? '报警画面' : '实时画面' }}</div>
        <div class="rec" v-if="store.selected.status === 'alarm'">● REC</div>
      </template>
      <p v-else class="empty">点击地图或设备列表选择点位</p>
    </div>
    <div v-if="store.selected" class="cam-meta">
      <div>坐标：{{ store.selected.lat.toFixed(4) }}, {{ store.selected.lng.toFixed(4) }}</div>
      <div>电量：{{ Math.round(store.selected.battery) }}% · 最后心跳 {{ new Date(store.selected.lastHeartbeat).toLocaleTimeString('zh-CN', { hour12: false }) }}</div>
    </div>
  </div>
</template>
