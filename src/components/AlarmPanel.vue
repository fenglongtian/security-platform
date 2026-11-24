<script setup lang="ts">
import { useDeviceStore } from '../stores/devices'
const store = useDeviceStore()

function time(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false })
}
</script>

<template>
  <div class="alarm-panel">
    <div class="panel-head">
      <span>实时报警</span>
      <em>{{ store.stats.unhandled }} 待处理</em>
    </div>
    <div class="list-scroll">
      <div v-for="a in store.alarms" :key="a.id" class="alarm-row" :class="{ high: a.level === 'high', done: a.handled }">
        <div class="alarm-main" @click="store.select(a.deviceId)">
          <div class="alarm-name">{{ a.deviceName }} <i v-if="a.level === 'high'">高危</i></div>
          <div class="alarm-msg">{{ a.message }} · {{ time(a.createdAt) }}</div>
        </div>
        <button v-if="!a.handled" class="resolve-btn" @click="store.resolveAlarm(a)">处理</button>
        <span v-else class="done-tag">已处理</span>
      </div>
      <p v-if="store.alarms.length === 0" class="empty">暂无报警，系统运行正常</p>
    </div>
  </div>
</template>
