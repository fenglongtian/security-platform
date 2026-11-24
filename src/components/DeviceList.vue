<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDeviceStore } from '../stores/devices'
import type { DeviceType } from '../types'

const store = useDeviceStore()
const filter = ref<'all' | DeviceType>('all')
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'infrared', label: '红外' },
  { key: 'smoke', label: '烟感' },
  { key: 'antiLost', label: '防丢' }
] as const

const list = computed(() =>
  filter.value === 'all' ? store.devices : store.devices.filter((d) => d.type === filter.value)
)

function statusText(s: string) {
  return s === 'alarm' ? '报警' : s === 'offline' ? '离线' : '在线'
}
</script>

<template>
  <div class="device-list">
    <div class="mini-tabs">
      <button v-for="t in tabs" :key="t.key" :class="{ on: filter === t.key }" @click="filter = t.key">
        {{ t.label }}
      </button>
    </div>
    <div class="list-scroll">
      <div
        v-for="d in list" :key="d.id" class="device-row"
        :class="{ sel: store.selectedId === d.id, alarm: d.status === 'alarm' }"
        @click="store.select(d.id)"
      >
        <span class="dot" :data-status="d.status"></span>
        <div class="row-main">
          <div class="row-name">{{ d.name }}</div>
          <div class="row-meta">电量 {{ Math.round(d.battery) }}% · {{ statusText(d.status) }}</div>
        </div>
      </div>
      <p v-if="list.length === 0" class="empty">暂无设备</p>
    </div>
  </div>
</template>
