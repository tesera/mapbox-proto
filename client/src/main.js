import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource'
window.mapboxgl = require('mapbox-gl');

Vue.use(VueResource)


Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
