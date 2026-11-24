// WebAudio 合成短促报警音，无需外部音频文件；自动播放策略拦截时静默失败
let ctx: AudioContext | null = null

export function playAlarm() {
  try {
    ctx = ctx || new AudioContext()
    const now = ctx.currentTime
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      const start = now + i * 0.28
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.24)
    }
  } catch {
    // 浏览器未授权音频时忽略
  }
}
