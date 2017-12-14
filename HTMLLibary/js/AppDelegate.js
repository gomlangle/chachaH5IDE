/**
 * app主入口
 * Created by guominglong on 2017/12/13.
 */
class AppDelegate{
    static app(){
        if(!window.app)
            window.app = new AppDelegate();
        return window.app;
    }

    constructor(){
        this._mainCanvas = new GMLCanvas();//主画布
        this._rootSprite = new GMLSprite();//根显示容器
    }

    /**
     * 启动
     * */
    start(){

        //将画布添加至document
        document.body.appendChild(this._mainCanvas.canvas);

        //开始时间轴
        TimeLine.mainTimeLine().start(this.updateAnimation);

        //测试用
        let spr1 = new GMLSprite();
        spr1.makeShape(0,0,500,500,0xff6600ff,0xff6600ff);
        this._rootSprite.addChild(spr1);
        spr1.x = 10;

        let spr2 = new GMLSprite();
        spr2.makeShape(0,0,100,100,0xf06000ff,0xf06000ff);
        this._rootSprite.addChild(spr2);
        spr2.x = 120;

        let spr3 = new GMLSprite();
        spr3.makeShape(0,0,100,100,0x006600ff,0x006600ff);
        this._rootSprite.addChild(spr3);
        spr3.x = 230;

        BaseNotificationCenter.main().addObserver(AppDelegate.app(),"bbb",AppDelegate.app().test);
        BaseNotificationCenter.main().addObserver(AppDelegate.app(),"bbb",AppDelegate.app().test);
        BaseNotificationCenter.main().addObserver(spr3,"bbb",AppDelegate.app().test);
        BaseNotificationCenter.main().addObserver(AppDelegate.app(),"ccc",AppDelegate.app().test);
        window.addEventListener("keydown",function(){
            //spr3.x += 2;

            BaseNotificationCenter.main().postNotify("bbb","okle")
            BaseNotificationCenter.main().postNotify("ccc","okle")
            //BaseNotificationCenter.main().removeObserver(AppDelegate.app(),"bbb")
            BaseNotificationCenter.main().removeAllObserver()
        })



        //spr3.addEventListener("onkeyup",function(){
        //
        //})
    }

    test(arg){
        console.log(this,arg);
    }

    /**
     * 时间轴更新动画函数
     * */
    updateAnimation(){
        //这里的this 是一个undefined 因为他是window.requestAnimationFrame 的一个回调函数
        let ctx = window.app._mainCanvas.context2D;
        window.app._rootSprite.drawInContext(ctx,0,0,1,1);//跟容器必须绘制在ctx的0,0位置且 缩放必须为1倍
    }

    /**
     * 尺寸变更
     * */
    resize(w,h){
        this._mainCanvas.canvas.width = w;
        this._mainCanvas.canvas.height = h;
    }

    stop(){
        TimeLine.mainTimeLine().stop();
    }
}