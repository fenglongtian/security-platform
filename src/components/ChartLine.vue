<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDeviceStore } from '../stores/devices'

echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])
const store = useDeviceStore()
const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let timer = 0
const labels: string[] = []
const onlineSeries: number[] = []
const alarmSeries: number[] = []

function build() {
  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,16,28,0.9)', borderColor: '#2a4a6a', textStyle: { color: '#cfe4ff' } },
    legend: { top: 0, right: 0, textStyle: { color: '#9fc4e6', fontSize: 11 }, itemWidth: 14, itemHeight: 8 },
    grid: { left: 36, right: 14, top: 28, bottom: 26 },
    xAxis: {
      type: 'category', data: labels, boundaryGap: false,
      axisLine: { lineStyle: { color: '#2a4a6a' } }, axisLabel: { color: '#9fc4e6', fontSize: 10 }
    },
    yAxis: {
      type: 'value', splitLine: { lineStyle: { color: 'rgba(93,178,232,0.12)' } },
      axisLabel: { color: '#9fc4e6', fontSize: 10 }
    },
    series: [
      {
        name: '在线设备', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
        data: onlineSeries,
        lineStyle: { color: '#5db2e8', width: 2 }, itemStyle: { color: '#5db2e8' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(93,178,232,0.4)' }, { offset: 1, color: 'rgba(93,178,232,0)' }
        ]) }
      },
      {
        name: '报警设备', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
        data: alarmSeries,
        lineStyle: { color: '#ff4d4f', width: 2 }, itemStyle: { color: '#ff4d4f' }
      }
    ]
  }
}

onMounted(() => {
  chart = echarts.init(el.value!)
  chart.setOption(build())
  window.addEventListener('resize', () => chart?.resize())
  timer = window.setInterval(() => {
    const d = new Date()
    labels.push(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`)
    onlineSeries.push(store.stats.online)
    alarmSeries.push(store.stats.alarmCount)
    if (labels.length > 12) { labels.shift(); onlineSeries.shift(); alarmSeries.shift() }
    chart?.setOption(build())
  }, 2000)
})
onUnmounted(() => { clearInterval(timer); chart?.dispose() })
</script>

<template>
  <div ref="el" class="chart-box"></div>
</template>

<style scoped>
.chart-box { width: 100%; height: 100%; }
</style>
