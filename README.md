# homebridge-ikonke-light
[![npm version](https://badge.fury.io/js/homebridge-ikonke-light.svg)](https://badge.fury.io/js/homebridge-ikonke-light)

HomeBridge的控客灯插件。   
   
**注: 如果有bug请提交到 [issues](https://github.com/YinHangCode/homebridge-ikonke-light/issues) 或 [QQ群: 107927710](//shang.qq.com/wpa/qunwpa?idkey=8b9566598f40dd68412065ada24184ef72c6bddaa11525ca26c4e1536a8f2a3d)。**   

![](https://raw.githubusercontent.com/YinHangCode/homebridge-ikonke-light/master/images/KLight.jpg)

## 支持的设备
1.K Light   

## 安装说明
1.安装HomeBridge, 可以参考文件[README](https://github.com/nfarina/homebridge/blob/master/README.md)。   
如果你是安装在树莓派里，可以参考[Running-HomeBridge-on-a-Raspberry-Pi](https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi)。   
2.确保你能在IOS设备的家庭app内搜到HomeBridge，如果不能请返回第一步。   
3.安装[ikonkeIO](https://github.com/YinHangCode/ikonkeIO)。   
4.安装本插件。
```
npm install -g homebridge-ikonke-light
```
## 配置说明
配置"ikonkeIO"为ikonkeIO目录下sh文件的绝度路径。   
设备的"type"、"ip"、"mac"、"password"可以通过ikonkeIO获取，具体参考[ikonkeIO](https://github.com/YinHangCode/ikonkeIO)项目。   
"lightName"配置为配件的名字。   
示例如下：   
```
"platforms": [{
    "platform": "IkonkeLightPlatform",
    "ikonkeIO": "/home/pi/node_modules/ikonkeIO/ikonkeIO.sh",
    "deviceCfgs": [{
        "type": "klight",
        "ip": "192.168.88.20",
        "mac": "18-fe-56-d7-5d-ea",
        "password": "A?lz?=]G",
        "lightDisable": false,
        "lightName": "客厅次灯_高"
    }, {
        "type": "klight",
        "ip": "192.168.88.21",
        "mac": "18-fe-56-d8-5a-e6",
        "password": "[58DzqaX",
        "lightDisable": false,
        "lightName": "客厅次灯_中"
    }, { 
        "type": "klight",   
        "ip": "192.168.88.22",
        "mac": "18-fe-78-d1-0f-3e",
        "password": "aDU[7.AQ",
        "lightDisable": false,
        "lightName": "客厅次灯_低"
    }]
}]
```
## 版本更新记录
### 0.0.2
1.代码优化.   
### 0.0.1
1.支持控制K Light设备.   
