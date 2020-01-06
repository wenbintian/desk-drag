<template>
  <div class="contain">
    <div class="menu">
      <h1>桌面布局</h1>
      <ul>
        <li><button @click='handleClick'>添加块</button> </li>
      </ul>
    </div>
    <div class="content">
      <t-desk-drag class="themeType" ref="deskDrag" :width="width" :height='height'
        @drag-change="dragChangeEn"
        @drag-delete="dragDeleteEn"
      ></t-desk-drag>
    </div>
  </div>
</template>

<script type="text/babel">
  import {sortExtensionsByName} from "../src/assets/js/lsTest.js";
  export default {
    name: 'TDeskDragDemo',
    data(){
      return {
        width:1366,
        height:687,
        dataLength:0
      };
    },
    methods:{
      dragDeleteEn(avl,arr){
        this.dataLength = arr.length;
      },
      dragChangeEn(arr){
        this.dataLength = arr.length;
      },
      handleClick(){
        let obj =  {
          left:0,top:0,width:1,height:1,
          id:""+new Date().getTime(),viewIndex:0,portletColor:"dragColor"+this.dataLength%4,
          portletName:"测试"+this.dataLength,portletImage:"iconfont icon-beihuoguanli"
        };
        this.$refs.deskDrag.addDeskDrag(obj);
        this.dataLength++;
      },
      resize(){
        let w = $(window).width()-100;
        let h = $(window).height();
        this.width = w;
        this.height = h;
      }
    },
    mounted:function() { //用于高亮显示代码
      let arr1 = [
        {firstName: '123', lastName: 'qwe', ext: '234', extType: 'FaxUser'},
        {firstName: '23', lastName: 'qwe', ext: '234', extType: 'FaxUser'},
        {firstName: '123', lastName: 'aq', ext: '234', extType: 'FaxUser'},
        {firstName: '123', lastName: 'aq', ext: 'ww', extType: 'FaxUser'},
      ]
      console.log(sortExtensionsByName(arr1))




      let arr = [
        {
          left:0,top:0,width:1,height:1,
          id:'a1000002',viewIndex:0,portletColor:"dragColor4",
          portletName:"测试",portletImage:"iconfont icon-beihuoguanli"
        },
      ];
      this.$refs.deskDrag.resetDeskDrag(arr);

      this.resize();
      window.addEventListener("resize",this.resize);
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.contain{
  display:flex;
  justify-content: flex-start;
  height:100%;
}
.menu{flex-basis:50px; background:#00acE7; text-align:center;}
.menu h1{font-size:16px;}
.menu ul{ overflow: hidden; margin:0; padding:5px;} 
.menu button{padding:2px; margin:0; font-size:12px;} 
.content{flex-grow: 2; background:url("./assets/images/bg.jpg") left center no-repeat; background-size:100% 100%;}

</style>
