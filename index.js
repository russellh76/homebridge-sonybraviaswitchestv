//Node JS Homebridge add-on for controlling Sony Smart TV: homebridge-sonybraviaswitchestv
var request = require("request");
var inherits = require('util').inherits;
var Service, Characteristic
var stateError = "Error setting TV state.";
var logError = "Error '%s' setting TV state. Response: %s";

//messaging constants
var startXML = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1"><IRCCCode>';
var endXML = '</IRCCCode></u:X_SendIRCC></s:Body></s:Envelope>';
var startJSON = '{"method":"setPowerStatus","params":[{"status":'
var endJSON = '}],"id":1,"version":"1.0"}';
var startAudioJSON = '{"method":"setAudioVolume","id":98,"params":[{"volume": "'
var endAudioJSON = '","ui": "on","target": "speaker"}],"version": "1.2"}';
var systemURL = "/sony/system";
var AudioURL = "/sony/audio";
var IRCCURL = "/sony/IRCC";
var avContentURL = "/sony/avContent";
var AppleTvURL = "/login?pairing-guid=";
var protocol = "http://";
var SOAPActionVal = '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"';
var ContentTypeVal = "text/xml; charset=UTF-8";
var PowerStatus = '{"method":"getPowerStatus","params":[],"id":1,"version":"1.0"}';
var AudioStatus = '{"method":"getVolumeInformation","id":33,"params":[],"version": "1.0"}';
var InputStatus = '{"method":"getPlayingContentInfo","id":103,"params":[],"version": "1.0"}';

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
var Exit = "AAAAAQAAAAEAAABjAw==";
var Back = "AAAAAQAAAAEAAABjAw==";

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

//updates?  Do these work on my TV model? XBR-65X810c
var Teletext2 = "AAAAAQAAAAEAAAA\/Aw==";
var FeaturedApp = "AAAAAgAAAMQAAABEAw==";
var FeaturedAppVOD = "AAAAAgAAAMQAAABFAw==";
var GooglePlay = "AAAAAgAAAMQAAABGAw==";
var AndroidMenu = "AAAAAgAAAMQAAABPAw==";
var RecorderMenu = "AAAAAgAAAMQAAABIAw==";
var STBMenu = "AAAAAgAAAMQAAABJAw==";
var MuteOn = "AAAAAgAAAMQAAAAsAw==";
var MuteOff = "AAAAAgAAAMQAAAAtAw==";
var AudioOutput_AudioSystem = "AAAAAgAAAMQAAAAiAw==";
var AudioOutput_TVSpeaker = "AAAAAgAAAMQAAAAjAw==";
var AudioOutput_Toggle = "AAAAAgAAAMQAAAAkAw==";
var ApplicationLauncher = "AAAAAgAAAMQAAAAqAw==";
var YouTube = "AAAAAgAAAMQAAABHAw==";
var PartnerApp1 = "AAAAAgAACB8AAAAAAw==";
var PartnerApp2 = "AAAAAgAACB8AAAABAw==";
var PartnerApp3 = "AAAAAgAACB8AAAACAw==";
var PartnerApp4 = "AAAAAgAACB8AAAADAw==";
var PartnerApp5 = "AAAAAgAACB8AAAAEAw==";
var PartnerApp6 = "AAAAAgAACB8AAAAFAw==";
var PartnerApp7 = "AAAAAgAACB8AAAAGAw==";
var PartnerApp8 = "AAAAAgAACB8AAAAHAw==";
var PartnerApp9 = "AAAAAgAACB8AAAAIAw==";
var PartnerApp10 = "AAAAAgAACB8AAAAJAw==";
var PartnerApp11 = "AAAAAgAACB8AAAAKAw==";
var PartnerApp12 = "AAAAAgAACB8AAAALAw==";
var PartnerApp13 = "AAAAAgAACB8AAAAMAw==";
var PartnerApp14 = "AAAAAgAACB8AAAANAw==";
var PartnerApp15 = "AAAAAgAACB8AAAAOAw==";
var PartnerApp16 = "AAAAAgAACB8AAAAPAw==";
var PartnerApp17 = "AAAAAgAACB8AAAAQAw==";
var PartnerApp18 = "AAAAAgAACB8AAAARAw==";
var PartnerApp19 = "AAAAAgAACB8AAAASAw==";
var PartnerApp20 = "AAAAAgAACB8AAAATAw==";

//main
module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
	
	//Not Bravia, included for ease of use
    homebridge.registerAccessory("homebridge-appletv", "homebridge-appletv", AppleTV);	// no longer works
	
	//Audio
	homebridge.registerAccessory("homebridge-sonyvolumetv", "homebridge-sonyvolumetv", SonyVolumeTV);	
	homebridge.registerAccessory("homebridge-sonyvolumeplustv", "homebridge-sonyvolumeplustv", SonyVolumePlusTV);
	homebridge.registerAccessory("homebridge-sonyvolumeminustv", "homebridge-sonyvolumeminustv", SonyVolumeMinusTV);
    homebridge.registerAccessory("homebridge-sonymutetv", "homebridge-sonymutetv", SonyMuteTV);	
	homebridge.registerAccessory("homebridge-sonyunmutetv", "homebridge-sonyunmutetv", SonyUnMuteTV);	
	
	//Inputs
	homebridge.registerAccessory("homebridge-sonyhdmi1tv", "homebridge-sonyhdmi1tv", SonyHDMI1TV);
	homebridge.registerAccessory("homebridge-sonyhdmi2tv", "homebridge-sonyhdmi2tv", SonyHDMI2TV);
	homebridge.registerAccessory("homebridge-sonyhdmi3tv", "homebridge-sonyhdmi3tv", SonyHDMI3TV);
	homebridge.registerAccessory("homebridge-sonyhdmi4tv", "homebridge-sonyhdmi4tv", SonyHDMI4TV);
	homebridge.registerAccessory("homebridge-sonyvideo1tv", "homebridge-sonyvideo1tv", SonyVideo1TV);
	homebridge.registerAccessory("homebridge-sonyvideo2tv", "homebridge-sonyvideo2tv", SonyVideo2TV);
	homebridge.registerAccessory("homebridge-sonyinputtv", "homebridge-sonyinputtv", SonyInputTV);
	
	//Navigation
	homebridge.registerAccessory("homebridge-sonypagelefttv", "homebridge-sonypagelefttv", SonyPageLeftTV);
	homebridge.registerAccessory("homebridge-sonypagerighttv", "homebridge-sonypagerighttv", SonyPageRightTV);
	homebridge.registerAccessory("homebridge-sonypagedowntv", "homebridge-sonypagedowntv", SonyPageDownTV);
	homebridge.registerAccessory("homebridge-sonypageuptv", "homebridge-sonypageuptv", SonyPageUpTV);
	homebridge.registerAccessory("homebridge-sonypageleftplaytv", "homebridge-sonypageleftplaytv", SonyPageLeftPlayTV);
	homebridge.registerAccessory("homebridge-sonypagerightplaytv", "homebridge-sonypagerightplaytv", SonyPageRightPlayTV);
	homebridge.registerAccessory("homebridge-sonypagedownplaytv", "homebridge-sonypagedownplaytv", SonyPageDownPlayTV);
	homebridge.registerAccessory("homebridge-sonypageupplaytv", "homebridge-sonypageupplaytv", SonyPageUpPlayTV);	
	homebridge.registerAccessory("homebridge-sonypageleftoktv", "homebridge-sonypageleftoktv", SonyPageLeftOkTV);
	homebridge.registerAccessory("homebridge-sonypagerightoktv", "homebridge-sonypagerightoktv", SonyPageRightOkTV);
	homebridge.registerAccessory("homebridge-sonypagedownoktv", "homebridge-sonypagedownoktv", SonyPageDownOkTV);
	homebridge.registerAccessory("homebridge-sonypageupoktv", "homebridge-sonypageupoktv", SonyPageUpOkTV);		
	homebridge.registerAccessory("homebridge-sonydpadcentertv", "homebridge-sonydpadcentertv", SonyDpadCenterTV);
	homebridge.registerAccessory("homebridge-sonygguidetv", "homebridge-sonygguidetv", SonyGGuideTV);
	homebridge.registerAccessory("homebridge-sonychanneltunetv", "homebridge-sonychanneltunetv", SonyChannelTuneTV);
	homebridge.registerAccessory("homebridge-sonychannelstv", "homebridge-sonychannelstv", SonyChannelsTV);	
	homebridge.registerAccessory("homebridge-sonyjumptv", "homebridge-sonyjumptv", SonyJumpTV);	
	homebridge.registerAccessory("homebridge-sonychanneltv", "homebridge-sonychanneltv", SonyChannelTV);	

	//basic TV functionality
	homebridge.registerAccessory("homebridge-sonychanneluptv", "homebridge-sonychanneluptv", SonyChannelUpTV);
	homebridge.registerAccessory("homebridge-sonychanneldowntv", "homebridge-sonychanneldowntv", SonyChannelDownTV);
	homebridge.registerAccessory("homebridge-sonystoptv", "homebridge-sonystoptv", SonyStopTV);	
	homebridge.registerAccessory("homebridge-sonypausetv", "homebridge-sonypausetv", SonyPauseTV);	
	homebridge.registerAccessory("homebridge-sonyplaytv", "homebridge-sonyplaytv", SonyPlayTV);		
	homebridge.registerAccessory("homebridge-sonybacktv", "homebridge-sonybacktv", SonyBackTV);	
	
	//advanced functionality
	homebridge.registerAccessory("homebridge-sonypicofftv", "homebridge-sonypicofftv", SonyPicOffTV);
	homebridge.registerAccessory("homebridge-sonynetflixtv", "homebridge-sonynetflixtv", SonyNetflixTV);
	homebridge.registerAccessory("homebridge-sonyclosedcaptiontv", "homebridge-sonyclosedcaptiontv", SonyClosedCaptionTV);
	homebridge.registerAccessory("homebridge-sonysubtitletv", "homebridge-sonysubtitletv", SonySubTitleTV);

	// TV On and Off
	homebridge.registerAccessory("homebridge-sonypoweroffonlytv", "homebridge-sonypoweroffonlytv", SonyPowerOffOnlyTV);	//all of the off only 
	homebridge.registerAccessory("homebridge-sonypowerononlytv", "homebridge-sonypowerononlytv", SonyPowerOnOnlyTV);	//on only
	homebridge.registerAccessory("homebridge-sonypowertoggletv", "homebridge-sonypowertoggletv", SonyPowerToggleTV); //toggle off and on
	homebridge.registerAccessory("homebridge-sonywakeuptv", "homebridge-sonywakeuptv", SonyWakeUpTV); // on only (wake)
	homebridge.registerAccessory("homebridge-sonyallpowerontv", "homebridge-sonyallpowerontv", SonyAllPowerOnTV); //all of the on only methods
	
	//crash homebridge
	homebridge.registerAccessory("homebridge-crash", "homebridge-crash", CrashHomebridge);

}



//------------------------------------------------------------------------------------------------
// Send the Crash Homebridge command
//------------------------------------------------------------------------------------------------
CrashHomebridge.prototype.getServices = function() { return [this.service]; }
function CrashHomebridge(log, config) {
    this.log = log;
    this.name = config["name"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
}
CrashHomebridge.prototype.setOn = function(value, callback) {  
		this.log("Bye!");
        this.nonExistentFunction();
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);	
}
CrashHomebridge.prototype.runTimer = function() {
            this.log("I bet I never get here");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
// Send the Apple TV command
//------------------------------------------------------------------------------------------------
AppleTV.prototype.getServices = function() { return [this.service]; }
function AppleTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.ipaddress = config["ipaddress"];
	this.pairingguid = config["pairingguid"];
    this.port = config["port"];  //*/
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
}
AppleTV.prototype.setOn = function(value, callback) {  
        var postData = "Any old string should do";
		this.log(protocol + this.ipaddress + ":" + this.port + AppleTvURL + this.pairingguid);
		///*
        request.get({
            url: protocol + this.ipaddress + ":" + this.port + AppleTvURL + this.pairingguid,
            headers: {
				'User-Agent': 'Remote/1.0'
            }
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				this.log("success");
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
AppleTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Send the TV Channel command
//------------------------------------------------------------------------------------------------
// This guy needs work, the issue is channels aren't ints.  I would need to figure out how to 
// do string characteristics 
SonyChannelTV.prototype.getServices = function() { return [this.service]; }
function SonyChannelTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    //this.service = new Service.Switch(this.name);
	this.service = new Service.Lightbulb(this.name);
	this.timer;
	
    this.service
        .getCharacteristic(Characteristic.On)
		//.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
		
    this.service
		.addCharacteristic(new Characteristic.Brightness())

		.on('set', this.setBrightness.bind(this));	
}
SonyChannelTV.prototype.setBrightness = function(value, callback) {  
		this.log("Channel 1: "+value);
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
		//this.log("Channel:"+this.channel);
		this.log("Channel 2: "+value);
		for (var i = 0, len = value.length; i < len; i++) {
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
SonyChannelTV.prototype.getBrightness = function(callback) { callback(null, false);  }
SonyChannelTV.prototype.setOn = function(value, callback) {  
		var volume = parseInt(this.volume);
        var postData = startAudioJSON + volume + endAudioJSON;  
        request.post({
            url: protocol + this.ipaddress + AudioURL,
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
//SonyChannelTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyChannelTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
SonyChannelTV.prototype.runTimer0 = function() {
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
SonyChannelTV.prototype.runTimer1 = function() {
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
SonyChannelTV.prototype.runTimer2 = function() {
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
SonyChannelTV.prototype.runTimer3 = function() {
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
SonyChannelTV.prototype.runTimer4 = function() {
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
SonyChannelTV.prototype.runTimer5 = function() {
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
SonyChannelTV.prototype.runTimer6 = function() {
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
SonyChannelTV.prototype.runTimer7 = function() {
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
SonyChannelTV.prototype.runTimer8 = function() {
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
SonyChannelTV.prototype.runTimer9 = function() {
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
SonyChannelTV.prototype.runTimerDot = function() {
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
SonyChannelTV.prototype.runTimerDpadCenter = function() {
		//this.log("send DpadCenter");
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
// Send the TV Volume Minus command
//------------------------------------------------------------------------------------------------
SonyVolumeMinusTV.prototype.getServices = function() { return [this.service]; }
function SonyVolumeMinusTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.volume = config["volume"];
    //this.service = new Service.Switch(this.name);
	this.service = new Service.Lightbulb(this.name);
	this.timer;
	
    this.service
        .getCharacteristic(Characteristic.On)
		 //.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
		
    this.service
		.addCharacteristic(new Characteristic.Brightness())
		.on('get', this.getBrightness.bind(this))
		.on('set', this.setBrightness.bind(this));	
}
SonyVolumeMinusTV.prototype.setBrightness = function(value, callback) {  
		this.log("value:"+value);
		var volume = parseInt(this.volume);
        var postData = startAudioJSON + "-" + value + endAudioJSON;  
        request.post({
            url: protocol + this.ipaddress + AudioURL,
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
SonyVolumeMinusTV.prototype.getBrightness = function(callback) { callback(null, false);  }
SonyVolumeMinusTV.prototype.setOn = function(value, callback) {  
		var volume = parseInt(this.volume);
        var postData = startAudioJSON + volume + endAudioJSON;  
        request.post({
            url: protocol + this.ipaddress + AudioURL,
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
//SonyVolumeMinusTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyVolumeMinusTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Send the TV Volume Plus command
//------------------------------------------------------------------------------------------------
SonyVolumePlusTV.prototype.getServices = function() { return [this.service]; }
function SonyVolumePlusTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.service = new Service.Lightbulb(this.name);
	this.timer;
	
    this.service
        .getCharacteristic(Characteristic.On)
		//.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
		
    this.service
		.addCharacteristic(new Characteristic.Brightness())
		.on('get', this.getBrightness.bind(this))
		.on('set', this.setBrightness.bind(this));	
}
SonyVolumePlusTV.prototype.setBrightness = function(value, callback) {  
		this.log("value:"+value);
		var volume = parseInt(this.volume);
        var postData = startAudioJSON + "+" + value + endAudioJSON;  
        request.post({
            url: protocol + this.ipaddress + AudioURL,
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
SonyVolumePlusTV.prototype.getBrightness = function(callback) { callback(null, false);  }
SonyVolumePlusTV.prototype.setOn = function(value, callback) {  
		var volume = parseInt(this.volume);
        var postData = startAudioJSON + volume + endAudioJSON;  
        request.post({
            url: protocol + this.ipaddress + AudioURL,
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
//SonyVolumePlusTV.prototype.getOn = function(callback) { callback(null, false);  }
SonyVolumePlusTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Send the TV Volume command
//------------------------------------------------------------------------------------------------
SonyVolumeTV.prototype.getServices = function() { return [this.service]; }
function SonyVolumeTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.service = new Service.Lightbulb(this.name);
	this.timer;
	
    this.service
        .getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
		
    this.service
		.addCharacteristic(new Characteristic.Brightness())
		.on('get', this.getBrightness.bind(this))
		.on('set', this.setBrightness.bind(this));	
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}		
}
SonyVolumeTV.prototype.setBrightness = function(value, callback) {  
		this.log("value:"+value);
		var volume = parseInt(this.volume);
        var postData = startAudioJSON + value + endAudioJSON;  
        request.post({
            url: protocol + this.ipaddress + AudioURL,
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);	
}
SonyVolumeTV.prototype.setOn = function(value, callback) {  
		var volume = parseInt(this.volume);
        var postData = startAudioJSON + volume + endAudioJSON;  
        request.post({
            url: protocol + this.ipaddress + AudioURL,
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);	
}
SonyVolumeTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
SonyVolumeTV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = AudioStatus;
		var pos1 = 0;
		var pos2 = 0;
		var volume = 0;
        request.post({
            url: protocol + this.ipaddress + AudioURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				//this.log(response.body);
				if (response.body.includes('volume')){
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					//this.service.getCharacteristic(Characteristic.Brightness).updateValue(volume);
					this.isOn = true;
					callback(null, true);
				}
                else {
					this.log("getBrightness: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyVolumeTV.prototype.getBrightness = function(callback) {
		//this.log("getOn");
        var postData = AudioStatus;
		var pos1 = 0;
		var pos2 = 0;
		var volume = 0;
        request.post({
            url: protocol + this.ipaddress + AudioURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				//this.log(response.body);
				if (response.body.includes('volume')){
					pos1=response.body.indexOf('"volume"');
					pos2=response.body.indexOf('"mute"');
					pos1=pos1+9;
					pos2=pos2-1;
					//this.log("string volume [" + response.body.substring(pos1,pos2)+"]");
					volume=parseInt(response.body.substring(pos1,pos2));
					this.log("getBrightness: Volume:"+volume);
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.Brightness).updateValue(volume);
					this.isOn = true;
					callback(null, volume);
				}
                else {
					this.log("getBrightness: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyVolumeTV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = AudioStatus;
		var pos1 = 0;
		var pos2 = 0;
		var volume = 0;
        request.post({
            url: protocol + this.ipaddress + AudioURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				//this.log(response.body);
				if (response.body.includes('volume')){
					pos1=response.body.indexOf('"volume"');
					pos2=response.body.indexOf('"mute"');
					pos1=pos1+9;
					pos2=pos2-1;
					//this.log("string volume [" + response.body.substring(pos1,pos2)+"]");
					volume=parseInt(response.body.substring(pos1,pos2));
					this.log("statusCheck: Volume:"+volume);
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					this.service.getCharacteristic(Characteristic.Brightness).updateValue(volume);
					//callback(null, true);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
}
//------------------------------------------------------------------------------------------------

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
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}
		
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);	
}
SonyMuteTV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = AudioStatus;
        request.post({
            url: protocol + this.ipaddress + AudioURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes(',"mute":true')){
					this.log("getOn: Mute:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes(',"mute":false')){
					this.log("getOn: Mute:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyMuteTV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = AudioStatus;
        request.post({
            url: protocol + this.ipaddress + AudioURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes(',"mute":true')){
					this.log("statusCheck: Mute:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes(',"mute":false')){
					this.log("statusCheck: Mute:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
}
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
		//.on('get', this.getOn.bind(this))
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
SonyUnMuteTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
// Send the TV Right Arrow command multiple times and then ok
//------------------------------------------------------------------------------------------------
SonyPageRightOkTV.prototype.getServices = function() { return [this.service]; }
function SonyPageRightOkTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageRightOkTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageRightOk();
			}.bind(this), senddelay+1000);	
		this.timer = setTimeout(function() {
				this.runTimerPageRightOk();
			}.bind(this), senddelay+2500);	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageRightOkTV.prototype.runTimerPageRight = function() {
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
SonyPageRightOkTV.prototype.runTimerPageRightOk = function() {
		var request = require("request");
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
SonyPageRightOkTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
// Send the TV Right Arrow command multiple times and then play
//------------------------------------------------------------------------------------------------
SonyPageRightPlayTV.prototype.getServices = function() { return [this.service]; }
function SonyPageRightPlayTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageRightPlayTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageRightPlay();
			}.bind(this), senddelay+500);	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageRightPlayTV.prototype.runTimerPageRight = function() {
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
SonyPageRightPlayTV.prototype.runTimerPageRightPlay = function() {
		var request = require("request");
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
SonyPageRightPlayTV.prototype.runTimer = function() {
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
	this.timer;
	this.service = new Service.Lightbulb(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
    this.service
		.addCharacteristic(new Characteristic.Brightness())

		.on('set', this.setBrightness.bind(this));
}
SonyPageRightTV.prototype.setBrightness = function(value, callback) {   
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
		var delay = parseInt(this.delay);
		for (i = 1; i < pagecounter; i++) { 
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
SonyPageRightTV.prototype.setOn = function(value, callback) { 		
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
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
SonyPageRightTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
// Send the TV Left Arrow and Ok command multiple times
//------------------------------------------------------------------------------------------------
SonyPageLeftOkTV.prototype.getServices = function() { return [this.service]; }
function SonyPageLeftOkTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageLeftOkTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageLeftOk();
			}.bind(this), senddelay+1000);	
		this.timer = setTimeout(function() {
				this.runTimerPageLeftOk();
			}.bind(this), senddelay+2500);	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageLeftOkTV.prototype.runTimerPageLeft = function() {
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
SonyPageLeftOkTV.prototype.runTimerPageLeftOk = function() {
		var request = require("request");
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
SonyPageLeftOkTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------





//------------------------------------------------------------------------------------------------
// Send the TV Left Arrow and Play command multiple times
//------------------------------------------------------------------------------------------------
SonyPageLeftPlayTV.prototype.getServices = function() { return [this.service]; }
function SonyPageLeftPlayTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageLeftPlayTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageLeftPlay();
			}.bind(this), senddelay+1000);	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageLeftPlayTV.prototype.runTimerPageLeft = function() {
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
SonyPageLeftPlayTV.prototype.runTimerPageLeftPlay = function() {
		var request = require("request");
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
SonyPageLeftPlayTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Left Arrow command multiple times
//------------------------------------------------------------------------------------------------
SonyPageLeftTV.prototype.getServices = function() { return [this.service]; }
function SonyPageLeftTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
	this.pagecount = config["pagecount"];
	this.delay = config["delay"];
	this.timer;
	this.service = new Service.Lightbulb(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
    this.service
		.addCharacteristic(new Characteristic.Brightness())

		.on('set', this.setBrightness.bind(this));
}
SonyPageLeftTV.prototype.setBrightness = function(value, callback) {   
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
		var delay = parseInt(this.delay);
		for (i = 1; i < pagecounter; i++) { 
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
SonyPageLeftTV.prototype.setOn = function(value, callback){   
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
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
	this.timer;
	this.service = new Service.Lightbulb(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
    this.service
		.addCharacteristic(new Characteristic.Brightness())

		.on('set', this.setBrightness.bind(this));
}
SonyPageDownTV.prototype.setBrightness = function(value, callback) {   
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
		var delay = parseInt(this.delay);
		for (i = 1; i < pagecounter; i++) { 
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
SonyPageDownTV.prototype.setOn = function(value, callback) {   
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
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
SonyPageDownTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Send the TV Down Arrow command multiple times and play
//------------------------------------------------------------------------------------------------
SonyPageDownPlayTV.prototype.getServices = function() { return [this.service]; }
function SonyPageDownPlayTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageDownPlayTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageDownPlay();
			}.bind(this), senddelay+1000);	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageDownPlayTV.prototype.runTimerPageDown = function() {
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
SonyPageDownPlayTV.prototype.runTimerPageDownPlay = function() {
		var request = require("request");
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
SonyPageDownPlayTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
// Send the TV Down Arrow command multiple times and ok
//------------------------------------------------------------------------------------------------
SonyPageDownOkTV.prototype.getServices = function() { return [this.service]; }
function SonyPageDownOkTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageDownOkTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageDownOk();
			}.bind(this), senddelay+1000);	
		this.timer = setTimeout(function() {
				this.runTimerPageDownOk();
			}.bind(this), senddelay+2500);	
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageDownOkTV.prototype.runTimerPageDown = function() {
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
SonyPageDownOkTV.prototype.runTimerPageDownOk = function() {
		var request = require("request");
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
SonyPageDownOkTV.prototype.runTimer = function() {
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
	this.timer;
    //this.service = new Service.Switch(this.name);
	this.service = new Service.Lightbulb(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
    this.service
		.addCharacteristic(new Characteristic.Brightness())

		.on('set', this.setBrightness.bind(this));			
}
SonyPageUpTV.prototype.setBrightness = function(value, callback) {   
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
		var delay = parseInt(this.delay);
		for (i = 1; i < pagecounter; i++) { 
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
SonyPageUpTV.prototype.setOn = function(value, callback) {   
		//var pagecounter = parseInt(this.pagecount);
		var pagecounter = parseInt(value);
		if (isNaN(pagecounter)){
			pagecounter=1;
		}
		this.log("value:"+value+" pagecounter:"+pagecounter);
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
SonyPageUpTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Send the TV Up Arrow command multiple times and then ok
//------------------------------------------------------------------------------------------------
SonyPageUpOkTV.prototype.getServices = function() { return [this.service]; }
function SonyPageUpOkTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageUpOkTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageUpOk();
			}.bind(this), senddelay+1000);
		this.timer = setTimeout(function() {
				this.runTimerPageUpOk();
			}.bind(this), senddelay+2500);			
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageUpOkTV.prototype.runTimerPageUp = function() {
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
SonyPageUpOkTV.prototype.runTimerPageUpOk = function() {
		var request = require("request");
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
SonyPageUpOkTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------




//------------------------------------------------------------------------------------------------
// Send the TV Up Arrow command multiple times and then play
//------------------------------------------------------------------------------------------------
SonyPageUpPlayTV.prototype.getServices = function() { return [this.service]; }
function SonyPageUpPlayTV(log, config) {
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
        .on('set', this.setOn.bind(this));
}
SonyPageUpPlayTV.prototype.setOn = function(value, callback) {   
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
				this.runTimerPageUpPlay();
			}.bind(this), senddelay+1000);
		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);
		callback();
}
SonyPageUpPlayTV.prototype.runTimerPageUp = function() {
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
SonyPageUpPlayTV.prototype.runTimerPageUpPlay = function() {
		var request = require("request");
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
SonyPageUpPlayTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------






//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with Wake
2. Turn the TV on with System
3. Change input to HDMI1
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
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}		
		
}
SonyHDMI1TV.prototype.setOn = function(value, callback) {    
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonyHDMI1TV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 1')){
					this.log("getOn: HDMI1:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("getOn: HDMI1:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyHDMI1TV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 1')){
					this.log("statusCheck: HDMI1:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("statusCheck: HDMI1:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
}
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
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}		
}
SonyHDMI2TV.prototype.setOn = function(value, callback) {    
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonyHDMI2TV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 2')){
					this.log("getOn: HDMI2:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("getOn: HDMI2:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyHDMI2TV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 2')){
					this.log("statusCheck: HDMI2:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("statusCheck: HDMI2:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
}
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
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}		
}
SonyHDMI3TV.prototype.setOn = function(value, callback) {    
		// Wake On Lan

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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonyHDMI3TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
SonyHDMI3TV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 3')){
					this.log("getOn: HDMI3:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("getOn: HDMI3:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyHDMI3TV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 3')){
					this.log("statusCheck: HDMI3:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("statusCheck: HDMI3:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
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
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}		
}
SonyHDMI4TV.prototype.setOn = function(value, callback) {    
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonyHDMI4TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
SonyHDMI4TV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 4')){
					this.log("getOn: HDMI4:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("getOn: HDMI4:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyHDMI4TV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('HDMI 4')){
					this.log("statusCheck: HDMI4:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("statusCheck: HDMI4:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with WOL
2. Turn the TV on with Wake
3. Turn the TV on with System
4. Change input to SonyVideo1TV
*/
//------------------------------------------------------------------------------------------------
SonyVideo1TV.prototype.getServices = function() { return [this.service]; }
function SonyVideo1TV(log, config) {
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
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}		
}
SonyVideo1TV.prototype.setOn = function(value, callback) {    
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
		
		postData = startXML + Video1 + endXML; 
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonyVideo1TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
SonyVideo1TV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('Video 1')){
					this.log("getOn: VIDEO1:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("getOn: VIDEO1:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyVideo1TV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('Video 1')){
					this.log("statusCheck: VIDEO1:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("statusCheck: VIDEO1:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with WOL
2. Turn the TV on with Wake
3. Turn the TV on with System
4. Change input to SonyVideo2TV
*/
//------------------------------------------------------------------------------------------------
SonyVideo2TV.prototype.getServices = function() { return [this.service]; }
function SonyVideo2TV(log, config) {
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
		
	this.polldelay = parseInt(config["polldelay"]);
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}		
}
SonyVideo2TV.prototype.setOn = function(value, callback) {    
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
		
		postData = startXML + Video2 + endXML; 
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
//		this.timer = setTimeout(function() {
//			this.runTimer();
//		}.bind(this), 1000);		
}
SonyVideo2TV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
SonyVideo2TV.prototype.getOn = function(callback) {
		//this.log("getOn");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('Video 2')){
					this.log("getOn: VIDEO2:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("getOn: VIDEO2:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyVideo2TV.prototype.statusCheck = function() {
		//this.log("statusCheck");
        var postData = InputStatus;
        request.post({
            url: protocol + this.ipaddress + avContentURL,
            headers: {
                'X-Auth-PSK': this.psk,
            },
            form: postData
        }, function(err, response, body) {
            if (!err && response.statusCode == 200) {
				if (response.body.includes('Video 2')){
					this.log("statusCheck: VIDEO2:True");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes('title')){
					this.log("statusCheck: VIDEO2:False");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("Check again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), this.polldelay);
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
SonyInputTV.prototype.runTimer = function() {
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
		//.on('get', this.getOn.bind(this))
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
SonyPowerOffOnlyTV.prototype.getServices = function() { return [this.service]; }
function SonyPowerOffOnlyTV(log, config) { //Turns TV Off only
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
}
SonyPowerOffOnlyTV.prototype.setOn = function(value, callback) {    
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

		this.timer = setTimeout(function() {
			this.runTimer();
		}.bind(this), 1000);		
		
		this.timer = setTimeout(function() {
			this.runTimerSystemOff();
		}.bind(this), 2000);
		
		this.timer = setTimeout(function() {
			this.runTimerPowerOff();
		}.bind(this), 3000);		
		callback();
		
}
SonyPowerOffOnlyTV.prototype.runTimerSystemOff = function ()
{
		this.log("SystemOff");
		postData = startJSON + SystemOff + endJSON; 
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
				//this.log("Dude Netflix");
                //callback(); // success
            } else {
                this.log(logError, err, body);
                //callback(err || new Error(stateError));
            }
        }.bind(this));			
}
SonyPowerOffOnlyTV.prototype.runTimerPowerOff = function ()
{
	    this.log("PowerOff");
		postData = startXML + PowerOff + endXML; 
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
}
SonyPowerOffOnlyTV.prototype.runTimer = function() {
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
SonyPicOffTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
/*
1. Turn the TV on with Wake
2. Turn the TV on with System
3. Change input to Netflix
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
        .on('set', this.setOn.bind(this));
}
SonyNetflixTV.prototype.setOn = function(value, callback) {    

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
SonyChannelDownTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

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
SonyPlayTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Send the TV Back command
//------------------------------------------------------------------------------------------------
SonyBackTV.prototype.getServices = function() { return [this.service]; }
function SonyBackTV(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.service = new Service.Switch(this.name);
	this.timer;
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setOn.bind(this));
}
SonyBackTV.prototype.setOn = function(value, callback) {    
		var postData = startXML + Back + endXML; 
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
SonyBackTV.prototype.runTimer = function() {
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
SonySystemOffTV.prototype.runTimer = function() {
            //this.log("turn the button back off");
            this.service.getCharacteristic(Characteristic.On).updateValue(false);
            this.isOn = false;
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// Send the TV SystemOn command
//------------------------------------------------------------------------------------------------
SonyPowerOnOnlyTV.prototype.getServices = function() { return [this.service]; }
function SonyPowerOnOnlyTV(log, config) {  // only turns on
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
		
	this.timer = setTimeout(function() {
		this.statusCheck();
	}.bind(this), 10000);
}
SonyPowerOnOnlyTV.prototype.setOn = function(value, callback) {    //Only turns on
		this.log("OnOnly");
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
SonyPowerOnOnlyTV.prototype.getOn = function(callback) {
		//this.log("getOn");
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
					this.log("Polling: Active", "Active", response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes("standby")){
					this.log("Polling: Standby", "Standby", response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log(response.statusCode.toString(), "[Off]", response.body);
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyPowerOnOnlyTV.prototype.statusCheck = function() {
		//this.log("statusCheck");
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
					this.log("Polling: Active", "Active", response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes("standby")){
					this.log("Polling: Standby", "Standby", response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log(response.statusCode.toString(), "[Off]", response.body);
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 60000);
}
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
/*
This is multiple commsnds in a timed sequence.
1. Wake Up Tv via IRCC (turn TV on)
2. Power on via system URL (turn TV on)
*/
//------------------------------------------------------------------------------------------------
SonyAllPowerOnTV.prototype.getServices = function() { return [this.service]; }
function SonyAllPowerOnTV(log, config) {  // only turns on
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
	this.macaddress = config["macaddress"];
    this.ipaddress = config["ipaddress"];
	this.polldelay = config["polldelay"];
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
		
	if (parseInt(this.polldelay)>10000){
		this.timer = setTimeout(function() {
			this.statusCheck();
		}.bind(this), 10000);
	}

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
		//this.log("getOn");
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
					this.log("getOn: Active");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					callback(null, true);
				}
				else if (response.body.includes("standby")){
					this.log("getOn: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					callback(null, false);
				}
                else {
					this.log(response.statusCode.toString(), "[Off]", response.body);
					callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                callback(err, false);
            }
        }.bind(this));
}
SonyAllPowerOnTV.prototype.statusCheck = function() {
		//this.log("statusCheck");
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
					this.log("statusCheck: Active");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(true);
					this.isOn = true;
					//callback(null, true);
				}
				else if (response.body.includes("standby")){
					this.log("statusCheck: Standby");
					//this.log(response.body);
					this.service.getCharacteristic(Characteristic.On).updateValue(false);
					this.isOn = false;
					//callback(null, false);
				}
                else {
					this.log(response.statusCode.toString(), "[Off]", response.body);
					//callback(null, false);
				}
            } else {
                this.log(logError, err, body);
				this.log(response.statusCode.toString(), err, response.body);
                //callback(err, false);
            }
        }.bind(this));
		this.timer = setTimeout(function() {
			//this.log("polling again in "+this.polldelay);
			this.statusCheck();
		}.bind(this), parseInt(this.polldelay));
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
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
/*
This is multiple commsnds in a timed sequence.
1. Wake Up Tv via IRCC (turn TV on)
2. Power on via system URL (turn TV on)
3. Send the channels command to change input to Tv
4. After a timed delay, enter the channel information
5. send dpadcenter to tune the TV
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

		// Wake up the TV
		var postData = startXML + WakeUp + endXML; 
		var delay = 1500;
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
			
			var senddelay = ((i+1)*delay)+3000;
			var dpaddelay = ((this.channel.length+1)*delay)+3500;
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
        //.on('get', this.getOn.bind(this))
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
