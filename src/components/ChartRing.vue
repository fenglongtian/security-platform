<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDeviceStore } from '../stores/devices'

echarts.use([PieChart, LegendComponent, TooltipComponent, CanvasRenderer])
const store = useDeviceStore()
const el = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function option() {
  return {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(8,16,28,0.9)', borderColor: '#2a4a6a', textStyle: { color: '#cfe4ff' } },
    legend: { bottom: 0, textStyle: { color: '#9fc4e6', fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
    series: [
      {
        type: 'pie', radius: ['52%', '74%'], center: ['50%', '44%'],
        avoidLabelOverlap: true, label: { show: false },
        itemStyle: { borderColor: '#0a1018', borderWidth: 2 },
        data: [
          { value: store.stats.online, name: '在线', itemStyle: { color: '#36c46f' } },
          { value: store.stats.alarmCount, name: '报警', itemStyle: { color: '#ff4d4f' } },
          { value: store.stats.offline, name: '离线', itemStyle: { color: '#8a8f99' } }
        ]
      }
    ]
  }
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
