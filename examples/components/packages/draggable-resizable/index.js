import DraggableResizable from './src/draggable-resizable';

/* istanbul ignore next */
DraggableResizable.install = function(Vue) {
  Vue.component(DraggableResizable.name, DraggableResizable);
};

export default DraggableResizable;
