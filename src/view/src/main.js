import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

import ToastPlugin from 'vue-toast-notification'
// Import one of the available themes
//import 'vue-toast-notification/dist/theme-default.css';
import 'vue-toast-notification/dist/theme-bootstrap.css'

app.use(ToastPlugin)

app.mount('#app')
