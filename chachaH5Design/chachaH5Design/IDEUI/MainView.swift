//  主视图
//  MainView.swift
//  chachaH5Design
//
//  Created by guominglong on 2017/12/1.
//  Copyright © 2017年 SSdk. All rights reserved.
//

import Foundation
import SnapKit
class MainView:GMLView{
    fileprivate var dragType:String = "";//视图边沿拖拽状态，默认为没有任何视图被拖拽
    fileprivate var topView:TopView!;//顶部工具面板
    fileprivate var leftView:LeftView!;//左侧工具面板
    fileprivate var rightView:RightView!;//右侧工具面板
    fileprivate var centerView:CenterView!;//中间工作区域面板
    
    required init?(coder: NSCoder) {
        super.init(coder: coder);
        self.gml_initialUI();
    }
    override func gml_initialUI() {
        let w = self.frame.size.width;
        let h = self.frame.size.height;
        let offsetH = h - 150;
        topView = TopView(frame: NSRect(x: 0, y: offsetH, width: w, height: 100));
        self.addSubview(topView);
        
        leftView = LeftView(frame: NSRect(x: 0, y: 0, width: 150, height: offsetH));
        self.addSubview(leftView);
        
        rightView = RightView(frame: NSRect(x: w - 200, y: 0, width: 200, height: offsetH));
        self.addSubview(rightView);
        
        centerView = CenterView(frame:NSRect(x:leftView.frame.maxX, y: 0, width: rightView.frame.minX - leftView.frame.maxX, height: offsetH))
        self.addSubview(centerView)
        centerView.snp.makeConstraints { (make) in
            make.bottom.equalTo(self.snp.bottom);
            make.left.equalTo(leftView.snp.right);
            make.top.equalTo(topView.snp.bottom);
            make.right.equalTo(rightView.snp.left);
        }
        //添加相关的监听事件
        gml_addEvents();
    }
    
    override func gml_addEvents() {
        NotificationCenter.default.addObserver(self, selector: #selector(onIDEPanelSideBeginDrag), name: IDEPanelSideBeginDrag, object: nil);
        NotificationCenter.default.addObserver(self, selector: #selector(onIDEPanelSideEndDrag), name: IDEPanelSideEndDrag, object: nil);
    }
    
    override func gml_resize(_ size: NSSize) {
        self.frame.size = size;
        let w = self.frame.size.width;
        let h = self.frame.size.height;
        let offsetH = h - topView.frame.size.height;
        topView.frame = NSRect(x: 0, y: offsetH, width: w, height: topView.frame.size.height);
        leftView.frame = NSRect(x: 0, y: 0, width: leftView.frame.size.width, height: offsetH);
        rightView.frame = NSRect(x: w - rightView.frame.size.width, y: 0, width: rightView.frame.size.width, height: offsetH)
        topView.updateConstraints();
        leftView.updateConstraints();
        rightView.updateConstraints();
        centerView.updateConstraints();
    }
    
    func onIDEPanelSideBeginDrag(_ notify:NSNotification){
        dragType = (notify.object as? String) ?? "";
        NSLog("1:\(dragType)")
    }
    
    func onIDEPanelSideEndDrag(_ notify:NSNotification){
        dragType = "";
        NSLog("2:\(dragType)")
    }
    
    override func mouseDragged(with event: NSEvent) {
        if dragType == "topV"{
            //改变顶部工具栏的尺寸
            var tempH = topView.frame.size.height + event.deltaY;
            tempH = tempH > topView.maxHeight ? topView.maxHeight : tempH;
            tempH = tempH < topView.minHeight ? topView.minHeight : tempH;
            topView.frame.size.height = tempH;
            NotificationCenter.default.post(name: NSNotification.Name.NSWindowDidResize, object: self.window);
        }else if dragType == "leftV"{
            //改变左侧工具栏的尺寸
            var tempW = leftView.frame.size.width + event.deltaX;
            tempW = tempW > leftView.maxWidth ? leftView.maxWidth : tempW;
            tempW = tempW < leftView.minWidth ? leftView.minWidth : tempW;
            leftView.frame.size.width = tempW;
            NotificationCenter.default.post(name: NSNotification.Name.NSWindowDidResize, object: self.window);
        }else if dragType == "rightV"{
            //改变右侧工具栏的尺寸
            var tempW = rightView.frame.size.width - event.deltaX;
            tempW = tempW > rightView.maxWidth ? rightView.maxWidth : tempW;
            tempW = tempW < rightView.minWidth ? rightView.minWidth : tempW;
            rightView.frame.size.width = tempW;
            NotificationCenter.default.post(name: NSNotification.Name.NSWindowDidResize, object: self.window);
        }
    }
    
    
    override func mouseDown(with event: NSEvent) {
        
        let locolPoint = event.locationInWindow;
        var tempP = topView.frame.minY;
        if locolPoint.y > tempP - 2 && locolPoint.y < tempP + 2{
            //开始拖拽topView的边沿
            NotificationCenter.default.post(name: IDEPanelSideBeginDrag, object: "topV");
            return;
        }
        
        tempP = leftView.frame.maxX;
        if locolPoint.x > tempP - 2 && locolPoint.x < tempP + 2{
            //开始拖拽leftView的边沿
            NotificationCenter.default.post(name: IDEPanelSideBeginDrag, object: "leftV");
            return;
        }
        
        tempP = rightView.frame.minX;
        if locolPoint.x > tempP - 2 && locolPoint.x < tempP + 2{
            //开始拖拽rightView的边沿
            NotificationCenter.default.post(name: IDEPanelSideBeginDrag, object: "rightV");
            return;
        }
        
        super.mouseDown(with: event);
    }
    
    override func mouseUp(with event: NSEvent) {
        //停止了各个面板视图的边沿拖拽
        NotificationCenter.default.post(name: IDEPanelSideEndDrag, object: nil);
        super.mouseUp(with: event);
    }
}