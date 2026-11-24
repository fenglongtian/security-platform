// Mock 设备中心：模拟红外 / 烟感 / 防丢设备的心跳、位置与报警事件
const TYPES = [
  { key: 'infrared', name: '智能红外' },
  { key: 'smoke', name: '智能烟感' },
  { key: 'antiLost', name: '智能防丢' }
]

// 北京城区中心，随机点位在其周边
const CENTER = { lat: 39.9042, lng: 116.4074 }
const DEVICE_COUNT = 42

function rand(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 1e6) / 1e6
}

function makeDevices() {
  const list = []
  for (let i = 0; i < DEVICE_COUNT; i++) {
    const t = TYPES[i % TYPES.length]
    list.push({
      id: `DEV-${String(i + 1).padStart(3, '0')}`,
      type: t.key,
      typeName: t.name,
      name: `${t.name}-${String(i + 1).padStart(3, '0')}`,
      lat: rand(CENTER.lat - 0.09, CENTER.lat + 0.09),
      lng: rand(CENTER.lng - 0.12, CENTER.lng + 0.12),
      status: Math.random() < 0.12 ? 'offline' : 'online',
      battery: rand(18, 100),
      lastHeartbeat: Date.now()
    })
  }
  return list
}

class DeviceCenter {
  constructor() {
    this.devices = makeDevices()
    this.alarms = []
  }

  snapshot() {
    return { devices: this.devices, alarms: this.alarms.slice(0, 30) }
  }

  // 每 2 秒：在线设备刷新心跳、电量微变、少量离线抖动
  tick() {
    const now = Date.now()
    for (const d of this.devices) {
      if (d.status === 'alarm') continue
      d.lastHeartbeat = now
      if (d.status === 'online' && Math.random() < 0.015) d.status = 'offline'
      else if (d.status === 'offline' && Math.random() < 0.25) d.status = 'online'
      if (d.battery > 1) d.battery = Math.max(1, Math.round((d.battery - Math.random() * 0.4) * 100) / 100)
    }
    return { type: 'snapshot', data: this.snapshot() }
  }

  // 随机触发一次报警（仅在线设备）
  triggerAlarm() {
    const candidates = this.devices.filter((d) => d.status === 'online')
    if (candidates.length === 0) return null
    const d = candidates[Math.floor(Math.random() * candidates.length)]
    d.status = 'alarm'
    const alarm = {
      id: `ALM-${now36()}`,
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
    this.alarms.unshift(alarm)
    if (this.alarms.length > 50) this.alarms.pop()
    return { type: 'alarm', data: alarm }
  }

  // 解除报警：设备恢复在线
  resolve(alarmId) {
    const alarm = this.alarms.find((a) => a.id === alarmId)
    if (!alarm) return null
    alarm.handled = true
    const d = this.devices.find((x) => x.id === alarm.deviceId)
    if (d && d.status === 'alarm') d.status = 'online'
    return { type: 'resolve', data: { alarmId, deviceId: alarm.deviceId } }
  }
}

function alarmMessage(type) {
  if (type === 'infrared') return '检测到异常入侵移动'
  if (type === 'smoke') return '烟雾浓度超过阈值'
  return '防丢设备离开安全围栏'
}

function now36() {
  return Date.now().toString(36).toUpperCase()
}

module.exports = { DeviceCenter, TYPES }
