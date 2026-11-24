const express = require('express')
const cors = require('cors')
const http = require('http')
const { WebSocketServer } = require('ws')
const { DeviceCenter } = require('./devices')

const app = express()
app.use(cors())
app.use(express.json())

const center = new DeviceCenter()

// REST：初始快照、设备类型、处理报警
app.get('/api/snapshot', (req, res) => res.json({ code: 0, data: center.snapshot() }))
app.post('/api/alarms/:id/resolve', (req, res) => {
  const result = center.resolve(req.params.id)
  if (!result) return res.status(404).json({ code: 404, msg: '报警不存在' })
  broadcast(result)
  res.json({ code: 0, data: result })
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

function broadcast(msg) {
  const text = JSON.stringify(msg)
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(text)
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'snapshot', data: center.snapshot() }))
})

// 每 2 秒推送设备快照
setInterval(() => broadcast(center.tick()), 2000)
// 每 6 秒随机触发一次报警
setInterval(() => {
  const evt = center.triggerAlarm()
  if (evt) broadcast(evt)
}, 6000)

const PORT = process.env.PORT || 8790
server.listen(PORT, () => {
  console.log(`security-platform server on http://localhost:${PORT} (ws path /ws)`)
})
