import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import App from './layout/App.vue'
import router from './router'
import { useAuthStore } from './stores/redkik/authStore'
import './styles/fonts.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

const authStore = useAuthStore()
authStore.initialize().finally(() => {
  app.mount('#app')
})
