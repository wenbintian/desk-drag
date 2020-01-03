<template>
  <div class="component_example">
    <h1>DeskDrag 桌面布局</h1>
    <div class="item">
      <h4>基本用法（搜索在左边）</h4>
      <div class="item-content" style="height:800px">
        <t-desk-drag class="themeType" ref="deskDrag"></t-desk-drag>
      </div>
      <div class="item-detail">
        <div class="item-desc">
        
        </div>
        <div class="item-toggle" @click="handleToggle">展开/收起代码</div>
        <div class="item-code">
          <pre><code>

          </code></pre>
        </div>

      </div>
    </div>
  </div>

</template>

<script>
export default {
  name:"DeskDrag",
  methods:{
    handleToggle(e){
      $(e.target).next().find("pre code").toggle()
    },
  },
  mounted:function() { //用于高亮显示代码
    let arr = [
      {left:0,top:0,width:2,height:2,id:'a1000002',viewIndex:0,portletColor:"dragColor4",portletName:"测试"},
    ];
    this.$refs.deskDrag.updateDragPos(arr)
    
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
  }
}
</script>
