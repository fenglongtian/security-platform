<script setup lang="ts">
defineProps<{ title?: string; accent?: string }>()
</script>

<template>
  <div class="screen-panel" :style="{ '--accent': accent || '#5db2e8' }">
    <span class="corner tl"></span>
    <span class="corner tr"></span>
    <span class="corner bl"></span>
    <span class="corner br"></span>
    <header v-if="title" class="panel-title">
      <span class="title-bar"></span>
      <h3>{{ title }}</h3>
    </header>
    <div class="panel-body">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.screen-panel {
  position: relative; height: 100%;
  background: linear-gradient(160deg, rgba(18, 28, 44, 0.85), rgba(10, 16, 26, 0.9));
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  box-shadow: inset 0 0 24px rgba(93, 178, 232, 0.08), 0 0 18px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex; flex-direction: column;
}
.corner { position: absolute; width: 12px; height: 12px; border: 2px solid var(--accent); }
.corner.tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.corner.tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.corner.bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.corner.br { bottom: -1px; right: -1px; border-left: none; border-top: none; }
.panel-title { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid rgba(93, 178, 232, 0.15); }
.title-bar { width: 4px; height: 14px; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
.panel-title h3 { margin: 0; font-size: 14px; letter-spacing: 2px; font-weight: 600; }
.panel-body { flex: 1; min-height: 0; padding: 12px 14px; overflow: hidden; }
</style>
