import DraggableResizable from "../packages/draggable-resizable/index.js";
import DeskDrag from "../packages/desk-drag/index.js";
import Clickoutside from './utils/clickoutside.js';



const components = [
  DraggableResizable,
  DeskDrag
];

const install = function(Vue){
  components.forEach(component => {
    Vue.component(component.name,component)
  })
  Vue.directive('clickoutside',Clickoutside);//自定义指令 v-clickoutside   点击其他地方触发的指令
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default{
  version: '1.0.0',
  install,
  DraggableResizable,
  DeskDrag
};

