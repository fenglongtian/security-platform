import { onMounted, onUnmounted, ref } from 'vue'

// 以 1920x1080 设计稿为基准，等比缩放并居中，保证任意分辨率布局不变形
export const DESIGN_W = 1920
export const DESIGN_H = 1080

export function useFitScreen() {
  const scale = ref(1)
  const left = ref(0)
  const top = ref(0)

  function fit() {
    const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
    scale.value = s
    left.value = (window.innerWidth - DESIGN_W * s) / 2
    top.value = (window.innerHeight - DESIGN_H * s) / 2
  }

  onMounted(() => {
    fit()
    window.addEventListener('resize', fit)
  })
  onUnmounted(() => window.removeEventListener('resize', fit))

  return { scale, left, top }
}
