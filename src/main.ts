import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import 'leaflet/dist/leaflet.css'
import './style.css'

createApp(App).use(createPinia()).mount('#app')
