require('./Devices/KLight');

var fs = require('fs');
var packageFile = require("./package.json");
var PlatformAccessory, Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
    if(!isConfig(homebridge.user.configPath(), "platforms", "IkonkeLightPlatform")) {
        return;
    }
    
    PlatformAccessory = homebridge.platformAccessory;
    Accessory = homebridge.hap.Accessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform('homebridge-ikonke-light', 'IkonkeLightPlatform', IkonkeLightPlatform, true);
}

function isConfig(configFile, type, name) {
    var config = JSON.parse(fs.readFileSync(configFile));
    if("accessories" === type) {
        var accessories = config.accessories;
        for(var i in accessories) {
            if(accessories[i]['accessory'] === name) {
                return true;
            }
        }
    } else if("platforms" === type) {
        var platforms = config.platforms;
        for(var i in platforms) {
            if(platforms[i]['platform'] === name) {
                return true;
            }
        }
    } else {
    }
    
    return false;
}

function IkonkeLightPlatform(log, config, api) {
    if(null == config) {
        return;
    }
    
    this.Accessory = Accessory;
    this.PlatformAccessory = PlatformAccessory;
    this.Service = Service;
    this.Characteristic = Characteristic;
    this.UUIDGen = UUIDGen;
    
    this.log = log;
    this.config = config;
    this.ikonkeIO = config['ikonkeIO'];

    if (api) {
        this.api = api;
    }
    
    this.log.info("[IkonkeLightPlatform][INFO]*****************************************************************");
    this.log.info("[IkonkeLightPlatform][INFO]          IkonkeLightPlatform v%s By YinHang", packageFile.version);
    this.log.info("[IkonkeLightPlatform][INFO]  GitHub: https://github.com/YinHangCode/homebridge-ikonke-light ");
    this.log.info("[IkonkeLightPlatform][INFO]                                             QQ Group: 107927710 ");
    this.log.info("[IkonkeLightPlatform][INFO]*****************************************************************");
    this.log.info("[IkonkeLightPlatform][INFO]start success...");
}

IkonkeLightPlatform.prototype = {
    accessories: function(callback) {
        var myAccessories = [];

        var deviceCfgs = this.config['deviceCfgs'];
        if(deviceCfgs instanceof Array) {
            for (var i = 0; i < deviceCfgs.length; i++) {
                var deviceCfg = deviceCfgs[i];
                if(null == deviceCfg['type'] || "" == deviceCfg['type'] || null == deviceCfg['mac'] || "" == deviceCfg['mac'] || null == deviceCfg['ip'] || "" == deviceCfg['ip'] || null == deviceCfg['password'] || "" == deviceCfg['password']) {
                    continue;
                }

                if (deviceCfg['type'] == "klight") {
                    new KLight(this, deviceCfg).forEach(function(accessory, index, arr) {
                        myAccessories.push(accessory);
                    });
                } else {
                }
            }
            this.log.info("[IkonkeLightPlatform][INFO]device size: " + deviceCfgs.length + ", accessories size: " + myAccessories.length);
        }
        
        callback(myAccessories);
    }
}