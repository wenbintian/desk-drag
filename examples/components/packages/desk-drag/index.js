import DeskDrag from './src/desk-drag';

DeskDrag.install = function(Vue) {
  Vue.component(DeskDrag.name, DeskDrag);
};

export default DeskDrag;
