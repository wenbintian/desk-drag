<template>
  <div class="contain">
   <div class="menu">
     <ul>
       <li><router-link to="/desk-drag">桌面布局</router-link></li>
     </ul>
   </div>
    <div class="content">
        <div class="wrap">
          <router-view></router-view>
        </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'his5',
    data () {
      return {
        
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .contain{ display: flex;  flex-flow: row;align-items:stretch;width: 100%; font-size: 15px; height: 100%;overflow: hidden;}
  .contain .wrap{width: 100%;height: 100%;overflow: auto;display: block;box-sizing: border-box;padding: 15px;}
  .contain li {  display: list-item;  }
  .contain  a:link,a:visited,a:hover{ text-decoration:none; outline: none;}
  .contain ul,li{ list-style:none;}
  .contain .menu{width: 200px;flex: 0 0 auto; padding: 20px 20px; border-right: 1px solid #ddd; overflow: auto;}
.contain .content{flex: 1 1 auto;width: 100%;height: 100%;min-width: 800px;}
.contain .menu li{color:#34495e;margin-top: 5px;line-height: 25px;}
.contain .menu li:hover a{border-bottom: 2px solid #42b983; }
  .contain .menu li a:visited ,.contain .menu li a:link{color: #34495e;}
</style>
