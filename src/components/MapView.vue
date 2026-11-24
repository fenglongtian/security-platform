<script setup lang="ts">
import L from 'leaflet'
import { onMounted, ref, watch } from 'vue'
import { useDeviceStore } from '../stores/devices'
import type { Device, DeviceStatus } from '../types'

const store = useDeviceStore()
const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const markers = new Map<string, L.Marker>()

function colorFor(status: DeviceStatus) {
  if (status === 'alarm') return '#ff4d4f'
  if (status === 'offline') return '#8a8f99'
  return '#36c46f'
}

function iconFor(d: Device) {
  const color = colorFor(d.status)
  const pulse = d.status === 'alarm' ? ' alarm-pulse' : ''
  const rings = d.status === 'alarm'
    ? '<i class="ring r1"></i><i class="ring r2"></i>'
    : ''
  return L.divIcon({
    className: '',
    html: `<div class="map-marker${pulse}" style="--mk:${color}">${rings}<span>${glyph(d.type)}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  })
}

function glyph(type: string) {
  if (type === 'infrared') return '红外'
  if (type === 'smoke') return '烟感'
  return '防丢'
}

function syncMarkers() {
  if (!map) return
  const ids = new Set(store.devices.map((d) => d.id))
  for (const d of store.devices) {
    let m = markers.get(d.id)
    if (!m) {
      m = L.marker([d.lat, d.lng], { icon: iconFor(d) }).addTo(map)
      m.on('click', () => store.select(d.id))
      markers.set(d.id, m)
    } else {
      m.setLatLng([d.lat, d.lng])
      m.setIcon(iconFor(d))
    }
  }
  for (const [id, m] of markers) {
    if (!ids.has(id)) {
      m.remove()
      markers.delete(id)
    }
  }
}

// 报警设备出现时自动定位
watch(
  () => store.stats.alarmCount,
  async (count, old) => {
    if (count > (old || 0) && map) {
      const d = store.devices.find((x) => x.status === 'alarm')
      if (d) map.flyTo([d.lat, d.lng], Math.max(map.getZoom(), 13), { duration: 0.8 })
    }
  }
)

watch(() => store.devices, syncMarkers, { deep: true })

// 离线深色网格底图：每个瓦片用 canvas 画底色与网格线，无需外部瓦片/key
const GridLayer = L.GridLayer.extend({
  createTile() {
    const tile = document.createElement('canvas')
    tile.width = 256
    tile.height = 256
    const ctx = tile.getContext('2d')!
    ctx.fillStyle = '#0d141d'
    ctx.fillRect(0, 0, 256, 256)
    ctx.strokeStyle = 'rgba(93,178,232,0.14)'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, 256, 256)
    return tile
  }
})

onMounted(() => {
  map = L.map(mapEl.value!, { zoomControl: true, attributionControl: false }).setView([39.9042, 116.4074], 12)
  new GridLayer().addTo(map)
  syncMarkers()
})
</script>

<template>
  <div ref="mapEl" class="map-view"></div>
</template>

<style>
.map-view { width: 100%; height: 100%; min-height: 420px; border-radius: 14px; }
.map-marker {
  width: 30px; height: 30px; border-radius: 50%;
  background: color-mix(in srgb, var(--mk) 85%, #000);
  border: 2px solid #fff; color: #fff;
  display: grid; place-items: center; font-size: 9px; font-weight: 700;
  box-shadow: 0 0 10px var(--mk);
}
.map-marker { position: relative; }
.map-marker.alarm-pulse { animation: markerPulse 1s infinite; }
@keyframes markerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
  70% { box-shadow: 0 0 0 16px rgba(255, 77, 79, 0); }
}
.map-marker .ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 2px solid rgba(255, 77, 79, 0.8); pointer-events: none;
}
.map-marker .ring.r1 { animation: ringOut 1.8s ease-out infinite; }
.map-marker .ring.r2 { animation: ringOut 1.8s ease-out 0.9s infinite; }
@keyframes ringOut {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(3.2); opacity: 0; }
}
.leaflet-pane { z-index: 1; }
</style>
