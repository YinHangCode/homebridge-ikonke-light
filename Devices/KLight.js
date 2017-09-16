require('./Base');

const inherits = require('util').inherits;
var spawnSync = require('child_process').spawnSync;

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;

KLight = function(platform, config) {
    this.init(platform, config);
    
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;
    
    this.device = {
        ip: this.config['ip'],
        mac: this.config['mac'],
        passwd: this.config['password']
    };
    
    this.accessories = {};
    if(!this.config['lightDisable'] && this.config['lightName'] && this.config['lightName'] != "") {
        this.accessories['lightAccessory'] = new KLightBulbAccessory(this);
    }
    var accessoriesArr = this.obj2array(this.accessories);
    
    this.platform.log.debug("[IkonkeLightPlatform][DEBUG]Initializing " + this.config["type"] + " device: " + this.config["ip"] + ", accessories size: " + accessoriesArr.length);
    
    return accessoriesArr;
}
inherits(KLight, Base);

KLightBulbAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['lightName'];
    this.platform = dThis.platform;
}

KLightBulbAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "ikonke")
        .setCharacteristic(Characteristic.Model, "K Light")
        .setCharacteristic(Characteristic.SerialNumber, this.device['mac']);
    services.push(infoService);
    
    var lightService = new Service.Lightbulb(this.name);
    lightService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPower.bind(this))
        .on('set', this.setPower.bind(this));
    lightService
        .addCharacteristic(Characteristic.Brightness)
        .on('get', this.getBrightness.bind(this))
        .on('set', this.setBrightness.bind(this));
    var saturationCharacteristic = lightService.addCharacteristic(Characteristic.Saturation);
    var hueCharacteristic = lightService.addCharacteristic(Characteristic.Hue);
    saturationCharacteristic
        .on('set', function(value, callback) {
            var that = this;
            var rgb = hsb2rgb([value, saturationCharacteristic.value/100, 1]);
            var process = spawnSync("sh", [that.platform.ikonkeIO, '-C', "klight", that.device.ip, that.device.mac, that.device.passwd, "setRGB", (rgb[0]+","+rgb[1]+","+rgb[2])]);
            var stdoutInfo = process.stdout.toString().replace(/[\n]/g, "");
            that.platform.log.debug("[IkonkeLightPlatform][DEBUG]KLight - Bulb - setSaturation: " + stdoutInfo);
            if(stdoutInfo === "success") {
                callback(null);
            } else {
                callback(new Error(stdoutInfo));
            }
        }.bind(this));
    hueCharacteristic
        .on('get', function(callback) {
            var that = this;
            var process = spawnSync("sh", [that.platform.ikonkeIO, '-C', "klight", that.device.ip, that.device.mac, that.device.passwd, "getRGB"]);
            var stdoutInfo = process.stdout.toString().replace(/[\n]/g, "");
            that.platform.log.debug("[IkonkeLightPlatform][DEBUG]KLight - Bulb - getHue: " + stdoutInfo);
            if(stdoutInfo === "fail") {
                callback(new Error(stdoutInfo));
            } else if(stdoutInfo === "") {
                callback(new Error(stdoutInfo));
            } else {
                var rgbArr = stdoutInfo.split(",");
                var hsb = rgb2hsb([parseInt(rgbArr[0], 16), parseInt(rgbArr[1], 16), parseInt(rgbArr[2], 16)]);
                saturationCharacteristic.updateValue(hsb[1] * 100);
                callback(null, hsb[0]);
            }
        }.bind(this))
        .on('set', function(value, callback) {
            var that = this;
            var rgb = hsb2rgb([value, saturationCharacteristic.value/100, 1]);
            var process = spawnSync("sh", [that.platform.ikonkeIO, '-C', "klight", that.device.ip, that.device.mac, that.device.passwd, "setRGB", (rgb[0]+","+rgb[1]+","+rgb[2])]);
            var stdoutInfo = process.stdout.toString().replace(/[\n]/g, "");
            that.platform.log.debug("[IkonkeLightPlatform][DEBUG]KLight - Bulb - setHue: " + stdoutInfo);
            if(stdoutInfo === "success") {
                callback(null);
            } else {
                callback(new Error(stdoutInfo));
            }
        }.bind(this));
    services.push(lightService);

    return services;
}

KLightBulbAccessory.prototype.getPower = function(callback) {
    var that = this;
    var process = spawnSync("sh", [that.platform.ikonkeIO, '-C', "klight", that.device.ip, that.device.mac, that.device.passwd, "getRelay"]);
    var stdoutInfo = process.stdout.toString().replace(/[\n]/g, "");
    that.platform.log.debug("[IkonkeLightPlatform][DEBUG]KLight - Bulb - getPower: " + stdoutInfo);
    if(stdoutInfo === "open") {
        callback(null, true);
    } else if(stdoutInfo === "close") {
        callback(null, false);
    } else {
        callback(new Error(stdoutInfo));
    }
}

KLightBulbAccessory.prototype.setPower = function(value, callback) {
    var that = this;
    var process = spawnSync("sh", [that.platform.ikonkeIO, '-C', "klight", that.device.ip, that.device.mac, that.device.passwd, "setRelay", value ? "open" : "close"]);
    var stdoutInfo = process.stdout.toString().replace(/[\n]/g, "");
    that.platform.log.debug("[IkonkeLightPlatform][DEBUG]KLight - Bulb - setPower: " + stdoutInfo);
    if(stdoutInfo === "success") {
        callback(null);
    } else {
        callback(new Error(stdoutInfo));
    }
}

KLightBulbAccessory.prototype.getBrightness = function(callback) {
    var that = this;
    var process = spawnSync("sh", [that.platform.ikonkeIO, '-C', "klight", that.device.ip, that.device.mac, that.device.passwd, "getBrightness"]);
    var stdoutInfo = process.stdout.toString().replace(/[\n]/g, "");
    that.platform.log.debug("[IkonkeLightPlatform][DEBUG]KLight - Bulb - getBrightness: " + stdoutInfo);
    if(stdoutInfo === "fail") {
        callback(new Error(stdoutInfo));
    } else if(stdoutInfo === "") {
        callback(new Error(stdoutInfo));
    } else {
        callback(null, parseInt(stdoutInfo));
    }
}

KLightBulbAccessory.prototype.setBrightness = function(value, callback) {
    var that = this;
    var process = spawnSync("sh", [that.platform.ikonkeIO, '-C', "klight", that.device.ip, that.device.mac, that.device.passwd, "setBrightness", value]);
    var stdoutInfo = process.stdout.toString().replace(/[\n]/g, "");
    that.platform.log.debug("[IkonkeLightPlatform][DEBUG]KLight - Bulb - setBrightness: " + stdoutInfo);
    if(stdoutInfo === "success") {
        callback(null);
    } else {
        callback(new Error(stdoutInfo));
    }
}

// hsb2rgb([0, 1, 1]) => [255, 0, 0]
function hsb2rgb(hsb) {
    var rgb = [];        
    //先令饱和度和亮度为100%，调节色相h
    for(var offset=240,i=0;i<3;i++,offset-=120) {
        //算出色相h的值和三个区域中心点(即0°，120°和240°)相差多少，然后根据坐标图按分段函数算出rgb。但因为色环展开后，红色区域的中心点是0°同时也是360°，不好算，索性将三个区域的中心点都向右平移到240°再计算比较方便
        var x=Math.abs((hsb[0]+offset)%360-240);
        //如果相差小于60°则为255
        if(x<=60) rgb[i]=255;
        //如果相差在60°和120°之间，
        else if(60<x && x<120) rgb[i]=((1-(x-60)/60)*255);
        //如果相差大于120°则为0
        else rgb[i]=0;
    }
    //在调节饱和度s
    for(var i=0;i<3;i++)
        rgb[i]+=(255-rgb[i])*(1-hsb[1]);
    //最后调节亮度b
    for(var i=0;i<3;i++)
        rgb[i]*=hsb[2];
    // 取整
    for(var i=0;i<3;i++)
        rgb[i]=Math.round(rgb[i]);

    return rgb;
}

// rgb2hsb([255, 0, 0]) => [0, 1, 1]
function rgb2hsb(rgb) {
    var hsb = [];
    var rearranged = rgb.slice(0);
    var maxIndex = 0,minIndex = 0;
    var tmp;        
    //将rgb的值从小到大排列，存在rearranged数组里
    for(var i=0;i<2;i++) {
        for(var j=0;j<2-i;j++)
            if(rearranged[j]>rearranged[j+1]) {
                tmp=rearranged[j+1];
                rearranged[j+1]=rearranged[j];
                rearranged[j]=tmp;
            }
    }
    //rgb的下标分别为0、1、2，maxIndex和minIndex用于存储rgb中最大最小值的下标
    for(var i=0;i<3;i++) {
        if(rearranged[0]==rgb[i]) minIndex=i;
        if(rearranged[2]==rgb[i]) maxIndex=i;
    }
    //算出亮度
    hsb[2]=rearranged[2]/255.0;
    //算出饱和度
    hsb[1]=1-rearranged[0]/rearranged[2];
    //算出色相
    hsb[0]=maxIndex*120+60* (rearranged[1]/hsb[1]/rearranged[2]+(1-1/hsb[1])) *((maxIndex-minIndex+3)%3==1?1:-1);
    //防止色相为负值
    hsb[0]=(hsb[0]+360)%360;
    return hsb;
}
