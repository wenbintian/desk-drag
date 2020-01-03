// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Index from './Index'
import router from './router'
import "./assets/css/reset.css";
import "./assets/css/common.css";
import "../components/packages/theme/default/index.scss";
import components from "../components/src";

Vue.use(components);

new Vue({
  el: '#app',
  router,
  template: '<Index/>',
  components: {Index}
});
