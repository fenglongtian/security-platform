<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0
let resize = () => {}

interface P { x: number; y: number; vx: number; vy: number }

onMounted(() => {
  const cv = canvas.value!
  const ctx = cv.getContext('2d')!
  let w = 0
  let h = 0
  let parts: P[] = []

  resize = () => {
    w = cv.width = window.innerWidth
    h = cv.height = window.innerHeight
    const count = Math.min(90, Math.floor((w * h) / 18000))
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    }))
  }
  resize()
  window.addEventListener('resize', resize)

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    for (const p of parts) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(93,178,232,0.7)'
      ctx.fill()
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i]
        const b = parts[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 130) {
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(93,178,232,${0.12 * (1 - d / 130)})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }
    raf = requestAnimationFrame(draw)
  }
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div class="bg-fx">
    <canvas ref="canvas" class="bg-canvas"></canvas>
    <div class="bg-grid"></div>
    <div class="bg-sweep"></div>
    <div class="bg-vignette"></div>
  </div>
</template>

<style scoped>
.bg-fx { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.bg-canvas { position: absolute; inset: 0; }
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(93, 178, 232, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(93, 178, 232, 0.07) 1px, transparent 1px);
  background-size: 44px 44px;
}
.bg-sweep {
  position: absolute; left: -30%; width: 30%; top: 0; bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(93, 178, 232, 0.08), transparent);
  animation: sweep 9s linear infinite;
}
@keyframes sweep { 0% { left: -30%; } 100% { left: 100%; } }
.bg-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.55) 100%);
}
</style>
