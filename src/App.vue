<script setup lang="ts">
import { onMounted } from 'vue'
import AlarmDialog from './components/AlarmDialog.vue'
import AlarmPanel from './components/AlarmPanel.vue'
import BackgroundFX from './components/BackgroundFX.vue'
import CameraPanel from './components/CameraPanel.vue'
import ChartBar from './components/ChartBar.vue'
import ChartLine from './components/ChartLine.vue'
import ChartRing from './components/ChartRing.vue'
import KpiCards from './components/KpiCards.vue'
import MapView from './components/MapView.vue'
import ScreenHeader from './components/ScreenHeader.vue'
import ScreenPanel from './components/ScreenPanel.vue'
import { DESIGN_H, DESIGN_W, useFitScreen } from './composables/useFitScreen'
import { useDeviceStore } from './stores/devices'

const store = useDeviceStore()
const { scale, left, top } = useFitScreen()
onMounted(() => store.connect())
</script>

<template>
  <BackgroundFX />
  <div
    class="fit-wrap"
    :style="{
      width: `${DESIGN_W}px`,
      height: `${DESIGN_H}px`,
      transform: `translate(${left}px, ${top}px) scale(${scale})`
    }"
  >
    <div class="screen">
      <ScreenHeader />
      <KpiCards />

      <main class="screen-layout">
        <section class="col col-left">
          <ScreenPanel title="设备状态分布" accent="#36c46f">
            <ChartRing />
          </ScreenPanel>
          <ScreenPanel title="分类报警统计" accent="#ff4d4f">
            <ChartBar />
          </ScreenPanel>
        </section>

        <section class="col col-center">
          <ScreenPanel title="设备点位实时监控" accent="#5db2e8">
            <MapView />
          </ScreenPanel>
          <ScreenPanel title="在线与报警趋势" accent="#d9b26a">
            <ChartLine />
          </ScreenPanel>
        </section>

        <section class="col col-right">
          <ScreenPanel title="实时报警事件" accent="#ff7a45">
            <AlarmPanel />
          </ScreenPanel>
          <ScreenPanel title="现场视频联动" accent="#b06fe8">
            <CameraPanel />
          </ScreenPanel>
        </section>
      </main>
    </div>

    <AlarmDialog />
  </div>
</template>
