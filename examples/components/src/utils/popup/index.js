import Vue from 'vue';
import merge from '../merge';
import PopupManager from './popup-manager';
//import getScrollBarWidth from '../scrollbar-width';

let idSeed = 1;
//const transitions = [];

//const hookTransition = (transition) => {
//  if (transitions.indexOf(transition) !== -1) return;
//
//  const getVueInstance = (element) => {
//    let instance = element.__vue__;
//    if (!instance) {
//      const textNode = element.previousSibling;
//      if (textNode.__vue__) {
//        instance = textNode.__vue__;
//      }
//    }
//    return instance;
//  };
//
//  Vue.transition(transition, {
//    afterEnter(el) {
//      const instance = getVueInstance(el);
//
//      if (instance) {
//        instance.doAfterOpen && instance.doAfterOpen();
//      }
//    },
//    afterLeave(el) {
//      const instance = getVueInstance(el);
//
//      if (instance) {
//        instance.doAfterClose && instance.doAfterClose();
//      }
//    }
//  });
//};

let scrollBarWidth;

const getDOM = function(dom) {
  if (dom.nodeType === 3) {
    dom = dom.nextElementSibling || dom.nextSibling;
    getDOM(dom);
  }
  return dom;
};

export default {
  model: {
    prop: 'visible',
    event: 'visible-change'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    //transition: {
    //  type: String,
    //  default: ''
    //},
    //closeDelay: {},
    zIndex: {},
    modal: {
      type: Boolean,
      default: false
    },
    modalFade: {
      type: Boolean,
      default: true
    },
    modalClass: {},
    modalAppendToBody: {
      type: Boolean,
      default: false
    },
    //lockScroll: {
    //  type: Boolean,
    //  default: true
    //},
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    closeOnClickModal: {
      type: Boolean,
      default: false
    }
  },

  created() {
    //if (this.transition) {
    //  hookTransition(this.transition);
    //}
  },

  beforeMount() {//用于计算遮罩的问题
    this._popupId = 'popup-' + idSeed++;
    PopupManager.register(this._popupId, this);
  },

  beforeDestroy() {//销毁时遮罩销毁
    PopupManager.deregister(this._popupId);
    PopupManager.closeModal(this._popupId);
  },

  data() {
    return {
      opened: false,
      rendered: false
    };
  },

  watch: {
    visible(val) {
      if (val) {
        if (this._opening) return;
        if (!this.rendered) {
          this.rendered = true;
          Vue.nextTick(() => {
            this.open();
          });
        } else {
          this.open();
        }
      } else {
        this.close();
      }
    }
  },

  methods: {
    open(options) {
      if (!this.rendered) {
        this.rendered = true;
        this.$emit('visible-change', true);
      }

      const props = merge({}, this.$props || this, options);

      //if (this._closeTimer) {
      //  clearTimeout(this._closeTimer);
      //  this._closeTimer = null;
      //}
      //clearTimeout(this._openTimer);
      //
      this.doOpen(props);
    },

    doOpen(props) {
      if (this.$isServer) return;
      //if (this.willOpen && !this.willOpen()) return;
      if (this.opened) return;
      //
      this._opening = true;

      this.$emit('visible-change', true);

      const dom = getDOM(this.$el);

      const modal = props.modal;

      const zIndex = props.zIndex;
      if (zIndex) {
        PopupManager.zIndex = zIndex;
      }

      if (modal) {
        if (this._closing) {
          PopupManager.closeModal(this._popupId);
          this._closing = false;
        }
        PopupManager.openModal(this._popupId, PopupManager.nextZIndex(), this.modalAppendToBody ? undefined : dom, props.modalClass, props.modalFade);
      }

      if (getComputedStyle(dom).position === 'static') {
        dom.style.position = 'absolute';
      }

      dom.style.zIndex = PopupManager.nextZIndex();
      this.opened = true;

      //this.onOpen && this.onOpen();

      //if (!this.transition) {
        this.doAfterOpen();
      //}
    },

    doAfterOpen() {
      this._opening = false;
    },

    close() {
      if (this.willClose && !this.willClose()) return;

      //if (this._openTimer !== null) {
      //  clearTimeout(this._openTimer);
      //  this._openTimer = null;
      //}
      //clearTimeout(this._closeTimer);

      //const closeDelay = Number(this.closeDelay);

      //if (closeDelay > 0) {
      //  this._closeTimer = setTimeout(() => {
      //    this._closeTimer = null;
      //    this.doClose();
      //  }, closeDelay);
      //} else {
      //  this.doClose();
      //}
      this.doClose();
    },

    doClose() {
      this.$emit('visiblechange', false);
      this._closing = true;

      //this.onClose && this.onClose();

      this.opened = false;

      //if (!this.transition) {
        this.doAfterClose();
      //}
    },

    doAfterClose() {
      PopupManager.closeModal(this._popupId);
      this._closing = false;
    }
  }
};

export {
  PopupManager
};
