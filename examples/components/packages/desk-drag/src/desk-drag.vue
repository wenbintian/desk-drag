<template>
  <!--主要的算法页面-->
  <div class="t_desk_drag main_page" ref='deskDragBox' @mousewheel="mouseWheel" @DOMMouseScroll="mouseWheel">
    <div
      class="main_page_item"
      :class="{'drag_stop':itemDragStop,'resizing':itemResizing}"
      :style="movePageStyle"
    >
      <!--可以移动的图层-->
      <div
        v-for="(d,index) in moveSpaceData" :key="d.uiKey" class="main_move_inner"
        :style="{width:tarWidth+'px'}"
      >
        <div class="main_move_item" :style="{width: rectWidth*blockWidth+'px'}">
          <div
            v-for="dd in d.moduleItem" :key="dd.id" class="move_item"
            :style="{
                height:dd.height*blockWidth+'px',width:dd.width*blockWidth+'px',
                left:dd.left*blockWidth+'px',
                top:dd.top*blockWidth+'px'
                }"
          ><div class="mover_item_inner"></div></div>
        </div>
      </div>

      <template
        v-for="(d,index) in moduleData"
      >
        <t-draggable-resizable
          v-for="dd in d.moduleItem" class="module_item"  :key="dd.uiId"
          :w="dd.width*blockWidth" :h="dd.height*blockWidth" :minw="blockWidth" :minh="blockWidth"
          :x="dd.left*blockWidth + dd.viewIndex*tarWidth + offLeft" :y="dd.top*blockWidth"
          :handles="['tl','br']" :updatepos="dd.updatepos"
          :class="{'has_url':dd.portletUrl && (dd.width>=urlMinHeight && dd.height>=urlMinWidth || dd.height>=urlMinHeight && dd.width>=urlMinWidth)}"
          :draggable="isfixed!='1'"
          :resizable="isfixed!='1'"
          @activated="activated($event,dd)"
          @deactivated="deactivated"
          @resizestop="resizestop($event,dd)"
          @resizing="resizing($event,dd)"
          @dragstop="dragstop"
          @dragging="dragging($event,dd)"
          @contextmenu.native.prevent.stop="contextMenu()"
          @dblclick.native.prevent="dragDblClick(dd)"
        >
          <div class="module_item_inner" :class="dd.portletColor || 'dragColor4'">
            <template v-if="dd.portletUrl && (dd.width>=urlMinHeight && dd.height>=urlMinWidth || dd.height>=urlMinHeight && dd.width>=urlMinWidth)">
              <div class="module_item_tt">
                <i class="navIcon" :class="dd.portletImage"></i>
                {{dd.portletName}}
                <div class="module_item_operate">
                  <i class="zoeIconfont z_refresh_normal icon_refresh" @dblclick.stop @click.stop="moduleItemRefreshEvn"></i>
                </div>
              </div>
              <div class="module_item_url">
                <div class="module_mask"></div>
                <iframe
                  :id="'module_item_'+dd.uiId" data-frame-id="comPortalPage"
                  :src="dd.portletUrl" frameborder="0" width="100%" height="100%" scrolling="no"
                ></iframe>
              </div>
            </template>
            <template v-else>
              <i class="module_item_icon" :class="dd.portletImage || 'z_menuD_normal'"></i>
              <div class="module_item_bottom ellipsis">{{dd.portletName}}</div>
            </template>

          </div>
        </t-draggable-resizable>
      </template>
    </div>

    <!--左右箭头-->
    <div
      class="main_btn btn_right" v-show="currentView+1<moduleData.length"
    ><i
      class="iconfont icon-right"
      @click="turnRightView(true)"
    ></i></div>
    <div
      class="main_btn btn_left" v-show="currentView>0 && mainLeft<0"
    ><i
      class="iconfont icon-left"
      @click="turnRightView(false)"
    ></i></div>

    <!--组件右键-->
    <div
      class="com_main_drag_menu" v-clickoutside="dragClickOutside"
      v-show="showDragMenu" :style="rightMenuStyle"
    >
      <ul>
        <!--取消固定-->
        <li class="menu_item" @click="cancelDragFixed">取消固定</li>
      </ul>
    </div>

    <!--显示第几页-->
    <div class="drag_page_box" :style="dragPageStyle">
      <ul class="drag_page_box_inner clearfix">
        <li
          v-for="(d,index) in moduleData" @click="currentView=targetCurrentView=index"
          :class="{selected:targetCurrentView==currentView ? index==currentView : index==targetCurrentView}"
        >
          <div class="drag_page_target"></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script type="text/babel">
  //===============================
  //@drag-change  组件布局改变触发事件 返回参数： 1.布局源数据
  //@drag-delete  组件取消固定触发事件 返回参数： 1.该组件信息  2.删除后的信息
  //

  export default{
    name:"TDeskDrag",
    data(){
      return {
        itemDragStop:true,//是否是处在拖动停止时的状态 主要用于设置动画效果
        itemResizing:false,//是否是处在缩放时的状态 主要用于设置动画效果
        rectWidth:12,//矩阵的宽度规格
        rectHeight:6,//举证的高度规格
        tarWidth:1280,//屏幕宽度
        blockWidth:104,//块的长宽
        offLeft:0,//左右两边的间距
        moveLeft:0,//向左右移动的距离
        showDragMenu:false,//显示右键
        rightMenuStyle:{
          left:0,top:0
        },//右键位置

        urlMinWidth:3,//最小显示URL的宽度
        urlMinHeight:2,


        currentView:0,//当前显示的是哪个菜单屏
        targetCurrentView:0,//目标移动时位于第几屏
        selectModule:null,//当前移动的格子的数据
        //格式
        //moduleItem: [{left:0,top:0,width:2,height:2,id:'0',viewIndex:0},{}....]
        moduleApiData:[

        ],
        //菜单的所有数据
        //格式
        // left/top： 对应的坐标
        // width/height： 对应的菜单的宽高
        // id： 对应的菜单的唯一ID
        // viewIndex： 对应的菜单所在的是第几屏
        // [
        //  {
        //    uiKey:1,
        //    moduleItem: [{left:0,top:0,width:2,height:2,id:'0',viewIndex:0},{}....]
        //   },
        //  {
        //    uiKey:2,
        //    moduleItem: [{left:0,top:0,width:2,height:2,id:'0',viewIndex:0},{}....]
        //   },
        // ]
        moduleData:[
          {
            uiKey:1,
            moduleItem:[]
          }
        ],
        //用于显示那些可以移动的位置
        moveSpaceData:[],

        //curId 代表被组件ID为curId的占用
        //spacePos 可以移动的位置所占用
        //===== 算法矩阵 ====
        //---- 0 1 2 3 4 5 6 7 8 9 ----
        //---- 0 1 2 3 4 5 6 7 8 9 ----
        //---- 0 1 2 3 4 5 6 7 8 9 ----
        //---- 0 1 2 3 4 5 6 7 8 9 ----
        moduleRect:[],
        spaceRect:[],//空矩阵

//        deptIdList:[],

      }
    },
    props:{
      width:{
        type:[Number,String],
        default:1346
      },//浏览器的宽度 组件的宽度
      height:{
        type:[Number,String],
        default:739
      },//组件的高度
      sourceData:Array,
      isfixed:String,//是否锁定， 对磁铁不进行拖动， "1":代表锁定
    },
    computed:{
      mainLeft(){
        return -this.currentView*this.tarWidth-this.moveLeft;
      },
      //可以移动图层的样式
      movePageStyle(){
        let movePageH = this.rectHeight * this.blockWidth;
        let mainDrag = this.height - movePageH -25;//控件外框真实的宽度 减去 磁铁真实的总宽度
        let difMarginTop = 0;
        //此处计算主要为了市磁铁尽量靠近上方 尽量不要挡住底部桌面菜单
        if(mainDrag<30){
          difMarginTop = Math.abs(mainDrag/2);
        }else if (mainDrag<57){
          difMarginTop = 15 - (mainDrag-30)/2;
        }
        return{
          width:this.tarWidth*this.moduleData.length + "px",
          left:-this.currentView*this.tarWidth-this.moveLeft+ "px",
          height:this.rectHeight*this.blockWidth + "px",
          marginTop:-(this.rectHeight*this.blockWidth)/2-difMarginTop + "px"
        };
      },
      //监听width或者height变化
      widthHeight(){
        return this.width + this.height;
      },
      //监听rectWidth或者rectHeight变化
      rectWidthHeight(){
        return this.rectWidth + this.rectHeight;
      },
      dragPageStyle(){
        let movePageH = this.rectHeight * this.blockWidth;
        let mainDrag = this.height - movePageH -25;//控件外框真实的宽度 减去 磁铁真实的总宽度
        if(mainDrag<62){
          return {bottom:0};
        }else {
          let wh = this.height<this.minWindowHeight ? this.minWindowHeight : this.height;
          return {
            top: (wh - 25 - movePageH)/2 + 10 + movePageH +"px"
          };
        }

      }
    },
    watch:{
      //rectWidth或者rectHeight变化时重新渲染布局
      rectWidthHeight(){
        this.createSpaceRect();//重新创建空的矩阵
        this.updateDragPos(this.moduleApiData);
      },
      //width或者height变化的话执行的函数
      widthHeight(){
        this.monitorWidthHeight();
      }
    },
    methods: {
      moduleItemDeptChangeEvn(val="",dd){
        let curIframe = $("#module_item_"+dd.uiId);
        if(!curIframe.length) return;//没有找到该 iframe
        let iframeVm = curIframe[0].contentWindow.iframeVm;
        if(!iframeVm) return;
        if(typeof iframeVm.toChangeDept ==="function"){//存在科室选择按钮
          iframeVm.toChangeDept({deptCode:val});
        }
      },
      //调用iframe下的刷新方法
      moduleItemRefreshEvn(e){
        let curIframe = $(e.target).parents(".module_item_tt").next(".module_item_url").find("iframe");
        if(!curIframe.length) return;//没有找到该 iframe
        curIframe.attr('src', curIframe.attr('src'));

//        let iframeVm = curIframe[0].contentWindow.iframeVm;
//        if(!iframeVm) return;
//        if(typeof iframeVm.toRefreshItem ==="function"){//存在刷新按钮
//          iframeVm.toRefreshItem();
//        }
      },


      //滚轮翻页事件
      mouseWheel(e){
        let delta = -e.wheelDelta || e.detail;//firefox使用detail:下3上-3,其他浏览器使用wheelDelta:下-120上120//
        let isTrue = !this.isMouserWheel && (this.currentView+1<this.moduleData.length && delta<0) || (this.currentView>0 && delta>0);
        if(isTrue){
          this.isMouserWheel = true;
          this.turnRightView(delta<0);//delta<0：上滚  delta>0：下滚
          setTimeout(()=>{
            this.isMouserWheel = false;
          },300);
        }
      },
      //监听width或者height的改变
      monitorWidthHeight(){
        let diffWidth = this.width-this.minWindowWidth;
        let diffHeight = this.height-this.minWindowHeight;
        if(diffWidth<=0){
          this.rectWidth=8;
          this.offLeft = (this.minWindowWidth-this.rectWidth*this.blockWidth)/2;
          this.tarWidth = this.minWindowWidth;
        }else {
          this.rectWidth=8+parseInt(diffWidth/this.blockWidth);
          this.offLeft = (this.width-this.rectWidth*this.blockWidth)/2;
          this.tarWidth = this.width;
        }
        if(diffHeight<=0){
          this.rectHeight=4;
        }else {
          this.rectHeight=4+parseInt(diffHeight/this.blockWidth);
        }
      },
      //更新组件信息
      updateDragPos(data=[]){
        let isCheck = false;
        this.moduleApiData=[];
        let curTime = new Date().getTime();
        for(let i=0,l=data.length; i<l; i++){
          let item = Object.assign({},data[i]);
          item.uiId = `${i}_${item.id}_${curTime}`;;
          //判断高度是否过长
          if(item.height>this.rectHeight){
            item.height = this.rectHeight;
            isCheck = true;
          }
          //判断长度是否过长
          if(item.width>this.rectWidth){
            item.width = this.rectWidth;
            isCheck = true;
          }
          this.moduleApiData.push(item);
        }
        if(isCheck){
          this.$emit("drag-change",this.cloneFirstData(this.moduleApiData));
        }
        //改变重新渲染
        this.turnModuleData();
        //初始化设置位置有变化时触发drag-change事件调用接口修改数据
        if(this.setModulePos()){
          this.$emit("drag-change",this.cloneFirstData(this.moduleApiData));
        }
      },

      //激活块
      activated(vm,dd){
        this.selectModule = Object.assign({},dd);
      },
      deactivated(){
      },
      resizestop(vm,dd){
        this.selectModule = Object.assign({},dd);
        this.itemDragStop=true;
        this.$nextTick(()=>{
          let nextWidth = Math.round(vm.width/this.blockWidth);
          let nextHeight = Math.round(vm.height/this.blockWidth);
          let nextTop = Math.round(vm.top/this.blockWidth);
          let nextLeft = Math.round((vm.left-this.tarWidth*this.currentView-this.offLeft)/this.blockWidth);
          //边界判断
          //top：移动到上外围 则设置为0
          if(nextTop<0){ nextTop = 0;}
          if(nextLeft<0){ nextLeft = 0;}
          //没有变化
          if(nextWidth<=this.selectModule.width && nextHeight <= this.selectModule.height){
            let curPosItem = Object.assign({},this.selectModule,{width:nextWidth,height:nextHeight,top:nextTop,left:nextLeft});
            this.updateItemPos(curPosItem);
            this.setRectStatus(this.selectModule);//删除旧对应矩阵
            this.setRectStatus(curPosItem,true);//设置新对应矩阵
            //更新数据源
            this.updateApiData();
            let temS = this.selectModule;
            //数据不变
            if(temS.width==nextWidth && temS.height==nextHeight && temS.top==nextTop && temS.left==nextLeft){

            }else {
              this.$emit("drag-change",this.cloneFirstData(this.moduleApiData));
            }
          }else {
            //右下角 太高
            if(nextHeight+nextTop>this.rectHeight){
              nextHeight = this.rectHeight-nextTop;
            }
            //太宽
            if(nextWidth+nextLeft>this.rectWidth){
              nextWidth = this.rectWidth-nextLeft;
            }
            //当前定位的位置
            let curPosItem = Object.assign({},this.selectModule,{
              width:nextWidth,height:nextHeight,top:nextTop,left:nextLeft
            });
            //被占用的数据
            let apiRect = this.findPosByRect(curPosItem);
            let delItems = [];//除了本身 那些要被移动的快
            for(let i=0; i<apiRect.length; i++){
              let itemApiRect = apiRect[i];
              if(curPosItem.id!=itemApiRect.id){
                this.deleteModuleItemData(itemApiRect);//删除临时显示数据块
                this.setRectStatus(itemApiRect);//删除对应矩阵
                delItems.push(itemApiRect);
              }
            }

            this.setRectStatus(this.selectModule);//删除旧对应矩阵
            this.setRectStatus(curPosItem,true);//设置新对应矩阵
            this.updateItemPos(curPosItem);//更新自身的位置

            //添加那些被移动的块
            for(let i=0; i<delItems.length; i++){
              delItems[i].updatepos=!delItems[i].updatepos;
              this.addByItem(delItems[i]);
            }
            //更新数据源
            this.updateApiData();

            this.$emit("drag-change",this.cloneFirstData(this.moduleApiData));
          }
          this.itemResizing = false;//缩放结束
        });
      },
      resizing(vm,dd){
        this.itemDragStop=false;
        this.itemResizing = true;//缩放开始
        this.selectModule = Object.assign({},dd);
      },
      //拖动结束
      dragstop(vm){
        this.itemDragStop=true;
        this.timer && clearTimeout(this.timer);
        this.$nextTick(()=>{
          this.moveLeft=0;
          //四舍五入
          let nextView = Math.floor(vm.left / this.tarWidth);  //目标点位于当前的第几个屏
          let nextLeft = Math.round((vm.left-this.tarWidth*nextView-this.offLeft)/this.blockWidth);
          let nextTop = Math.round(vm.top/this.blockWidth);

          //边界判断
          //top：移动到上外围 则设置为0
          if(nextTop<0){
            nextTop = 0;
          }
          //top：移动到最下外围 则设置刚好到底部
          if(nextTop>this.rectHeight-this.selectModule.height){
            nextTop = this.rectHeight-this.selectModule.height;
          }

          //目标点即将定位于 小于第一屏 nextView=0 nextLeft=0
          if(nextView<0){
            nextView=0;//目标点设置为第一屏
            nextLeft=0;
          }

          //left：当前第一屏而且到达最左边 则归0
          if(nextLeft<0){
            nextLeft=0;
          }else {
            //left：当前最后一屏、、最外围
            if(nextLeft>this.rectWidth-this.selectModule.width){
              //是最后一屏
              nextLeft=this.rectWidth-this.selectModule.width;
            }
          }
          //移动没有达到半格 且是在当前屏幕
          if(nextLeft == this.selectModule.left && nextTop== this.selectModule.top && nextView==this.selectModule.viewIndex){
            vm.changePos(nextLeft*this.blockWidth+(this.tarWidth*this.selectModule.viewIndex)+this.offLeft,nextTop*this.blockWidth);
          }else {
            //当前定位的位置
            let curPosItem = Object.assign({},this.selectModule,{
              left:nextLeft, top:nextTop,uiKey:new Date().getTime(),viewIndex:nextView
            });
            this.currentView=nextView;//切换到定位的屏
            //被占用的数据
            let apiRect = this.findPosByRect(curPosItem);
            this.deleteModuleItemData(this.selectModule);//删除当前显示数据块
            this.setRectStatus(this.selectModule);//删除对应矩阵

            let delItems = [];//除了本身 那些要被移动的快
            for(let i=0; i<apiRect.length; i++){
              let itemApiRect = apiRect[i];
              if(curPosItem.id!=itemApiRect.id){
                this.deleteModuleItemData(itemApiRect);//删除临时显示数据块
                this.setRectStatus(itemApiRect);//删除对应矩阵
                delItems.push(itemApiRect);
              }
            }
            //先定位当前的
            curPosItem.updatepos=!curPosItem.updatepos;
            this.directAddByItem(curPosItem);
            //添加那些被移动的块
            for(let i=0; i<delItems.length; i++){
              delItems[i].updatepos=!delItems[i].updatepos;
              this.addByItem(delItems[i]);
            }
            //更新数据源
            this.updateApiData();
            this.$emit("drag-change",this.cloneFirstData(this.moduleApiData));
            this.selectModule=curPosItem;//重新赋值当前选中的块
          }
          this.createdMove=false;//移动矩阵的标识设置为false
          this.isSecond = false;//解决dragging事件 在点击块的时候也会触发
          this.targetCurrentView=this.currentView;
          this.clearNullLast();
        });
      },
      //拖动过程
      dragging(vm,dd){
        this.selectModule = Object.assign({},dd);
        this.timer && clearTimeout(this.timer);
        this.targetCurrentView = Math.floor(vm.left / this.tarWidth);  //目标点位于当前的第几个屏
        //createdMove 判断是否已经创建了移动矩阵对应的数据
        if(!this.isSecond){
          this.isSecond = true;
          this.itemDragStop=true;//第一次点击 设置
        }else {
          if(!this.createdMove){
            this.setMoveSpaceData(dd);
            this.createdMove=true;
          }
          this.itemDragStop=false;
        }

        //右边超出的多少
        //实际偏移左边屏幕的left：总位移 - 前几屏的长度 - 偏移的距离
        //超出右边的长度：+ 本身的长度 - 屏幕的长度
        let diffLeft = vm.left-this.currentView * this.tarWidth - this.moveLeft;
        let diffRight = diffLeft + this.selectModule.width*this.blockWidth-this.tarWidth;
        //右边超出了
        if(diffRight > 0){
          this.dragOverRightPage(diffRight,vm,dd);
        }else if(diffLeft<0){
          this.dragOverLeftPage(diffRight,vm);
        }
      },

      //设置清空矩阵对应的数据
      setMoveSpaceData(dd){
        //用于查找所有 1 X 1 大小的正方形
        let d2 = Object.assign({},dd);
        d2.width=1;
        d2.height=1;

        this.moveSpaceData=[];
        this.clearMoveRect();
        let curTime = new Date().getTime();
        for(let q=0,w=this.moduleRect.length; q<w; q++){
          let itemPage = this.moduleRect[q];
          let itemPageL = itemPage.length;
          let spaceModule = [];//每一屏存放的空块

          for(let i=0; i<itemPageL; i++){
            let item = itemPage[i];
            let itemL = item.length;
            for(let j=0; j<itemL; j++){
              let rectItem = item[j].curId;
              let spacePos = item[j].spacePos;
              //没有被实体占用 而且没有被虚体占用(反之随便一个被占用,则向下一个查找)
              if(rectItem || spacePos){
                continue;
              }else {
                let posData = {
                  top:i,
                  left:j,
                  width:d2.width,
                  height:d2.height,
                  viewIndex:q,
                  id:`${q}_${i}_${j}_${curTime}`
                };
                //找到了
                if(d2.width==1 && d2.height==1){
                  spaceModule.push(posData);
                  spacePos = true;//更改矩阵状态
                }else {
                  //后面没有足够多的位置
                  if(d2.width>itemL-j || d2.height>itemPageL-i){ //宽度还有没有位置 高度还有没有位置
                    break;
                  }

                  //先判断当前有没有足够的行
                  if(!this.hasEnoughRow(i,d2,j)){
                    let isRowCheck = false;
                    let usedIndex = -1;//被暂用的位置优化代码
                    //从该行的下一个查起,到总共需要的个数(在这范围里一个都)
                    for(let rowI=j+1; rowI<j+d2.width; rowI++){
                      if(item[rowI].curId || item[rowI].spacePos){
                        isRowCheck=true;
                        usedIndex=rowI;
                        break;
                      }else {
                        //判断是否有足够的行
                        if(this.hasEnoughRow(i,d2,rowI)){
                          isRowCheck=true;
                          usedIndex=rowI;
                          break;
                        }
                      }
                    }
                    //说明被占用了 则查找下一个可用的
                    if(isRowCheck){
                      j = usedIndex;
                    }else {
                      spaceModule.push(posData);
                      this.setMoveRectStatus(posData,true);
                      j=j+d2.width-1;//直接定位到没有被占用的地方
                    }
                  }
                }
              }
            }
          }
          this.moveSpaceData.push({
            uiKey:`${q}_${curTime}`,
            moduleItem:spaceModule
          });
        }
      },

      //清空移动矩阵的值
      clearMoveRect(){
        for(let q=0,w=this.moduleRect.length; q<w; q++){
          let itemPage = this.moduleRect[q];
          let itemPageL = itemPage.length;
          for(let i=0; i<itemPageL; i++){
            let item = itemPage[i];
            let itemL = item.length;
            for(let j=0; j<itemL; j++){
              item[j].spacePos = false;
            }
          }
        }
      },

      //更新某一块的位置、大小
      //没有动到其他位置
      updateItemPos(item){
        let curModule = this.moduleData[item.viewIndex].moduleItem;
        for(let i=0,l=curModule.length; i<l; i++){
          if(item.id==curModule[i].id){
            //更新
            curModule[i] = Object.assign(curModule[i],item,{updatepos:!curModule[i].updatepos});
            break;
          }
        }
      },
      //拖动块翻滚屏 向右翻屏
      dragOverRightPage(diffRight,vm,dd){
        //不是最后一屏
        let speed = 10;//移动的速度
        if(diffRight<64){
          speed=6;
        }else if(diffRight<148){
          speed=10;
        }else {
          speed=20;
        }
        let tempLeft = vm.left;
        let  tempI = 0;
        this.timer = setInterval(()=>{
          let mainRight = (this.moduleData.length-1)*this.tarWidth+this.mainLeft;
          if(mainRight<=0) {
            //最后一屏不是空屏 则新增一屏
            if(this.moduleData[this.moduleData.length-1].moduleItem.length){
              this.addModuleAndRect();
              this.setMoveSpaceData(dd);//重新创建移动屏
            }else {
              this.timer && clearTimeout(this.timer);
            }
          }else {
            //剩余的长度小于 speed 则用少于的长度去累加
            if(mainRight<speed && mainRight!=0){
              tempI+=mainRight;
              this.moveLeft+=mainRight;
            }else {
              tempI+=speed;
              this.moveLeft+=speed;
            }
            vm.changePos(tempLeft+tempI,vm.top);
          }
        },10);
      },
      //拖动块翻滚屏 向左翻屏
      dragOverLeftPage(diffLeft,vm){
        //不是最后一屏
        let speed = 10;//移动的速度
        if(diffLeft>-64){
          speed=-6;
        }else if(diffLeft>-148){
          speed=-10;
        }else {
          speed=-20;
        }
        let tempLeft = vm.left;
        let  tempI = 0;
        this.timer = setInterval(()=>{
          let mainLeft = this.mainLeft;//当前class:main_page_item的left值
          if(mainLeft>=0) {
            //到达一屏
            this.timer && clearTimeout(this.timer);
          }else {
            //剩余的长度小于 speed 则用少于的长度去累加
            if(mainLeft>speed && mainLeft!=0){
              tempI+=mainLeft;
              this.moveLeft+=mainLeft;
            }else {
              tempI+=speed;
              this.moveLeft+=speed;
            }
            vm.changePos(tempLeft+tempI,vm.top);
          }
        },10);
      },
      //直接添加一个位置确定的块
      directAddByItem(curItem){
        let curModuleD = this.moduleData[curItem.viewIndex].moduleItem;//添加项所在的屏
        curModuleD.push(curItem);
        //更新矩阵
        this.setRectStatus(curItem,true);
      },
      //添加默认的快（位置还不确定的）
      //curItem 要添加的块
      //viewIndex 从第几屏开始添加 默认从头开始添加
      //返回新的块的信息
      addByItem(curItem,viewIndex=0){
        let isAddSuccess = null;//添加是否成功
        for(let i=viewIndex; i<this.moduleRect.length; i++){
          curItem.viewIndex = i;//从第一屏开始查找
          let posData = this.pushItemToRect(curItem);//坐标信息
          if(posData){
            this.directAddByItem(posData);
            isAddSuccess = posData;
            break;
          }
        }
        if(isAddSuccess) return isAddSuccess;//添加成功 则返回正确的块对象 否则新增一个矩阵继续添加
        this.addModuleAndRect();
        return this.addByItem(curItem,this.moduleRect.length-1);
      },
      //克隆moduleData的数据 moduleData
      cloneModuleData(moduleData){
        let tempModule = [];
        for(let i=0; i<moduleData.length; i++){
          let moduleItem = moduleData[i].moduleItem;
          let tempItem = [];
          for(let k=0,h=moduleItem.length; k<h; k++){
            tempItem.push(Object.assign({},moduleItem[k]));
          }
          tempModule.push(Object.assign({},moduleData[i],{moduleItem:tempItem}));
        }
        return tempModule;
      },
      //克隆一层数组的数据
      cloneFirstData(arrData){
        let tempModule = [];
        for(let i=0; i<arrData.length; i++){
          tempModule.push(Object.assign({},arrData[i]));
        }
        return tempModule;
      },
      //克隆两层数组的数据
      cloneSecondData(arrData){
        let tempModule = [];
        for(let i=0; i<arrData.length; i++){
          let item = arrData[i];
          let temp=[];
          for(let j=0,k=item.length; j<k; j++) {
            temp.push(Object.assign({},item[j]));
          }
          tempModule.push(temp);
        }
        return tempModule;
      },
      //从显示的数据里删除某一块
      deleteModuleItemData(delItem){
        let curModuleD = this.moduleData[delItem.viewIndex].moduleItem;//删除项所在的屏
        for(let i=0; i<curModuleD.length; i++){
          if(curModuleD[i].id == delItem.id){
            curModuleD.splice(i,1);
            break;
          }
        }
      },
      //从矩阵里通过位置查找对应的所有模块
      findPosByRect(posData){
        //当前是第几屏
        let viewIndex = posData.viewIndex;
        let curRectD = this.moduleRect[viewIndex];
        let posRect = [];
        for(let i=posData.top,l=posData.top+posData.height; i<l; i++){
          for(let k=posData.left,h=posData.left+posData.width; k<h; k++){
            if(curRectD[i][k].curId){//被占用的CurId
              posRect.push(curRectD[i][k].curId)
            }
          }
        }
        //查找对应的菜单单元
        if(!posRect.length) return [];
        //去掉重复的块
        let uniPosRect = this.uniqueArr(posRect);
        let apiRect = [];
        for(let i=0,l=uniPosRect.length;i<l; i++ ){
          for(let k=0,h=this.moduleApiData.length;k<h; k++ ){
            if(this.moduleApiData[k].id==uniPosRect[i]){
              apiRect.push(this.moduleApiData[k]);
              break;
            }
          }
        }
        return apiRect;
      },
      /** 数组去重
       * 获取没重复的最右一值放入新数组。
       * （检测到有重复值时终止当前循环同时进入顶层循环的下一轮判断）*/
      uniqueArr(array){
        var temp = [];
        var index = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          for(var j = i + 1; j < l; j++){
            if (array[i] === array[j]){
              i++;
              j = i;
            }
          }
          temp.push(array[i]);
          index.push(i);
        }
        return temp;
      },

      //初始化模块位置
      initModulePos(){
        for(let i=0; i<this.moduleData.length; i++){
          let viewModuleData = this.moduleData[i].moduleItem;
          let h = viewModuleData.length;
          for(let k=0; k<h; k++){
            let item = viewModuleData[k];
            item.viewIndex = i;
            //todo 设置当前科室字段 用于下拉科室选中的值
//            if(item.portletParameter=='1'){
//              item.currentDeptCode = "";//当前科室
//            }

            let posData = this.pushItemToRect(item);//坐标信息
            if(posData){
              //更新矩阵的状态
              this.setRectStatus(posData,true);
            }else {
              let deleteItem = Object.assign({},item);
              viewModuleData.splice(k,1);//删除该模块的菜单 添加到下一个模块里
              if(this.moduleData.length<=i+1){//说明后面没有可用的模块 则需要添加模块
                this.addModuleAndRect();
              }
              this.moduleData[i+1].moduleItem.push(deleteItem);
              k--;
              h--;
            }
          }
        }

        //更新数据源
        this.updateApiData();
      },
      //设置模块的位置（moduleData的数据是整理好的）
      //return boolean (源数据是否改变)
      setModulePos(){
        let sourceChange = false;//源数据 apiData是否改变了
        for(let i=0; i<this.moduleData.length; i++){
          let viewModuleData = this.moduleData[i].moduleItem;
          let h = viewModuleData.length;
          for(let k=0; k<h; k++){
            let item = viewModuleData[k];
            //被占用
            if(this.getStatusRect(item)){
              sourceChange = true;
              item.viewIndex = i;
              //找新的位置
              let posData = this.pushItemToRect(item);//坐标信息
              if(posData){
                //更新矩阵的状态
                this.setRectStatus(posData,true);
              }else {
                let deleteItem = Object.assign({},item);
                viewModuleData.splice(k,1);//删除该模块的菜单 添加到下一个模块里
                if(this.moduleData.length<=i+1){//说明后面没有可用的模块 则需要添加模块
                  this.addModuleAndRect();
                }
                this.moduleData[i+1].moduleItem.push(deleteItem);
                k--;
                h--;
              }
            }else {
              this.setRectStatus(item,true);
            }
          }
        }
        //更新数据源
        this.updateApiData();
        return sourceChange;
      },
      //判断本事块的位置是否被占用了
      getStatusRect(dataItem){
        let isCheck = false;//是否成功了
        if(this.moduleRect.length<dataItem.viewIndex+1) return true;

        for(let i=dataItem.top,l=dataItem.top+dataItem.height; i<l; i++){
          let rectCol = this.moduleRect[dataItem.viewIndex][i];//每行的数据
          if(!rectCol) return true;
          for(let j=dataItem.left; j<dataItem.left+dataItem.width; j++){
            if(!rectCol[j] || rectCol[j].curId){
              isCheck=true;
              break;
            }
          }
          if(isCheck) break;
        }
        return isCheck;
      },

      //更新源数据
      updateApiData(){
        this.moduleApiData=[];//先清空
        for(let i=0; i<this.moduleData.length; i++){
          let viewModuleData = this.moduleData[i].moduleItem;
          this.moduleApiData = this.moduleApiData.concat(viewModuleData);
          viewModuleData=null;//释放内存
        }
      },
      //在某一个屏里通过块信息 查找满足的块（只查找某一个屏）
      //返回包含正确的left top viewIndex的值的块
      pushItemToRect(dataItem){
        let isCheck = false;//是否成功了
        let posData = null;

        let rectRowL = this.moduleRect[dataItem.viewIndex].length;//总行数

        for(let i=0,l=rectRowL; i<l; i++){
          let rectCol = this.moduleRect[dataItem.viewIndex][i];//每行的数据
          let rectColL = rectCol.length;//每行的总列数
          for(let j=0; j<rectColL; j++){
            let rectItem = rectCol[j].curId;
            //当前这个没有被暂用，长宽都为1
            if(!rectItem){
              posData = {
                top:i,
                left:j
              };
              if(dataItem.width==1 && dataItem.height==1){
                isCheck = true;
                break;
              }else{
                //后面没有足够多的位置
                if(dataItem.width>rectColL-j || dataItem.height>rectRowL-i){ //宽度还有没有位置 高度还有没有位置
                  break;
                }
                //先判断当前有没有足够的行
                if(!this.hasEnoughRow(i,dataItem,j)){
                  let isRowCheck = false;
                  let usedIndex = -1;//被暂用的位置优化代码
                  //从该行的下一个查起,到总共需要的个数(在这范围里一个都)
                  for(let rowI=j+1; rowI<j+dataItem.width; rowI++){
                    if(rectCol[rowI].curId){
                      isRowCheck=true;
                      usedIndex=rowI;
                      break;
                    }else {
                      //判断是否有足够的行
                      if(this.hasEnoughRow(i,dataItem,rowI)){
                        isRowCheck=true;
                        usedIndex=rowI;
                        break;
                      }
                    }
                  }
                  //说明被占用了 则查找下一个可用的
                  if(isRowCheck){
                    j = usedIndex;
                  }else {
                    isCheck = true;
                    break;
                  }
                }
              }
            }
          }
          if(isCheck) break;
        }

        return isCheck ? Object.assign(dataItem,posData) : null;
      },

      //判断有没有足够多的行
      //返回 true ：代表  竖的不满足
      hasEnoughRow(curRow,dataItem,rowIndex){
        let startRow = curRow+1;//开始查找的行 从当前行的下一行开始查找
        let endRow = curRow+dataItem.height;//截止查找的行 从当前行和要查找的总行的和
        let isRowCheck=false;//true代表被占用了
        //当前列没有被占用 再判断当前所需的行有没有被占用
        let curModuleRect = this.moduleRect[dataItem.viewIndex];
        for(let colJ=startRow; colJ<endRow; colJ++){
          if(curModuleRect[colJ][rowIndex].curId){
            isRowCheck=true;
            break;
          }
        }
        return isRowCheck;
      },
      /**
       * 设置矩阵的选中状态 或者取消选中状态
       * @param newDataItem 块的信息
       * @param isCheck true: 设置选中状态   false：取消选中状态
       */
      setRectStatus(newDataItem,isCheck=false){
        let curModuleRect = this.moduleRect[newDataItem.viewIndex];
        let isCurId = isCheck ? newDataItem.id : "";
        for(let i=newDataItem.top,l=newDataItem.height + newDataItem.top; i<l; i++){
          for(let k=newDataItem.left,h=newDataItem.width + newDataItem.left; k<h; k++){
            curModuleRect[i][k].curId = isCurId;
          }
        }
      },
      /**
       * 设置矩阵的选中状态 或者取消选中状态（移动矩阵）
       * @param newDataItem 块的信息
       * @param isCheck true: 设置选中状态   false：取消选中状态
       */
      setMoveRectStatus(newDataItem,isCheck=false){
        let curModuleRect = this.moduleRect[newDataItem.viewIndex];
        for(let i=newDataItem.top,l=newDataItem.height + newDataItem.top; i<l; i++){
          for(let k=newDataItem.left,h=newDataItem.width + newDataItem.left; k<h; k++){
            curModuleRect[i][k].spacePos = isCheck;
          }
        }
      },
      //根据rectWidth跟rectHeight创建空矩阵
      createSpaceRect(){
        this.spaceRect=[];
        for(let i=0,l=this.rectHeight; i<l; i++){
          let spaceRectTwo=[];
          for(let j=0,k=this.rectWidth; j<k; j++){
            spaceRectTwo.push({curId:"",spacePos:false});
          }
          this.spaceRect.push(spaceRectTwo);
        }
      },
      //添加模块的空数据和空矩阵
      addModuleAndRect(){
        this.moduleData.push({uiKey:"moduleData_"+new Date().getTime(),moduleItem:[],update:false});
        this.moduleRect.push(this.cloneSecondData(this.spaceRect));
      },
      //算法数据格式转化一下
      //从Api获取的格式转化成我们需要的格式
      turnModuleData(){
        //初始化
        this.moduleData=[{uiKey:new Date().getTime(),moduleItem:[]}];
        this.moduleRect=[this.cloneSecondData(this.spaceRect)];
        this.currentView=0;
        this.targetCurrentView=0;

        for(let i=0,l=this.moduleApiData.length; i<l; i++){
          let item = Object.assign({uiKey:new Date().getTime(),updatepos:false},this.moduleApiData[i]);
          if(item.viewIndex+1>this.moduleData.length){
            //添加不够的屏数
            for(let k=this.moduleData.length; k<item.viewIndex+1; k++){
              this.addModuleAndRect();
            }
          }
          //一个个的添加到moduleData数组里
          this.moduleData[item.viewIndex].moduleItem.push(item);
        }

        //过滤掉头有空屏的数据
//        this.clearHeadNullModuleData();

      },
      //过滤掉头有空屏的数据
      clearHeadNullModuleData(){
        let isNull=false;
        let isRemove=false;//是否有删减空的
        for(let i=0; i<this.moduleData.length; i++){
          let item = this.moduleData[i];
          if(!isNull && !item.moduleItem.length){
            this.moduleData.splice(i,1);
            this.moduleRect.splice(i,1);
            i--;
            isRemove=true;
          }else {
            isNull=true;
          }
        }
        //若有删减空的 则moduleData的viewIndex都要重新改变一下
        if(isRemove){
          this.changeItemInData();
          this.updateApiData();
          this.$emit("drag-change",this.cloneFirstData(this.moduleApiData));
        }
      },
      //改变moduleData 里面所有item 的viewIndex的值 都减 1
      changeItemInData(){
        for(let i=0,l=this.moduleData.length; i<l; i++){
          let item = this.moduleData[i].moduleItem;
          for(let j=0,k=item.length; j<k; j++){
            item[j].viewIndex=i;
          }
        }
      },
      //过滤掉后面空屏的数据 moduleData
      clearNullLast(){
        let isNull = true;
        for(let i=this.moduleData.length-1; i>=0; i--){
          let item = this.moduleData[i];
          if(!item.moduleItem.length && isNull){
            this.moduleData.pop();
            this.moduleRect.pop();
          }else {
            isNull = false;
          }
        }
      },
      //切换屏幕
      turnRightView(isRight=true){
        if(isRight){
          this.currentView++;
        }else {
          this.currentView--;
        }
        this.targetCurrentView=this.currentView;
      },
      //右键
      contextMenu(){
        this.showDragMenu=true;
        let {left,top,width,height} = this.$refs.deskDragBox.getBoundingClientRect();
        if(event.clientX-left+130>width){
          this.rightMenuStyle.left=(width-130+left)+'px';
        }else {
          this.rightMenuStyle.left=event.pageX-left+'px';
        }

        if(event.clientY-top+50>height){
          this.rightMenuStyle.top=(height+top-50)+'px';
        }else {
          this.rightMenuStyle.top=event.pageY-top+'px';
        }
      },
      dragClickOutside(){
        this.showDragMenu=false;
      },
      //取消固定
      cancelDragFixed(){
        this.deleteModuleItemData(this.selectModule);//删除临时显示数据块
        this.setRectStatus(this.selectModule);//删除对应矩阵
        //更新数据源
        this.updateApiData();
        this.showDragMenu=false;//隐藏右键信息
        this.$emit('drag-delete',this.selectModule,this.cloneFirstData(this.moduleApiData));
      },
      //双击组件
      dragDblClick(d){
        this.$emit('drag-dblclick',d);
      }
    },
    created(){
      this.isMouserWheel = false;
      this.minWindowWidth = 930;
      this.minWindowHeight = 478;
      //必须先重置一下 重新创建移动层
      this.monitorWidthHeight();
      this.createSpaceRect();
    },
    mounted(){
      //获取科室列表
//      this.$ajaxPost(window.path + '/portal/modules/getDeptInfo.do',{staffNo:window.uiUserInfo.staffNo}).then((res)=>{
//        this.deptIdList = res;
//      });
    }
  }
</script>
