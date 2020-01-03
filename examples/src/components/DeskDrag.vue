<template>
  <div class="component_example">
  </div>

</template>

<script>
export default {
  name:"DeskDrag",
  data(){
    return {
      width:1366,
      height:687,
    };
  },
  methods:{
    resize(){
      let w = $(window).width()-100;
      let h = $(window).height();
      this.width = w;
      this.height = h;
    }
  },
  mounted:function() { //用于高亮显示代码
    let arr = [
      {
        left:0,top:0,width:2,height:2,
        id:'a1000002',viewIndex:0,portletColor:"dragColor4",
        portletName:"测试",portletImage:"iconfont icon-beihuoguanli"
      },
    ];
    this.$refs.deskDrag.updateDragPos(arr);

    this.resize();
    window.addEventListener("resize",this.resize);
  }
}
</script>
<style>
.component_example{

}
</style>