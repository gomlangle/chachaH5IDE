/**
 * Created by guominglong on 2017/12/11.
 * 核心库
 */

/**
 * 基础类,可以被初始化
 * */
class BaseObject{

    constructor(){

    }

    /**
     * 判断类型是否相同
     * */
    isKindOf(_classType){
        if(!_classType)
            return false;
        return this.constructor === _classType;
    }

    /**
     * 判断类型是否相同或者继承_classTypeStr的类型
     * */
    isMemberOf(_classType){
        if(!_classType)
            return false;
        return this instanceof _classType;
    }


    destroy(){

    }
}


/**
 * 基础事件派发者
 * Created by guominglong on 2017/4/7.
 */
class BaseEventDispatcher extends BaseObject{
    constructor(){
        super();
        this.eventNode = document.createElement("div");
        this.events = new Map();
    }

    /**
     * 派发事件
     * @param evt 是一个BaseEvent
     * */
    dispatchEvent(evt){
        if(!evt){
            return;
        }
        evt.gCurrentTarget = this;
        this.eventNode.dispatchEvent(evt);
        evt.gCurrentTarget = null;//用完就释放,避免循环引用
    }

    /**
     * 添加一个事件监听
     * @param evtType 自定义的事件类型(也可以是系统的事件类型)
     * @param execFunc 事件的处理函数
     * @param useCapture 是否在捕获阶段执行,默认为false(在目标阶段和冒泡阶段执行)
     * */
    addEventListener(evtType,execFunc,useCapture = false){
        if(!evtType){
            return;
        }
        if(this.events.has(evtType)){
            //如果添加过监听,就追加
            this.events.get(evtType).add(execFunc)
        }else{
            //如果没有添加过监听,就新建监听集合
            this.events.set(evtType,new Set([execFunc]));
        }
        this.eventNode.addEventListener(evtType,execFunc,useCapture);
    }

    /**
     * 添加一个事件监听
     * @param evtType 自定义的事件类型(也可以是系统的事件类型)
     * @param execFunc 事件的处理函数
     * @param useCapture 是否在捕获阶段执行,默认为false(在目标阶段和冒泡阶段执行)
     * */
    removeEventListener(evtType,execFunc,useCapture = false){
        if(!evtType){
            return;
        }
        if(this.events.has(evtType)){
            //如果添加过监听,就追加
            let evtSet = this.events.get(evtType);
            evtSet.forEach((value,key) => {
                if(value == execFunc)evtSet.delete(value)
            })
                //如果监听函数数组的长度为0,代表不再需要用map来维护,直接删除
                if(evtSet.size == 0){
                    this.events.delete(evtType)
                }
        }
        this.eventNode.removeEventListener(evtType,execFunc,useCapture)
    }

    /**
     * 移除所有的监听事件
     * */
    removeAllEventListener(){
        //遍历map
        let mySelf = this;
        this.events.forEach((value,key)=>{
            //遍历每一个监听类型对应的set函数数组
            let funcSet = value;
            funcSet.forEach((func,idx)=>{
                //移除指定的监听事件
                mySelf.eventNode.removeEventListener(key,func);
            })
            //清空函数数组
            funcSet.clear();
        })
        //清空map
        this.events.clear();
    }

    destroy(){
        super.destroy();
        this.removeAllEventListener();
    }
}

/**
 * 通知中心
 * */
class BaseNotificationCenter extends BaseObject{
    static main() {
        if (!window.gmlNotificationCenter)
            window.gmlNotificationCenter = new BaseNotificationCenter();
        return window.gmlNotificationCenter;
    }

    constructor(){
        super();
        this._notifyMap = new Map();
    }

    /**
     * 触发通知监听
     * */
    postNotify(key,argObject){
        if(this._notifyMap.has(key)){
            let arr = this._notifyMap.get(key)
            for (let mp of arr){
                for(let item of mp.entries())
                {
                    item[1].call(item[0],argObject)
                }
            }
        }
    }

    /**
     * 添加通知监听
     * @param observer 被监听对象
     * @param key 监听的类型
     * @param execFunc被监听对象所拥有的public类型的处理函数
     * */
    addObserver(observer,key,execFunc){
        if(this._notifyMap.has(key)){
            let mp = new Map();//创建一个弱引用集合
            mp.set(observer,execFunc);
            this._notifyMap.get(key).add(mp);
        }else{
            let mp = new Map();//创建一个弱引用集合
            mp.set(observer,execFunc);
            this._notifyMap.set(key,new Set([mp]));
        }
    }

    /**
     * 移除指定对象上的指定类型的通知监听
     * */
    removeObserver(observer,key){
        if(this._notifyMap.has(key)){
            let arr = this._notifyMap.get(key);
            let tempArr = Array.from(arr).concat()
            tempArr.forEach(function(mp,idx){
                if(mp.has(observer))
                {
                    arr.delete(mp);
                    mp.clear();
                }
            })
        }
    }

    /**
     * 移除指定key对应的通知监听数组
     * */
    removeAllObserverByKey(key){
        if(this._notifyMap.has(key)){
            let arr = this._notifyMap.get(key);
            for(let mp of arr){
                mp.clear();
            }
            arr.clear();
        }
    }

    /**
     * 移除全部的通知监听
     * */
    removeAllObserver(){
        let keys = this._notifyMap.keys();
        for(let key of keys){
            let arr = this._notifyMap.get(key);
            for(let mp of arr){
                mp.clear();
            }
            arr.clear();
        }
        this._notifyMap.clear();
    }
}


//显示对象类型声明----------------begin-------------------------
/**
 * 画布
 * */
class GMLCanvas extends BaseEventDispatcher{
    constructor(){
        super();
        this.canvas = document.createElement("canvas");

        this._argChanged = true;
        this._width = 0;//宽度
        this._height = 0;//高度
    }

    get width(){
        return this._width;
    }
    set width(n){
        this._width = n < 0 ? 0 : n;
        this.canvas.width = this._width + "";
    }
    get height(){
        return this._height;
    }
    set height(n){
        this._height = n < 0 ? 0 : n;
        this.canvas.height = this._height + "";
    }


    get context2D(){
        if(this._argChanged)
        {
            //重新创建画布上下文
            this._context2D = this.canvas.getContext("2d");
        }
        return this._context2D;
    }

}

/**
 * 显示对象基础类
 * */
class GMLDisplay extends BaseEventDispatcher{
    constructor(){
        super();

        this._width = 0;//宽度
        this._height = 0;//高度
        this._scaleX = 1;//横向缩放比
        this._scaleY = 1;//纵向缩放比
        this._x = 0;//横向坐标
        this._y = 0;//纵向坐标
        this._z = 0;//深度坐标
        this._rotateZ = 0;//沿Z轴旋转的角度
        this._rotateX = 0;//沿x轴旋转的角度
        this._rotateY = 0;//沿y轴旋转的角度
        this._alpha = 1;//不透明度
        this._hidden = false;//是否隐藏


        this._parent = null;//父容器显示对象的引用
        //this._rootParent = null;//根容器显示对象的引用   之所以注释掉,是因为感觉没什么用

    }

    get width(){
        return this._width;
    }
    set width(n){
        this._width = n < 0 ? 0 : n;
    }
    get height(){
        return this._height;
    }
    set height(n){
        this._height = n < 0 ? 0 : n;
    }
    get scaleX(){
        return this._scaleX;
    }
    set scaleX(n){
        this._scaleX = n < 0 ? 0 : n;
    }
    get scaleY(){
        return this._scaleY;
    }
    set scaleY(n){
        this._scaleY = n < 0 ? 0 : n;
    }
    get x(){
        return this._x;
    }
    set x(n){
        this._x = n;
    }
    get y(){
        return this._y;
    }
    set y(n){
        this._y = n;
    }
    get z(){
        return this._z;
    }
    set z(n){
        this._z = n;
    }
    get rotateZ(){
        return this._rotateZ;
    }
    set rotateZ(n){
        this._rotateZ = n;
    }
    get rotateX(){
        return this._rotateX;
    }
    set rotateX(n){
        this._rotateX = n;
    }
    get rotateY(){
        return this._rotateY;
    }
    set rotateY(n){
        this._rotateY = n;
    }
    get alpha(){
        return this._alpha;
    }
    set alpha(n){
        this._alpha = n < 0 ? 0 : n;
        this._alpha = this._alpha > 1 ? 1 : this._alpha;
    }
    get hidden(){
        return this._hidden;
    }
    set hidden(n){
        this._hidden = n;
    }
    get parent(){
        return this._parent;
    }
    set parent(n){
        this._parent = n;
    }



    /**
     * 将自身绘制到指定的绘图上下文当中
     * @param ctx Context2d 绘图上下文
     * @param offsetX Number 从根显示对象一直递归到this的 X轴位移(1比1比例时的位置)
     * @param offsetY Number 从根显示对象一直递归到this的 Y轴位移(1比1比例时的位置)
     * @param offsetScaleX Number 从根显示对象一直递归到this的 横向缩放比例(最终比例)
     * @param offsetScaleY Number 从根显示对象一直递归到this的 纵向缩放比例(最终比例)
     * */
    drawInContext(ctx,offsetX,offsetY,offsetScaleX,offsetScaleY){
    }

}

/**
 * 色块类
 * */
class GMLShape extends GMLDisplay{
    constructor(){
        super();
        this._fColor = 0;//uint32 类型 填充色RGBA颜色  0xFF6600FF
        this._sColor = 0;//uint32 类型 笔触色RGBA颜色  0xFF6600FF
        this._fColorStr = "#000000ff";//颜色的字符串形式
        this._sColorStr = "#000000ff";//颜色的字符串形式
    }

    makeShape(_x,_y,_w,_h,_fillColor,_strokeColor){
        this.x = _x;
        this.y = _y;
        this.width = _w;
        this.height = _h;
        this.fColor = _fillColor;
        this.sColor = _strokeColor;
    }

    get fColor(){
        return this._fColor;
    }

    set fColor(uint32Color){
        this._fColor = uint32Color;
        //之所以不这么写是因为按位运算uint32会丢精度"rgba("+ (uint32Color >> 24) +","+ ((uint32Color >> 16) & 0x00FF) +","+ ((uint32Color >> 8) & 0x0000FF) +","+ (uint32Color & 0x0000ffFF) +")";//重新计算颜色字符串
        this._fColorStr = "#" + uint32Color.toString(16)
    }

    get sColor(){
        return this._sColor;
    }

    set sColor(uint32Color){
        this._sColor = uint32Color;
        this._sColorStr = "#" + uint32Color.toString(16)
    }

    drawInContext(ctx,offsetX,offsetY,offsetScaleX,offsetScaleY){
       // console.log("内部",offsetX,offsetY)
        ctx.strokeStyle = this._fColorStr;
        ctx.fillStyle = this._sColorStr;
        ctx.fillRect(offsetX + this.x * offsetScaleX,offsetY + this.y * offsetScaleY,this.width * offsetScaleX * this.scaleX,this.height * offsetScaleY * this.scaleY);
        ctx.strokeRect(offsetX + this.x * offsetScaleX,offsetY + this.y * offsetScaleY,this.width * offsetScaleX * this.scaleX,this.height * offsetScaleY * this.scaleY);
    }
}

/**
 * 显示对象容器
 * */
class GMLSprite extends GMLDisplay{
    constructor() {
        super();
        this._children = [];//子显示对象数组
        this._contentNode = new GMLShape();
    }

    makeShape(_x,_y,_w,_h,_fillColor,_strokeColor){
        this._contentNode.makeShape(_x,_y,_w,_h,_fillColor,_strokeColor);
    }

    /**
     * 获取所有子成员
     * */
    children(){
        return this._children.concat();//将副本return出去,防止外部直接操作 this._children影响可视化对象数组. 外部只应该使用addChild,removeChild来操作显示对象.
    }

    /**
     * 添加可视对象到子可视化对象数组中的最后一位
     * */
    addChild(_child){
        if(_child && _child instanceof GMLDisplay){
            let idx = this._children.indexOf(_child);
            if(idx > -1){
                //有相同元素,则先移除
                this._children.splice(idx,1)
            }
            //将之放置到数组末尾
            this._children.push(_child);
        }
    }

    /**
     * 添加可视对象到子可视化对象数组中的最后一位
     * */
    addChildAt(_child,idx){
        if(idx < 0 || idx > this._children.length)
            return;
        if(_child && _child instanceof GMLDisplay){
            let idx = this._children.indexOf(_child);
            if(idx > -1){
                //有相同元素,则先移除
                this._children.splice(idx,1)
            }
            if(idx == this._children.length)
            {
                //将之放置到数组末尾
                this._children.push(_child);
            }else{
                //将之插入到数组中的指定索引
                this._children.splice(idx,0,_child);
            }
        }
    }

    drawInContext(ctx,offsetX,offsetY,offsetScaleX,offsetScaleY){

        let tOffsetX = offsetX + this._x * offsetScaleX;
        let tOffsetY = offsetY + this._y * offsetScaleY;
        let tOffsetScaleX = offsetScaleX * this._scaleX;
        let tOffsetScaleY = offsetScaleY * this._scaleY;
        //绘制自身
        this._contentNode.drawInContext(ctx,tOffsetX,tOffsetY,tOffsetScaleX,tOffsetScaleY)
        //绘制子对象
        this._children.forEach(function(item,idx){
            //console.log("外部",tOffsetX,tOffsetY)
            item.drawInContext(ctx,tOffsetX,tOffsetY,tOffsetScaleX,tOffsetScaleY)
        });
    }
}



//显示对象类型声明----------------end--------------------------


//事件相关类型声明------------------begin------------------
/**
 * 重载Event
 * */
class BaseEvent extends Event{
    constructor(type,data=null,...eventInitDict){
        super(type,eventInitDict);
        this.data = data;
        this.gCurrentTarget = null;
    }
}
//事件相关类型声明------------------end------------------



//动画相关类型声明------------------begin------------------
/**
 * 时间轴  默认帧频为每秒30帧
 * */
class TimeLine extends BaseObject{

    //静态变量 主动画时间轴
    static mainTimeLine(){
        if(!window.mainTimeLine)
            window.mainTimeLine = new TimeLine();
        return window.mainTimeLine;
    }

    constructor(){
        super();
        this._frameRate = 30;//帧频
        this._timekuadu = 1000.0/this._frameRate;//帧频跨度, 类内部使用,用于计算是否执行帧频函数
        this._currentTimeStep = 0;
        this._aniID = 0;//动画函数ID
        this._isPause = false;
    }

    get frameRate(){
        return this._frameRate;
    }
    /**
     * 设置帧频
     * */
    set frameRate(n){
        this._frameRate = n < 0 ? 0 : n;
        this._frameRate = this._frameRate > 50 ? 50 : this._frameRate;
        this._timekuadu = 1000.0/this._frameRate;//重新计算帧频跨度
    }

    /**
     * 开始时间轴
     * */
    start(frameFunc){
        this._currentTimeStep = 0;
        TimeLine.mainTimeLine()._isPause = false;
        if(frameFunc && typeof(frameFunc) === "function")
        {
            this.frameFunc = frameFunc;
            this._aniID = window.requestAnimationFrame(TimeLine.mainTimeLine().updateTimeLine)
        }
    }

    /**
     * 帧频函数
     * */
    updateTimeLine(timeStep){
        if(!TimeLine.mainTimeLine()._isPause)
        {
            //判断是否应该执行具体的帧频函数, 判断条件为为否达到帧频跨度
            if(timeStep - TimeLine.mainTimeLine()._currentTimeStep >= TimeLine.mainTimeLine()._timekuadu){
                TimeLine.mainTimeLine()._currentTimeStep = timeStep;
                TimeLine.mainTimeLine().frameFunc();
            }/*else{
                console.log("判断成功");
            }*/

            //没停止或者暂停,就继续播放下一帧
            TimeLine.mainTimeLine()._aniID = window.requestAnimationFrame(TimeLine.mainTimeLine().updateTimeLine)
        }else{
            //停止动画
            window.cancelAnimationFrame(TimeLine.mainTimeLine()._aniID);
        }
    }

    /**
     * 停止时间轴
     * */
    stop(){
        TimeLine.mainTimeLine().isPause = true;
    }
}

//动画相关类型声明------------------end------------------