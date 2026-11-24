<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDeviceStore } from '../stores/devices'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])
const store = useDeviceStore()
const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function option() {
  const count = (t: string) => store.devices.filter((d) => d.type === t && d.status === 'alarm').length
  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,16,28,0.9)', borderColor: '#2a4a6a', textStyle: { color: '#cfe4ff' } },
    grid: { left: 36, right: 14, top: 20, bottom: 26 },
    xAxis: {
      type: 'category', data: ['红外', '烟感', '防丢'],
      axisLine: { lineStyle: { color: '#2a4a6a' } },
      axisLabel: { color: '#9fc4e6', fontSize: 11 }
    },
    yAxis: {
      type: 'value', minInterval: 1,
      splitLine: { lineStyle: { color: 'rgba(93,178,232,0.12)' } },
      axisLabel: { color: '#9fc4e6', fontSize: 10 }
    },
    series: [
      {
        type: 'bar', barWidth: 22,
        data: [
          { value: count('infrared'), itemStyle: { color: glow('#ff7a45') } },
          { value: count('smoke'), itemStyle: { color: glow('#ff4d4f') } },
          { value: count('antiLost'), itemStyle: { color: glow('#ffb84d') } }
        ]
      }
    ]
  }
}

function glow(color: string) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color },
    { offset: 1, color: 'rgba(255,77,79,0.25)' }
  ])
}

watch(() => store.devices, () => chart?.setOption(option()), { deep: true })
onMounted(() => {
  chart = echarts.init(el.value!)
  chart.setOption(option())
  window.addEventListener('resize', () => chart?.resize())
})
onUnmounted(() => chart?.dispose())
</script>

<template>
  <div ref="el" class="chart-box"></div>
</template>

<style scoped>
.chart-box { width: 100%; height: 100%; }
</style>
