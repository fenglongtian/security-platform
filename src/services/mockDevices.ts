import type { Alarm, Device, DeviceType, Snapshot } from '../types'

const TYPE_META: Record<DeviceType, string> = {
  infrared: '智能红外',
  smoke: '智能烟感',
  antiLost: '智能防丢'
}
const CENTER = { lat: 39.9042, lng: 116.4074 }
const COUNT = 42

function rand(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 1e6) / 1e6
}

function makeDevices(): Device[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const keys = Object.keys(TYPE_META) as DeviceType[]
    const type = keys[i % keys.length]
    return {
      id: `DEV-${String(i + 1).padStart(3, '0')}`,
      type,
      typeName: TYPE_META[type],
      name: `${TYPE_META[type]}-${String(i + 1).padStart(3, '0')}`,
      lat: rand(CENTER.lat - 0.09, CENTER.lat + 0.09),
      lng: rand(CENTER.lng - 0.12, CENTER.lng + 0.12),
      status: Math.random() < 0.12 ? 'offline' : 'online',
      battery: rand(18, 100),
      lastHeartbeat: Date.now()
    }
  })
}

function alarmMessage(type: DeviceType) {
  if (type === 'infrared') return '检测到异常入侵移动'
  if (type === 'smoke') return '烟雾浓度超过阈值'
  return '防丢设备离开安全围栏'
}

export interface MockHandle {
  stop: () => void
}

// 纯前端演示数据源：定时心跳 + 随机报警，回调驱动 store
export function startMock(
  onSnapshot: (s: Snapshot) => void,
  onAlarm: (a: Alarm) => void
): MockHandle {
  const devices = makeDevices()
  const alarms: Alarm[] = []

  const emit = () => onSnapshot({ devices, alarms: alarms.slice(0, 30) })

  const tickTimer = setInterval(() => {
    const now = Date.now()
    for (const d of devices) {
      if (d.status === 'alarm') continue
      d.lastHeartbeat = now
      if (d.status === 'online' && Math.random() < 0.015) d.status = 'offline'
      else if (d.status === 'offline' && Math.random() < 0.25) d.status = 'online'
      if (d.battery > 1) d.battery = Math.max(1, Math.round((d.battery - Math.random() * 0.4) * 100) / 100)
    }
    emit()
  }, 2000)

  const alarmTimer = setInterval(() => {
    const candidates = devices.filter((d) => d.status === 'online')
    if (candidates.length === 0) return
    const d = candidates[Math.floor(Math.random() * candidates.length)]
    d.status = 'alarm'
    const alarm: Alarm = {
      id: `ALM-${Date.now().toString(36).toUpperCase()}`,
      deviceId: d.id,
      deviceName: d.name,
      type: d.type,
      lat: d.lat,
      lng: d.lng,
      level: Math.random() < 0.3 ? 'high' : 'normal',
      message: alarmMessage(d.type),
      createdAt: Date.now(),
      handled: false
    }
    alarms.unshift(alarm)
    if (alarms.length > 50) alarms.pop()
    onAlarm(alarm)
    emit()
  }, 6000)

  emit()
  return {
    stop() {
      clearInterval(tickTimer)
      clearInterval(alarmTimer)
    }
  }
}
