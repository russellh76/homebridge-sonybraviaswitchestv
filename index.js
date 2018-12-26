//TODO: This TV doesn't have a page down/up button when dealing with guide
// I tried creating multiple down/ups to behave like paging, but the TV doesn't reliably accept the commands
// Even when time delayed.  Scratching my head about that one
//Node JS Homebridge add-on for controlling Sony Smart TV: homebridge-sonybraviaswitchestv
var request = require("request");
//var wol = require("wake_on_lan");
var inherits = require('util').inherits;
var Service, Characteristic
var stateError = "Error setting TV state.";
var logError = "Error '%s' setting TV state. Response: %s";

//messaging constants
var startXML = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1"><IRCCCode>';
var endXML = '</IRCCCode></u:X_SendIRCC></s:Body></s:Envelope>';
var startJSON = '{"method":"setPowerStatus","params":[{"status":'
var endJSON = '}],"id":1,"version":"1.0"}';
var systemURL = "/sony/system";
var IRCCURL = "/sony/IRCC";
var protocol = "http://";
var SOAPActionVal = '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"';
var ContentTypeVal = "text/xml; charset=UTF-8";
var PowerStatus = '{"method":"getPowerStatus","params":[],"id":1,"version":"1.0"}';

//implemented sony command constants
var SystemOn = "true";  //Only turns TV on
var SystemOff = "false";  //Only turns TV off
var TvPower = "AAAAAQAAAAEAAAAVAw==";  //Toggles TV off and on
var WakeUp = "AAAAAQAAAAEAAAAuAw==";
var PowerOff = "AAAAAQAAAAEAAAAvAw==";  //Only turns TV off
var VolumeUp = "AAAAAQAAAAEAAAASAw==";
var VolumeDown = "AAAAAQAAAAEAAAATAw==";
var Input = "AAAAAQAAAAEAAAAlAw==";
var Mute = "AAAAAQAAAAEAAAAUAw==";
var PicOff = "AAAAAQAAAAEAAAA+Aw==";
var DpadCenter = "AAAAAgAAAJcAAABKAw==";
var CursorUp = "AAAAAgAAAJcAAABPAw==";
var CursorDown = "AAAAAgAAAJcAAABQAw==";
var CursorLeft = "AAAAAgAAAJcAAABNAw==";
var CursorRight = "AAAAAgAAAJcAAABOAw==";
var Hdmi1 = "AAAAAgAAABoAAABaAw==";
var Hdmi2 = "AAAAAgAAABoAAABbAw==";
var Hdmi3 = "AAAAAgAAABoAAABcAw==";
var Hdmi4 = "AAAAAgAAABoAAABdAw==";
var Netflix = "AAAAAgAAABoAAAB8Aw==";
var ClosedCaption = "AAAAAgAAAKQAAAAQAw==";
var SubTitle = "AAAAAgAAAJcAAAAoAw==";
var GGuide = "AAAAAQAAAAEAAAAOAw==";
var ChannelUp = "AAAAAQAAAAEAAAAQAw==";
var ChannelDown = "AAAAAQAAAAEAAAARAw==";
var Stop = "AAAAAgAAAJcAAAAYAw==";
var Pause = "AAAAAgAAAJcAAAAZAw==";
var Play = "AAAAAgAAAJcAAAAaAw==";
var Num1 = "AAAAAQAAAAEAAAAAAw==";
var Num2 = "AAAAAQAAAAEAAAABAw==";
var Num3 = "AAAAAQAAAAEAAAACAw==";
var Num4 = "AAAAAQAAAAEAAAADAw==";
var Num5 = "AAAAAQAAAAEAAAAEAw==";
var Num6 = "AAAAAQAAAAEAAAAFAw==";
var Num7 = "AAAAAQAAAAEAAAAGAw==";
var Num8 = "AAAAAQAAAAEAAAAHAw==";
var Num9 = "AAAAAQAAAAEAAAAIAw==";
var Num0 = "AAAAAQAAAAEAAAAJAw==";
var Channels = "AAAAAQAAAAEAAAAkAw==";
var Jump = "AAAAAQAAAAEAAAA7Aw==";
var PictureOff = "AAAAAQAAAAEAAAA+Aw==";

//unimplemented sony command constants
var Num11 = "AAAAAQAAAAEAAAAKAw==";
var Num12 = "AAAAAQAAAAEAAAALAw==";
var Enter = "AAAAAQAAAAEAAAALAw==";
var Audio = "AAAAAQAAAAEAAAAXAw==";
var MediaAudioTrack = "AAAAAQAAAAEAAAAXAw==";
var Tv = "AAAAAQAAAAEAAAAkAw==";
var TvInput = "AAAAAQAAAAEAAAAlAw==";
var TvAntennaCable = "AAAAAQAAAAEAAAAqAw==";
var Sleep = "AAAAAQAAAAEAAAAvAw==";
var Right = "AAAAAQAAAAEAAAAzAw==";
var Left = "AAAAAQAAAAEAAAA0Aw==";
var SleepTimer = "AAAAAQAAAAEAAAA2Aw==";
var Analog2 = "AAAAAQAAAAEAAAA4Aw==";
var TvAnalog = "AAAAAQAAAAEAAAA4Aw==";
var Display = "AAAAAQAAAAEAAAA6Aw==";
var Teletext = "AAAAAQAAAAEAAAA/Aw==";
var Video1 = "AAAAAQAAAAEAAABAAw==";
var Video2 = "AAAAAQAAAAEAAABBAw==";
var AnalogRgb1 = "AAAAAQAAAAEAAABDAw==";
var Home = "AAAAAQAAAAEAAABgAw==";
var Exit = "AAAAAQAAAAEAAABjAw==";
var PictureMode = "AAAAAQAAAAEAAABkAw==";
var Confirm = "AAAAAQAAAAEAAABlAw==";
var Up = "AAAAAQAAAAEAAAB0Aw==";
var Down = "AAAAAQAAAAEAAAB1Aw==";
var Component1 = "AAAAAgAAAKQAAAA2Aw==";
var Component2 = "AAAAAgAAAKQAAAA3Aw==";
var Wide = "AAAAAgAAAKQAAAA9Aw==";
var EPG = "AAAAAgAAAKQAAABbAw==";
var PAP = "AAAAAgAAAKQAAAB3Aw==";
var TenKey = "AAAAAgAAAJcAAAAMAw==";
var BSCS = "AAAAAgAAAJcAAAAQAw==";
var Ddata = "AAAAAgAAAJcAAAAVAw==";
var Rewind = "AAAAAgAAAJcAAAAbAw==";
var Forward = "AAAAAgAAAJcAAAAcAw==";
var DOT = "AAAAAgAAAJcAAAAdAw==";
var Rec = "AAAAAgAAAJcAAAAgAw==";
var Return = "AAAAAgAAAJcAAAAjAw==";
var Blue = "AAAAAgAAAJcAAAAkAw==";
var Red = "AAAAAgAAAJcAAAAlAw==";
var Green = "AAAAAgAAAJcAAAAmAw==";
var Yellow = "AAAAAgAAAJcAAAAnAw==";
var CS = "AAAAAgAAAJcAAAArAw==";
var BS = "AAAAAgAAAJcAAAAsAw==";
var Digital = "AAAAAgAAAJcAAAAyAw==";
var Options = "AAAAAgAAAJcAAAA2Aw==";
var Media = "AAAAAgAAAJcAAAA4Aw==";
var Prev = "AAAAAgAAAJcAAAA8Aw==";
var Next = "AAAAAgAAAJcAAAA9Aw==";
var ShopRemoteControlForcedDynamic = "AAAAAgAAAJcAAABqAw==";
var FlashPlus = "AAAAAgAAAJcAAAB4Aw==";
var FlashMinus = "AAAAAgAAAJcAAAB5Aw==";
var AudioQualityMode = "AAAAAgAAAJcAAAB7Aw==";
var DemoMode = "AAAAAgAAAJcAAAB8Aw==";
var Analog = "AAAAAgAAAHcAAAANAw==";
var Mode3D = "AAAAAgAAAHcAAABNAw==";
var DigitalToggle = "AAAAAgAAAHcAAABSAw==";
var DemoSurround = "AAAAAgAAAHcAAAB7Aw==";
var AD = "AAAAAgAAABoAAAA7Aw==";
var AudioMixUp = "AAAAAgAAABoAAAA8Aw==";
var AudioMixDown = "AAAAAgAAABoAAAA9Aw==";
var PhotoFrame = "AAAAAgAAABoAAABVAw==";
var TvRadio = "AAAAAgAAABoAAABXAw==";
var SyncMenu = "AAAAAgAAABoAAABYAw==";
var TopMenu = "AAAAAgAAABoAAABgAw==";
var PopUpMenu = "AAAAAgAAABoAAABhAw==";
var OneTouchTimeRec = "AAAAAgAAABoAAABkAw==";
var OneTouchView = "AAAAAgAAABoAAABlAw==";
var DUX = "AAAAAgAAABoAAABzAw==";
var FootballMode = "AAAAAgAAABoAAAB2Aw==";
var iManual = "AAAAAgAAABoAAAB7Aw==";
var Assists = "AAAAAgAAAMQAAAA7Aw==";
var ActionMenu = "AAAAAgAAAMQAAABLAw==";
var Help = "AAAAAgAAAMQAAABNAw==";
var TvSatellite = "AAAAAgAAAMQAAABOAw==";
var WirelessSubwoofer = "AAAAAgAAAMQAAAB+Aw==";

//main
module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-sonymutetv", "homebridge-sonymutetv", SonyMuteTV);	
	homebridge.registerAccessory("homebridge-sonyunmutetv", "homebridge-sonyunmutetv", SonyUnMuteTV);	
	homebridge.registerAccessory("homebridge-sonyvolumeuptv", "homebridge-sonyvolumeuptv", SonyVolumeUpTV);	
	homebridge.registerAccessory("homebridge-sonyvolumedowntv", "homebridge-sonyvolumedowntv", SonyVolumeDownTV);	
	homebridge.registerAccessory("homebridge-sonyhdmi1tv", "homebridge-sonyhdmi1tv", SonyHDMI1TV);
	homebridge.registerAccessory("homebridge-sonyhdmi2tv", "homebridge-sonyhdmi2tv", SonyHDMI2TV);
	homebridge.registerAccessory("homebridge-sonyhdmi3tv", "homebridge-sonyhdmi3tv", SonyHDMI3TV);
	homebridge.registerAccessory("homebridge-sonyhdmi4tv", "homebridge-sonyhdmi4tv", SonyHDMI4TV);
	homebridge.registerAccessory("homebridge-sonyinputtv", "homebridge-sonyinputtv", SonyInputTV);
	homebridge.registerAccessory("homebridge-sonylefttv", "homebridge-sonylefttv", SonyLeftTV);
	homebridge.registerAccessory("homebridge-sonyrighttv", "homebridge-sonyrighttv", SonyRightTV);
	homebridge.registerAccessory("homebridge-sonypagelefttv", "homebridge-sonypagelefttv", SonyPageLeftTV);
	homebridge.registerAccessory("homebridge-sonypagerighttv", "homebridge-sonypagerighttv", SonyPageRightTV);
	homebridge.registerAccessory("homebridge-sonydowntv", "homebridge-sonydowntv", SonyDownTV);
	homebridge.registerAccessory("homebridge-sonypagedowntv", "homebridge-sonypagedowntv", SonyPageDownTV);
	homebridge.registerAccessory("homebridge-sonyuptv", "homebridge-sonyuptv", SonyUpTV);
	homebridge.registerAccessory("homebridge-sonypageuptv", "homebridge-sonypageuptv", SonyPageUpTV);
	homebridge.registerAccessory("homebridge-sonydpadcentertv", "homebridge-sonydpadcentertv", SonyDpadCenterTV);
	homebridge.registerAccessory("homebridge-sonypicofftv", "homebridge-sonypicofftv", SonyPicOffTV);
	homebridge.registerAccessory("homebridge-sonynetflixtv", "homebridge-sonynetflixtv", SonyNetflixTV);
	homebridge.registerAccessory("homebridge-sonyclosedcaptiontv", "homebridge-sonyclosedcaptiontv", SonyClosedCaptionTV);
	homebridge.registerAccessory("homebridge-sonysubtitletv", "homebridge-sonysubtitletv", SonySubTitleTV);
	homebridge.registerAccessory("homebridge-sonygguidetv", "homebridge-sonygguidetv", SonyGGuideTV);
	homebridge.registerAccessory("homebridge-sonychanneluptv", "homebridge-sonychanneluptv", SonyChannelUpTV);
	homebridge.registerAccessory("homebridge-sonychanneldowntv", "homebridge-sonychanneldowntv", SonyChannelDownTV);	
	homebridge.registerAccessory("homebridge-sonystoptv", "homebridge-sonystoptv", SonyStopTV);	
	homebridge.registerAccessory("homebridge-sonypausetv", "homebridge-sonypausetv", SonyPauseTV);	
	homebridge.registerAccessory("homebridge-sonyplaytv", "homebridge-sonyplaytv", SonyPlayTV);		
	homebridge.registerAccessory("homebridge-sonysystemofftv", "homebridge-sonysystemofftv", SonySystemOffTV);	//off only
	homebridge.registerAccessory("homebridge-sonysystemontv", "homebridge-sonysystemontv", SonySystemOnTV);	//on only
//	homebridge.registerAccessory("homebridge-sonywoltv", "homebridge-sonywoltv", SonyWOLTV); //on only
	homebridge.registerAccessory("homebridge-sonypowertoggletv", "homebridge-sonypowertoggletv", SonyPowerToggleTV); //toggle off and on
	homebridge.registerAccessory("homebridge-sonypowerofftv", "homebridge-sonypowerofftv", SonyPowerOffTV); // off only
	homebridge.registerAccessory("homebridge-sonywakeuptv", "homebridge-sonywakeuptv", SonyWakeUpTV); // on only (wake)
	homebridge.registerAccessory("homebridge-sonychanneltunetv", "homebridge-sonychanneltunetv", SonyChannelTuneTV);
	homebridge.registerAccessory("homebridge-sonychannelstv", "homebridge-sonychannelstv", SonyChannelsTV);	
	homebridge.registerAccessory("homebridge-sonyjumptv", "homebridge-sonyjumptv", SonyJumpTV);	
	homebridge.registerAccessory("homebridge-sonyallpowerontv", "homebridge-sonyallpowerontv", SonyAllPowerOnTV);	
	homebridge.registerAccessory("homebridge-sonysetvolumetv", "homebridge-sonysetvolumetv", SonySetVolumeTV);	
}


//------------------------------------------------------------------------------------------------
// Send the TV Mute command
//------------------------------------------------------------------------------------------------
SonyMuteTV.prototype.getServices = function() { return [this.service]; }
function SonyMuteTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyMuteTV.prototype.setOn = function(value, callback) {  
        var postData = startXML + Mute + endXML;  
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);	
}
SonyMuteTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyMuteTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
// Send the TV UnMute command
//------------------------------------------------------------------------------------------------
SonyUnMuteTV.prototype.getServices = function() { return [this.service]; }
function SonyUnMuteTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyUnMuteTV.prototype.setOn = function(value, callback) {  
        var postData = startXML + VolumeDown + endXML;  
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                //callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		postData = startXML + VolumeUp + endXML;  
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));		
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);	
}
SonyUnMuteTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyUnMuteTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------








//------------------------------------------------------------------------------------------------
// Send the TV Right Arrow command multiple times
//------------------------------------------------------------------------------------------------
SonyPageRightTV.prototype.getServices = function() { return [this.service]; }
function SonyPageRightTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.pagecount = config["pagecount"];
	this.delay = config["delay"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPageRightTV.prototype.setOn = function(value, callback) {   
		var pagecounter = parseInt(this.pagecount);
		var delay = parseInt(this.delay);
		for (i = 0; i < pagecounter; i++) { 
			senddelay = (i*delay);
			//this.log("timer up:" + i+ " delay:"+senddelay);
			this.timer = setTimeout(function() {
				this.runTimerPageRight();
			}.bind(this), senddelay);	
		}		
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageRightTV.prototype.runTimerPageRight = function() {
		var request = require("request");
		var postData = startXML + Right + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Page Down");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPageRightTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPageRightTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV Right Arrow command multiple times
//------------------------------------------------------------------------------------------------
SonyPageLeftTV.prototype.getServices = function() { return [this.service]; }
function SonyPageLeftTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.pagecount = config["pagecount"];
	this.delay = config["delay"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPageLeftTV.prototype.setOn = function(value, callback) {   
		var pagecounter = parseInt(this.pagecount);
		var delay = parseInt(this.delay);
		for (i = 0; i < pagecounter; i++) { 
			senddelay = (i*delay);
			//this.log("timer up:" + i+ " delay:"+senddelay);
			this.timer = setTimeout(function() {
				this.runTimerPageLeft();
			}.bind(this), senddelay);	
		}		
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageLeftTV.prototype.runTimerPageLeft = function() {
		var request = require("request");
		var postData = startXML + Left + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Page Down");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPageLeftTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPageLeftTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Down Arrow command multiple times
//------------------------------------------------------------------------------------------------
SonyPageDownTV.prototype.getServices = function() { return [this.service]; }
function SonyPageDownTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.pagecount = config["pagecount"];
	this.delay = config["delay"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPageDownTV.prototype.setOn = function(value, callback) {   
		var pagecounter = parseInt(this.pagecount);
		var delay = parseInt(this.delay);
		for (i = 0; i < pagecounter; i++) { 
			senddelay = (i*delay);
			//this.log("timer up:" + i+ " delay:"+senddelay);
			this.timer = setTimeout(function() {
				this.runTimerPageDown();
			}.bind(this), senddelay);	
		}		
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageDownTV.prototype.runTimerPageDown = function() {
		var request = require("request");
		var postData = startXML + Down + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Page Down");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPageDownTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPageDownTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Up Arrow command multiple times
//------------------------------------------------------------------------------------------------
SonyPageUpTV.prototype.getServices = function() { return [this.service]; }
function SonyPageUpTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.pagecount = config["pagecount"];
	this.delay = config["delay"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPageUpTV.prototype.setOn = function(value, callback) {   
		var pagecounter = parseInt(this.pagecount);
		var delay = parseInt(this.delay);
		for (i = 0; i < pagecounter; i++) { 
			senddelay = (i*delay);
			//this.log("timer up:" + i+ " delay:"+senddelay);
			this.timer = setTimeout(function() {
				this.runTimerPageUp();
			}.bind(this), senddelay);	
		}		
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageUpTV.prototype.runTimerPageUp = function() {
		var request = require("request");
		var postData = startXML + Up + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Page Up");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPageUpTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPageUpTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
// Send the TV Volume Up command multiple times
//------------------------------------------------------------------------------------------------
SonyVolumeUpTV.prototype.getServices = function() { return [this.service]; }
function SonyVolumeUpTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.volumecount = config["volumecount"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyVolumeUpTV.prototype.setOn = function(value, callback) {   
		var postData = startXML + VolumeUp + endXML;  
		var volumecounter = parseInt(this.volumecount);
		for (i = 0; i < volumecounter-1; i++) { 
			request.post({
				url: protocol + this.ipaddress + IRCCURL,
				headers: {
					'X-Auth-PSK': this.psk,
					'SOAPAction': SOAPActionVal,
					'Content-type': ContentTypeVal
				},
				form: postData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					//callback();// success don't callback until last command
				} else {
					this.log(logError, err, body);
					callback(err || new Error(stateError));
				}
			}.bind(this));
			request = require("request");
		}		
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));		
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
}
SonyVolumeUpTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyVolumeUpTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Volume Down command multiple times
//------------------------------------------------------------------------------------------------
SonyVolumeDownTV.prototype.getServices = function() { return [this.service]; }
function SonyVolumeDownTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.volumecount = config["volumecount"];	
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyVolumeDownTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + VolumeDown + endXML; 
		var volumecounter = parseInt(this.volumecount);
		var delay = 10;
		var senddelay=0;
		this.timer = setTimeout(function() { this.runTimerVolumeUp();}.bind(this), 1);  //knock mute off
		
		for (i = 1; i < volumecounter+1; i++) { 
			senddelay = (i*delay);
			//this.log("timer down:" + i+ " delay:"+senddelay);
			this.timer = setTimeout(function() {
				this.runTimerVolumeDown();
			}.bind(this), senddelay);	
		}
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);	
		callback();
}
SonyVolumeDownTV.prototype.runTimerVolumeDown = function() {
		request = require("request");
		postData = startXML + VolumeDown + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success Down");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonyVolumeDownTV.prototype.runTimerVolumeUp = function() {
		request = require("request");
		postData = startXML + VolumeUp + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success Up");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 10000);		
}
SonyVolumeDownTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyVolumeDownTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Set the TV Volume to a defined level
//------------------------------------------------------------------------------------------------
SonySetVolumeTV.prototype.getServices = function() { return [this.service]; }
function SonySetVolumeTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.volumelevel = config["volumelevel"];
	this.delay =  config["delay"];
	this.timer;
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonySetVolumeTV.prototype.setOn = function(value, callback) {   
		var postData = startXML + VolumeDown + endXML;  
		var volume = parseInt(this.volumelevel);
		var senddelay = 0;
		var delay = parseInt(this.delay);  // delay of 07 is the fastest I could get to reliably work
		var downloop = 120;
		//this.log("delay:"+delay);
		//this.log("volume:" + volume);
		//this.log("volumelevel:" + this.volumelevel);
		this.timer = setTimeout(function() { this.runTimerVolumeUp();}.bind(this), 1);  //knock mute off
		
		for (i = 1; i <= downloop; i++) { 
			senddelay = (i*delay);
			//this.log("timer down:" + i+ " delay:"+senddelay);
			this.timer = setTimeout(function() {
				this.runTimerVolumeDown();
			}.bind(this), senddelay);	
		}		
		//now turn volume up to the desired level
		//Timed function needed here because of 100 POST per second limit!!!
		for (i = 1; i <= volume; i++) { 
			senddelay = (i*delay)+(downloop*delay);
			//this.log("timer up:" + i+ " delay:"+senddelay);
			this.timer = setTimeout(function() {
				this.runTimerVolumeUp();
			}.bind(this), senddelay);	
		}
		callback();
}
SonySetVolumeTV.prototype.runTimerVolumeDown = function() {
		request = require("request");
		postData = startXML + VolumeDown + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success Down");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonySetVolumeTV.prototype.runTimerVolumeUp = function() {
		request = require("request");
		postData = startXML + VolumeUp + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success Up");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 10000);		
}
SonySetVolumeTV.prototype.runTimerVolumeUpLast = function() {
		request = require("request");
		postData = startXML + VolumeUp + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				this.log("Success Up Last");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonySetVolumeTV.prototype.getOn = function(callback) { callback(null, false);  }
SonySetVolumeTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------







//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with WOL
2. Turn the TV on with Wake
3. Turn the TV on with System
4. Change input to HDMI1
*/
//------------------------------------------------------------------------------------------------
SonyHDMI1TV.prototype.getServices = function() { return [this.service]; }
function SonyHDMI1TV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.macaddress = config["macaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyHDMI1TV.prototype.setOn = function(value, callback) {    
		// Wake On Lan
//		wol.wake(this.macaddress, function(error) {
//			if (error) {
//				// handle error
//				this.log("Error '%s' setting TV power state using WOL.", error);
//				callback(error);
//			} else {
//				// done sending packets
//				//this.updateTimer();
//				//this.log("WOL Apparent Success");
//				//callback();
//			}
//		}.bind(this));		

		// Wake up the TV
		var postData = startXML + WakeUp + endXML; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("Wake Up apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
 
		// system on
		postData = startJSON + SystemOn + endJSON; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + systemURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("System On apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
		
		//HDMI1
		postData = startXML + Hdmi1 + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyHDMI1TV.prototype.getOn = function(callback) { callback(null, false);  }
SonyHDMI1TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with WOL
2. Turn the TV on with Wake
3. Turn the TV on with System
4. Change input to HDMI2
*/
//------------------------------------------------------------------------------------------------
SonyHDMI2TV.prototype.getServices = function() { return [this.service]; }
function SonyHDMI2TV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.macaddress = config["macaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyHDMI2TV.prototype.setOn = function(value, callback) {    
		// Wake On Lan
//		wol.wake(this.macaddress, function(error) {
//			if (error) {
//				// handle error
//				this.log("Error '%s' setting TV power state using WOL.", error);
//				callback(error);
//			} else {
//				// done sending packets
//				//this.updateTimer();
//				//this.log("WOL Apparent Success");
//				//callback();
//			}
//		}.bind(this));		

		// Wake up the TV
		var postData = startXML + WakeUp + endXML; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("Wake Up apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
 
		// system on
		postData = startJSON + SystemOn + endJSON; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + systemURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("System On apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));

		postData = startXML + Hdmi2 + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyHDMI2TV.prototype.getOn = function(callback) { callback(null, false);  }
SonyHDMI2TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with WOL
2. Turn the TV on with Wake
3. Turn the TV on with System
4. Change input to HDMI3
*/
//------------------------------------------------------------------------------------------------
SonyHDMI3TV.prototype.getServices = function() { return [this.service]; }
function SonyHDMI3TV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.macaddress = config["macaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyHDMI3TV.prototype.setOn = function(value, callback) {    
		// Wake On Lan
//		wol.wake(this.macaddress, function(error) {
//			if (error) {
//				// handle error
//				this.log("Error '%s' setting TV power state using WOL.", error);
//				callback(error);
//			} else {
//				// done sending packets
//				//this.updateTimer();
//				//this.log("WOL Apparent Success");
//				//callback();
//			}
//		}.bind(this));		

		// Wake up the TV
		var postData = startXML + WakeUp + endXML; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("Wake Up apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
 
		// system on
		postData = startJSON + SystemOn + endJSON; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + systemURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("System On apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
		
		postData = startXML + Hdmi3 + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyHDMI3TV.prototype.getOn = function(callback) { callback(null, false);  }
SonyHDMI3TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with WOL
2. Turn the TV on with Wake
3. Turn the TV on with System
4. Change input to HDMI4
*/
//------------------------------------------------------------------------------------------------
SonyHDMI4TV.prototype.getServices = function() { return [this.service]; }
function SonyHDMI4TV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.macaddress = config["macaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyHDMI4TV.prototype.setOn = function(value, callback) {    
		// Wake On Lan
//		wol.wake(this.macaddress, function(error) {
//			if (error) {
//				// handle error
//				this.log("Error '%s' setting TV power state using WOL.", error);
//				callback(error);
//			} else {
//				// done sending packets
//				//this.updateTimer();
//				//this.log("WOL Apparent Success");
//				//callback();
//			}
//		}.bind(this));		

		// Wake up the TV
		var postData = startXML + WakeUp + endXML; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("Wake Up apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
 
		// system on
		postData = startJSON + SystemOn + endJSON; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + systemURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("System On apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
		
		postData = startXML + Hdmi4 + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyHDMI4TV.prototype.getOn = function(callback) { callback(null, false);  }
SonyHDMI4TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV Input command
//------------------------------------------------------------------------------------------------
SonyInputTV.prototype.getServices = function() { return [this.service]; }
function SonyInputTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyInputTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + Input + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyInputTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyInputTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------






//------------------------------------------------------------------------------------------------
// Send the TV Left command
//------------------------------------------------------------------------------------------------
SonyLeftTV.prototype.getServices = function() { return [this.service]; }
function SonyLeftTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyLeftTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + CursorLeft + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyLeftTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyLeftTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------






//------------------------------------------------------------------------------------------------
// Send the TV Right command
//------------------------------------------------------------------------------------------------
SonyRightTV.prototype.getServices = function() { return [this.service]; }
function SonyRightTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyRightTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + CursorRight + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyRightTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyRightTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------






//------------------------------------------------------------------------------------------------
// Send the TV Down command multiple times (this is grumpy, TV ignores some of them even if they're delayed)
//------------------------------------------------------------------------------------------------
SonyDownTV.prototype.getServices = function() { return [this.service]; }
function SonyDownTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.downcount = config["downcount"];	
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyDownTV.prototype.setOn = function(value, callback) {    
		var downcounter = parseInt(this.downcount);
		for (i = 1; i < downcounter+1; i++) { 
			this.timer = setTimeout(function() {
				this.runTimerDownButton();
			}.bind(this), i*250);	
		}		
		request = require("request");
		postData = startXML + CursorDown + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				callback(); // success
				//this.log("Final Down button");
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));	//*/		
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);	//*/		
}
SonyDownTV.prototype.runTimerDownButton = function() {
		request = require("request");
		postData = startXML + CursorDown + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Down button");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/		
}
SonyDownTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyDownTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV Up command multiple times (this is grumpy, TV ignores some of them even if they're delayed)
//------------------------------------------------------------------------------------------------
SonyUpTV.prototype.getServices = function() { return [this.service]; }
function SonyUpTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.upcount = config["upcount"];	
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyUpTV.prototype.setOn = function(value, callback) {    
		var upcounter = parseInt(this.upcount);
		for (i = 1; i < upcounter; i++) { 
			this.timer = setTimeout(function() {
				this.runTimerUpButton();
			}.bind(this), i*250);	
		}	
		request = require("request");
		postData = startXML + CursorUp + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				callback(); // success
				//this.log("Final Up button");
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));	//*/	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);	//*/			
}
SonyUpTV.prototype.runTimerUpButton = function() {
		request = require("request");
		postData = startXML + CursorUp + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Up button");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/	
}
SonyUpTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyUpTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV DpadCenter command
//------------------------------------------------------------------------------------------------
SonyDpadCenterTV.prototype.getServices = function() { return [this.service]; }
function SonyDpadCenterTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyDpadCenterTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + DpadCenter + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyDpadCenterTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyDpadCenterTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
/*
1. Send the TV Stop command
2. Send the TV Pause command
3. Send the TV PowerOff command
*/
//------------------------------------------------------------------------------------------------
SonyPowerOffTV.prototype.getServices = function() { return [this.service]; }
function SonyPowerOffTV(log, config) { //Turns TV Off only
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPowerOffTV.prototype.setOn = function(value, callback) {    
		// Stop
		var postData = startXML + Stop + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                //callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));

		// Pause
		postData = startXML + Pause + endXML; 
		request = require("request");		
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                //callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));

		// powerOff
		postData = startXML + PowerOff + endXML; 
		request = require("request");
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                //callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		
		// Sytem Off
		postData = startJSON + SystemOff + endJSON; 
		request = require("request");
        request.post({
            url: protocol + this.ipaddress + systemURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				//this.log("System On apparent success");
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPowerOffTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPowerOffTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV Wake Up command
//------------------------------------------------------------------------------------------------
SonyWakeUpTV.prototype.getServices = function() { return [this.service]; }
function SonyWakeUpTV(log, config) {  //only turns on (wake)
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyWakeUpTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + WakeUp + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyWakeUpTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyWakeUpTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Picture toggle command
//------------------------------------------------------------------------------------------------
SonyPicOffTV.prototype.getServices = function() { return [this.service]; }
function SonyPicOffTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPicOffTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + PicOff + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPicOffTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPicOffTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with WOL
2. Turn the TV on with Wake
3. Turn the TV on with System
4. Change input to Netflix
*/
//------------------------------------------------------------------------------------------------
SonyNetflixTV.prototype.getServices = function() { return [this.service]; }
function SonyNetflixTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.macaddress = config["macaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyNetflixTV.prototype.setOn = function(value, callback) {    
		// Wake On Lan
//		wol.wake(this.macaddress, function(error) {
//			if (error) {
//				// handle error
//				this.log("Error '%s' setting TV power state using WOL.", error);
//				callback(error);
//			} else {
//				// done sending packets
//				//this.updateTimer();
//				//this.log("WOL Apparent Success");
//				//callback();
//			}
//		}.bind(this));		

		// Wake up the TV
		var postData = startXML + WakeUp + endXML; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("Wake Up apparent success");
				//callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
 
		// system on
		postData = startJSON + SystemOn + endJSON; 
		request = require("request");
		request.post({
			url: protocol + this.ipaddress + systemURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//this.log("System On apparent success");
				callback(); // success
			} else {
				this.log(logError, err, body);
				callback(err || new Error(stateError));
			}
		}.bind(this));
		
		//Netflix
		this.timer = setTimeout(function() {
			this.runTimerNetflix();
		}.bind(this), 3000);		
}
SonyNetflixTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyNetflixTV.prototype.runTimerNetflix = function ()
{
		postData = startXML + Netflix + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				//this.log("Dude Netflix");
                //callback(); // success
            } else {
                this.log(logError, err, body);
                //callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);			
}
SonyNetflixTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
// Send the TV Closed Caption command
//------------------------------------------------------------------------------------------------
SonyClosedCaptionTV.prototype.getServices = function() { return [this.service]; }
function SonyClosedCaptionTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyClosedCaptionTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + ClosedCaption + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyClosedCaptionTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyClosedCaptionTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Subtitle command
//------------------------------------------------------------------------------------------------
SonySubTitleTV.prototype.getServices = function() { return [this.service]; }
function SonySubTitleTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonySubTitleTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + SubTitle + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonySubTitleTV.prototype.getOn = function(callback) { callback(null, false);  }
SonySubTitleTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV GGuide command
//------------------------------------------------------------------------------------------------
SonyGGuideTV.prototype.getServices = function() { return [this.service]; }
function SonyGGuideTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyGGuideTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + GGuide + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyGGuideTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyGGuideTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Channel Up command
//------------------------------------------------------------------------------------------------
SonyChannelUpTV.prototype.getServices = function() { return [this.service]; }
function SonyChannelUpTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyChannelUpTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + ChannelUp + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyChannelUpTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyChannelUpTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Channel Down command
//------------------------------------------------------------------------------------------------
SonyChannelDownTV.prototype.getServices = function() { return [this.service]; }
function SonyChannelDownTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyChannelDownTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + ChannelDown + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyChannelDownTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyChannelDownTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Wake On LAN command
//------------------------------------------------------------------------------------------------
/*//SonyWOLTV.prototype.getServices = function() { return [this.service]; }
function SonyWOLTV(log, config) {  // only turns on
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.macaddress = config["macaddress"];
    this.service = new Service.Switch(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyWOLTV.prototype.setOn = function(value, callback) {  
        wol.wake(this.macaddress, function(error) {
            if (error) {
                // handle error
                this.log("Error '%s' setting TV power state using WOL.", error);
                callback(error);
            } else {
                // done sending packets
                //this.updateTimer();
                callback();
            }
        }.bind(this));
}//
SonyWOLTV.prototype.getOn = function(callback) {  
        var postData = PowerStatus;
        request.post({
            url: protocol + this.ipaddress + systemURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes("active")){
					//this.log("Active", "Active", response.body);
					callback(null, true);
				}
				else if (response.body.includes("standby")){
					//this.log("Standby", "Standby", response.body);
					callback(null, false);
				}
                else {
					this.log(response.statusCode.toString(), "[Off]", response.body);
					callback(null, false);
				}
            } else {
                //this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}//
//------------------------------------------------------------------------------------------------
*/





//------------------------------------------------------------------------------------------------
// Send the TV Stop command
//------------------------------------------------------------------------------------------------
SonyStopTV.prototype.getServices = function() { return [this.service]; }
function SonyStopTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyStopTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + Stop + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyStopTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyStopTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV Pause command
//------------------------------------------------------------------------------------------------
SonyPauseTV.prototype.getServices = function() { return [this.service]; }
function SonyPauseTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPauseTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + Pause + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPauseTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPauseTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV Jump command
//------------------------------------------------------------------------------------------------
SonyJumpTV.prototype.getServices = function() { return [this.service]; }
function SonyJumpTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyJumpTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + Jump + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyJumpTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyJumpTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------






//------------------------------------------------------------------------------------------------
// Send the TV Play command
//------------------------------------------------------------------------------------------------
SonyPlayTV.prototype.getServices = function() { return [this.service]; }
function SonyPlayTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyPlayTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + Play + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyPlayTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyPlayTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------






//------------------------------------------------------------------------------------------------
// Send the TV SystemOff command
//------------------------------------------------------------------------------------------------
SonySystemOffTV.prototype.getServices = function() { return [this.service]; }
function SonySystemOffTV(log, config) { // only turns off
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonySystemOffTV.prototype.setOn = function(value, callback) {    //Only turns off
		var postData = startJSON + SystemOff + endJSON; 
        request.post({
            url: protocol + this.ipaddress + systemURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonySystemOffTV.prototype.getOn = function(callback) { callback(null, false);  }
SonySystemOffTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV SystemOn command
//------------------------------------------------------------------------------------------------
SonySystemOnTV.prototype.getServices = function() { return [this.service]; }
function SonySystemOnTV(log, config) {  // only turns on
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
}
SonySystemOnTV.prototype.setOn = function(value, callback) {    //Only turns on
		var postData = startJSON + SystemOn + endJSON; 
        request.post({
            url: protocol + this.ipaddress + systemURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
/*
This is multiple commsnds in a timed sequence.
1. Wake on Lan (turn TV on)
2. Wake Up Tv via IRCC (turn TV on)
3. Power on via system URL (turn TV on)
*/
//------------------------------------------------------------------------------------------------
SonyAllPowerOnTV.prototype.getServices = function() { return [this.service]; }
function SonyAllPowerOnTV(log, config) {  // only turns on
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
	this.macaddress = config["macaddress"];
    this.ipaddress = config["ipaddress"];
	if (config["polling"]=="true"){ this.polling = true; }
	else { this.polling = false; }
	this.interval = parseInt(config["interval"], 10) | 1;
	this.timer;
	this.isOn;
    this.service = new Service.Switch(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
	//this.log("updateTimer constructor");
	this.updateTimer();
}
SonyAllPowerOnTV.prototype.setOn = function(value, callback) {    //Tune to specified channel
		//this.log("SonyAllPowerOnTV");
		var postData = startXML + TvPower + endXML; 
		if (!this.isOn)
		{
			// Power toggle the TV
			//this.log("Power toggle on")
			request = require("request");
			request.post({
				url: protocol + this.ipaddress + IRCCURL,
				headers: {
					'X-Auth-PSK': this.psk,
					'SOAPAction': SOAPActionVal,
					'Content-type': ContentTypeVal
				},
				form: postData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					//this.log("Wake Up apparent success");
					//callback(); // success
				} else {
					this.log(logError, err, body);
					callback(err || new Error(stateError));
				}
			}.bind(this));			
			
//			// Wake On Lan
//			wol.wake(this.macaddress, function(error) {
//				if (error) {
//					// handle error
//					this.log("Error '%s' setting TV power state using WOL.", error);
//					callback(error);
//				} else {
//					// done sending packets
//					//this.updateTimer();
//					//this.log("WOL Apparent Success");
//					//callback();
//				}
//			}.bind(this));		

			// Wake up the TV
			var postData = startXML + WakeUp + endXML; 
			request = require("request");
			request.post({
				url: protocol + this.ipaddress + IRCCURL,
				headers: {
					'X-Auth-PSK': this.psk,
					'SOAPAction': SOAPActionVal,
					'Content-type': ContentTypeVal
				},
				form: postData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					//this.log("Wake Up apparent success");
					//callback(); // success
				} else {
					this.log(logError, err, body);
					callback(err || new Error(stateError));
				}
			}.bind(this));
	 
			// system on
			postData = startJSON + SystemOn + endJSON; 
			request = require("request");
			request.post({
				url: protocol + this.ipaddress + systemURL,
				headers: {
					'X-Auth-PSK': this.psk,
					'SOAPAction': SOAPActionVal,
					'Content-type': ContentTypeVal
				},
				form: postData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					//this.log("System On apparent success");
					callback(); // success
				} else {
					this.log(logError, err, body);
					callback(err || new Error(stateError));
				}
			}.bind(this));
		}
		else
		{
			// Should Power toggle the TV to off
			//this.log("Power toggle off")
			request = require("request");
			request.post({
				url: protocol + this.ipaddress + IRCCURL,
				headers: {
					'X-Auth-PSK': this.psk,
					'SOAPAction': SOAPActionVal,
					'Content-type': ContentTypeVal
				},
				form: postData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					//this.log("Power toggle apparent success");
					//callback(); // success
				} else {
					this.log(logError, err, body);
					callback(err || new Error(stateError));
				}
			}.bind(this));	
			
			// powerOff
			postData = startXML + PowerOff + endXML; 
			request = require("request");
			request.post({
				url: protocol + this.ipaddress + IRCCURL,
				headers: {
					'X-Auth-PSK': this.psk,
					'SOAPAction': SOAPActionVal,
					'Content-type': ContentTypeVal
				},
				form: postData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					//callback(); // success
				} else {
					this.log(logError, err, body);
					callback(err || new Error(stateError));
				}
			}.bind(this));
			
			// Sytem Off
			postData = startJSON + SystemOff + endJSON; 
			request = require("request");
			request.post({
				url: protocol + this.ipaddress + systemURL,
				headers: {
					'X-Auth-PSK': this.psk,
					'SOAPAction': SOAPActionVal,
					'Content-type': ContentTypeVal
				},
				form: postData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					//this.log("System On apparent success");
					callback(); // success
				} else {
					this.log(logError, err, body);
					callback(err || new Error(stateError));
				}
			}.bind(this));				
		}
}
SonyAllPowerOnTV.prototype.getOn = function(callback) {
    //this.log("Getting whether Sony TV is on...",this.polling);
    if (this.polling) {
        callback(null, this.isOn);
    } else {
        this.getState(function(err, isOn) {
              if (err == null) this.log("State is: %s", isOn ? "on" : "off");
              callback(err, isOn);
        }.bind(this));
    }
}
SonyAllPowerOnTV.prototype.getState = function(callback) {  
        var postData = PowerStatus;
        request.post({
            url: protocol + this.ipaddress + systemURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes("active")){
					//this.log("Active", "Active", response.body);
					callback(null, true);
				}
				else if (response.body.includes("standby")){
					//this.log("Standby", "Standby", response.body);
					callback(null, false);
				}
                else {
					this.log(response.statusCode.toString(), "[Off]", response.body);
					callback(null, false);
				}
            } else {
                //this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyAllPowerOnTV.prototype.runTimer = function() {
    this.getState(function(err, isOn) {
        if (err == null && isOn != this.isOn) {
            this.log("State changed: %s", isOn ? "on" : "off");
            this.service.getCharacteristic(Characteristic.On).updateValue(isOn);
            this.isOn = isOn;
        }
    }.bind(this));
}
SonyAllPowerOnTV.prototype.updateTimer = function() {
	//this.log("polling value is ", this.polling);
    if (this.polling) {
		//this.log("interval value is ", this.interval);
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            this.runTimer();
            this.updateTimer();
        }.bind(this), this.interval * 1000);
    }
}//*/
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
/*
This is multiple commsnds in a timed sequence.
1. Wake on Lan (turn TV on)
2. Wake Up Tv via IRCC (turn TV on)
3. Power on via system URL (turn TV on)
4. Send the channels command to change input to Tv
5. After a timed delay, enter the channel information
6. send dpadcenter to tune the TV
*/
SonyChannelTuneTV.prototype.getServices = function() { return [this.service]; }
function SonyChannelTuneTV(log, config) {  // only turns on
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.timer;
	this.channel = config["channel"];
	this.macaddress = config["macaddress"];
    this.service = new Service.Switch(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
	//this.updateTimer();
}
SonyChannelTuneTV.prototype.setOn = function(value, callback) {    //Tune to specified channel
		// Wake On Lan
//        wol.wake(this.macaddress, function(error) {
//            if (error) {
//                // handle error
//                this.log("Error '%s' setting TV power state using WOL.", error);
//                callback(error);
//           } else {
//                // done sending packets
//                //this.updateTimer();
//                //callback();
//            }
//        }.bind(this));		

		// Wake up the TV
		var postData = startXML + WakeUp + endXML; 
		var delay = 50;
		request = require("request");
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                //callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
 
		// system on
		postData = startJSON + SystemOn + endJSON; 
		request = require("request");
        request.post({
            url: protocol + this.ipaddress + systemURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                //callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));

		postData = startXML + Channels + endXML; 
		senddelay = 0;
		request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                //callback(); // success so keep going
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));   //
		//this.log("First",this.channel,"");
		this.log("Channel:"+this.channel);
		for (var i = 0, len = this.channel.length; i < len; i++) {
			//clearTimeout(this.timer);	
			
			var senddelay = (i*delay)+1000;
			var dpaddelay = (this.channel.length*delay)+1000;
			switch(this.channel[i]){
				case "0":
					this.timer = setTimeout(function() {
						this.runTimer0();
					}.bind(this), senddelay);	
				break;
				case "1":
					this.timer = setTimeout(function() {
						this.runTimer1();
					}.bind(this), senddelay);		
				break;
				case "2":
					this.timer = setTimeout(function() {
						this.runTimer2();	
					}.bind(this), senddelay);							
				break;
				case "3":
					this.timer = setTimeout(function() {
						this.runTimer3();
					}.bind(this), senddelay);						
				break;
				case "4":
					this.timer = setTimeout(function() {
						this.runTimer4();
					}.bind(this), senddelay);						
				break;
				case "5":
					this.timer = setTimeout(function() {
						this.runTimer5();
					}.bind(this), senddelay);						
				break;
				case "6":
					this.timer = setTimeout(function() {
						this.runTimer6();
					}.bind(this), senddelay);						
				break;
				case "7":
					this.timer = setTimeout(function() {
						this.runTimer7();
					}.bind(this), senddelay);							
				break;
				case "8":
					this.timer = setTimeout(function() {
						this.runTimer8();
					}.bind(this), senddelay);						
				break;
				case "9":
					this.timer = setTimeout(function() {
						this.runTimer9();
					}.bind(this), senddelay);						
				break;		
				case ".":
					this.timer = setTimeout(function() {
						this.runTimerDot();
					}.bind(this), senddelay);						
				break;		
				default:
					this.log("Well that ain't right. I'm ignoring this portion:","'"+this.channel[i]+"' of ",this.channel);
			}
		}
		this.timer = setTimeout(function() {
			this.runTimerDpadCenter();
		}.bind(this), dpaddelay);	
		callback(); // success
}
SonyChannelTuneTV.prototype.runTimer0 = function() {
		//this.log("send 0");
		request = require("request");
		postData = startXML + Num0 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer1 = function() {
		//this.log("send 1");
		request = require("request");
		postData = startXML + Num1 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer2 = function() {
		//this.log("send 2");
		request = require("request");
		postData = startXML + Num2 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer3 = function() {
		//this.log("send 3");
		request = require("request");
		postData = startXML + Num3 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer4 = function() {
		//this.log("send 4");
		request = require("request");
		postData = startXML + Num4 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer5 = function() {
		//this.log("send 5");
		request = require("request");
		postData = startXML + Num5 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer6 = function() {
		//this.log("send 6");
		request = require("request");
		postData = startXML + Num6 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer7 = function() {
		//this.log("send 7");
		request = require("request");
		postData = startXML + Num7 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer8 = function() {
		//this.log("send 8");
		request = require("request");
		postData = startXML + Num8 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimer9 = function() {
		//this.log("send 9");
		request = require("request");
		postData = startXML + Num9 + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimerDot = function() {
		//this.log("send .");
		request = require("request");
		postData = startXML + DOT + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//
}
SonyChannelTuneTV.prototype.runTimerDpadCenter = function() {
		//this.log("send dpadcenter");
		request = require("request");
		postData = startXML + DpadCenter + endXML; 
		request.post({
			url: protocol + this.ipaddress + IRCCURL,
			headers: {
				'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
			},
			form: postData
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				//callback(); // success
				//this.log("Success");
			} else {
				this.log(logError, err, body);
				//callback(err || new Error(stateError));
			}
		}.bind(this));	//*/
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Channels command
//------------------------------------------------------------------------------------------------
SonyChannelsTV.prototype.getServices = function() { return [this.service]; }
function SonyChannelsTV(log, config) {  
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}
SonyChannelsTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + Tv + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
}
SonyChannelsTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyChannelsTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV PowerToggle command
//------------------------------------------------------------------------------------------------
SonyPowerToggleTV.prototype.getServices = function() { return [this.service]; } //toggle off and on
function SonyPowerToggleTV(log, config) { //Toggles TV off and on
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	if (config["polling"]=="true"){ this.polling = true; }
	else { this.polling = false; }
	this.interval = parseInt(config["interval"], 10) | 1;
	this.timer;
	this.isOn;
    this.service = new Service.Switch(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
	this.log("updateTimer constructor");
	this.updateTimer();
}
SonyPowerToggleTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + TvPower + endXML; 
        request.post({
            url: protocol + this.ipaddress + IRCCURL,
            headers: {
                'X-Auth-PSK': this.psk,
				'SOAPAction': SOAPActionVal,
				'Content-type': ContentTypeVal
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                callback(); // success
            } else {
                this.log(logError, err, body);
                callback(err || new Error(stateError));
            }
        }.bind(this));
}
SonyPowerToggleTV.prototype.getOn = function(callback) {
    //this.log("Getting whether Sony TV is on...",this.polling);
    if (this.polling) {
        callback(null, this.isOn);
    } else {
        this.getState(function(err, isOn) {
              if (err == null) this.log("State is: %s", isOn ? "on" : "off");
              callback(err, isOn);
        }.bind(this));
    }
}
SonyPowerToggleTV.prototype.getState = function(callback) {  
        var postData = PowerStatus;
        request.post({
            url: protocol + this.ipaddress + systemURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes("active")){
					//this.log("Active", "Active", response.body);
					callback(null, true);
				}
				else if (response.body.includes("standby")){
					//this.log("Standby", "Standby", response.body);
					callback(null, false);
				}
                else {
					this.log(response.statusCode.toString(), "[Off]", response.body);
					callback(null, false);
				}
            } else {
                //this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyPowerToggleTV.prototype.runTimer = function() {
    this.getState(function(err, isOn) {
        if (err == null && isOn != this.isOn) {
            this.log("State changed: %s", isOn ? "on" : "off");
            this.service.getCharacteristic(Characteristic.On).updateValue(isOn);
            this.isOn = isOn;
        }
    }.bind(this));
}
SonyPowerToggleTV.prototype.updateTimer = function() {
	//this.log("polling value is ", this.polling);
    if (this.polling) {
		//this.log("interval value is ", this.interval);
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            this.runTimer();
            this.updateTimer();
        }.bind(this), this.interval * 1000);
    }
}
//------------------------------------------------------------------------------------------------



