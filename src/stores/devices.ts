import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { startMock } from '../services/mockDevices'
import type { Alarm, Device, Snapshot } from '../types'

export const useDeviceStore = defineStore('devices', () => {
  const devices = ref<Device[]>([])
  const alarms = ref<Alarm[]>([])
  const connected = ref(false)
  const source = ref<'ws' | 'mock' | 'connecting'>('connecting')
  const selectedId = ref<string | null>(null)

  let ws: WebSocket | null = null
  let settled = false

  function applySnapshot(s: Snapshot) {
    devices.value = s.devices
    alarms.value = s.alarms
  }

  function addAlarm(a: Alarm) {
    alarms.value = [a, ...alarms.value].slice(0, 30)
  }

  function startMockFallback() {
    if (settled) return
    settled = true
    source.value = 'mock'
    connected.value = false
    startMock(
      (s) => applySnapshot(s),
      (a) => addAlarm(a)
    )
  }

  function connect() {
    // 演示模式：直接用内置 Mock，不尝试连接后端
    if (import.meta.env.VITE_DEMO) {
      startMockFallback()
      return
    }
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${protocol}://${location.host}/ws`
    ws = new WebSocket(url)

    const fallbackTimer = setTimeout(() => startMockFallback(), 4000)

    ws.onopen = () => {
      connected.value = true
    }
    ws.onmessage = (ev) => {
      clearTimeout(fallbackTimer)
      settled = true
      source.value = 'ws'
      const msg = JSON.parse(ev.data)
      if (msg.type === 'snapshot') applySnapshot(msg.data)
      else if (msg.type === 'alarm') addAlarm(msg.data)
      else if (msg.type === 'resolve') {
        const alarm = alarms.value.find((a) => a.id === msg.data.alarmId)
        if (alarm) alarm.handled = true
        const d = devices.value.find((x) => x.id === msg.data.deviceId)
        if (d && d.status === 'alarm') d.status = 'online'
      }
    }
    ws.onerror = () => startMockFallback()
    ws.onclose = () => {
      connected.value = false
      if (!settled) startMockFallback()
    }
  }

  async function resolveAlarm(alarm: Alarm) {
    if (source.value === 'ws') {
      await fetch(`/api/alarms/${alarm.id}/resolve`, { method: 'POST' })
      return
    }
    // mock 模式本地处理
    alarm.handled = true
    const d = devices.value.find((x) => x.id === alarm.deviceId)
    if (d && d.status === 'alarm') d.status = 'online'
  }

  function select(id: string | null) {
    selectedId.value = id
  }

  const stats = computed(() => {
    const total = devices.value.length
    const online = devices.value.filter((d) => d.status === 'online').length
    const alarmCount = devices.value.filter((d) => d.status === 'alarm').length
    const offline = total - online - alarmCount
    return {
      total,
      online,
      offline,
      alarmCount,
      onlineRate: total ? Math.round((online / total) * 100) : 0,
      unhandled: alarms.value.filter((a) => !a.handled).length
    }
  })

  const selected = computed(() => devices.value.find((d) => d.id === selectedId.value) || null)

  return {
    devices, alarms, connected, source, selectedId, selected, stats,
    connect, resolveAlarm, select
  }
})
