# 智慧安防监控平台（Security Platform）

面向园区 / 楼宇场景的可运行安防监控平台：接入智能红外、烟感、防丢等设备，在地图上实时展示点位与状态，设备报警时自动定位、闪烁并联动现场摄像头，支持报警处理闭环。

- 前端：Vue 3 + TypeScript + Vite + Pinia + Leaflet
- 后端：Node.js + Express + ws（WebSocket），提供 REST 与实时推送
- 离线深色网格底图，无需地图 key、无外部瓦片依赖，可直接部署到静态托管

## 目录结构

```
security-platform/
├─ src/
│  ├─ components/   MapView / DeviceList / AlarmPanel / CameraPanel / StatsBar
│  ├─ stores/       devices.ts（Pinia：ws 连接、报警、统计、处理）
│  ├─ services/     mockDevices.ts（纯前端演示数据源，ws 不可用时自动降级）
│  └─ types.ts
└─ server/
   ├─ index.js      Express + WebSocket 服务（端口 8790）
   └─ devices.js    Mock 设备中心（心跳、位置、随机报警、处理恢复）
```

## 快速开始

```powershell
# 后端（端口 8790）
cd server
npm install --registry=https://registry.npmmirror.com
npm run dev

# 前端（另开终端，端口 5173）
cd ..
npm install --registry=https://registry.npmmirror.com
npm run dev
```

前端启动后优先连接后端 WebSocket（顶部显示「实时通道已连接」）；若连不上后端，4 秒后自动切换到内置模拟数据（显示「演示模式」），因此纯静态部署也能完整演示。

## 生产构建

```powershell
npm run build      # 产物在 dist/，相对路径 base，可直接放 GitHub Pages
```

## 功能闭环

1. 42 个设备点位按类型（红外/烟感/防丢）与状态（在线/离线/报警）分级渲染；
2. 设备每 2 秒刷新心跳与电量，少量离线/上线抖动；
3. 每 6 秒随机触发报警：点位红色脉冲、地图自动定位、报警面板实时弹出（含高危标记）；
4. 点击「处理」解除报警，设备恢复在线，状态经 WebSocket 同步；
5. 顶部统计接入设备、在线、离线、报警、在线率、待处理报警；
6. 摄像头面板展示选中点位的现场画面占位与坐标、电量、心跳信息。
