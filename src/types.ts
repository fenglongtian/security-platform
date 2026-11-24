export type DeviceType = 'infrared' | 'smoke' | 'antiLost'
export type DeviceStatus = 'online' | 'offline' | 'alarm'

export interface Device {
  id: string
  type: DeviceType
  typeName: string
  name: string
  lat: number
  lng: number
  status: DeviceStatus
  battery: number
  lastHeartbeat: number
}

export interface Alarm {
  id: string
  deviceId: string
  deviceName: string
  type: DeviceType
  lat: number
  lng: number
  level: 'high' | 'normal'
  message: string
  createdAt: number
  handled: boolean
}

export interface Snapshot {
  devices: Device[]
  alarms: Alarm[]
}
