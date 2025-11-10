import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n, { initializeI18n } from './i18n'

// Initialize i18n with saved preferences before mounting the app
initializeI18n().then(() => {
  const app = createApp(App)
  app.use(router)
  app.use(i18n)
  app.mount('#app')
})
