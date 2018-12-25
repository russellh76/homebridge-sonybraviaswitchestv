# homebridge-sonybraviaswitchestv
Apple homekit homebridge accessory for treating Sony Bravia TVs as a series of switches

1. I'm new to this.  Start with a more established project if you are new to homebridge.
2. This treats sony bravia TVs as a series of switches.  So it's actually many devices.  On/off switches can just be mentioned to Siri and she'll toggle them.  So even though it's technically "Bravia Mute On", you can just say "Bravia Mute" and she'll mute it.  I currently have all TV devices in their own room in Homekit.  Helps preserve my sanity.
3. Currently supported features are: <br>
Mute: sonymutetv.homebridge-sonymutetv "Hey Siri Bravia Mute"<br>
UnMute: sonyunmutetv.homebridge-sonyunmutetv "Hey Siri Bravia Mute Off"<br>
Volume Up: sonyvolumeuptv.homebridge-sonyvolumeuptv "Hey Siri Bravia Volume Up 10"<br>
Volume Down: sonyvolumedowntv.homebridge-sonyvolumedowntv "Hey Siri Bravia Volume Down 10"<br>
Input 1: sonyhdmi1tv.homebridge-sonyhdmi1tv "Hey Siri Bravia HDMI One"<br>
Input 2: sonyhdmi2tv.homebridge-sonyhdmi2tv <br>
Input 3: sonyhdmi3tv.homebridge-sonyhdmi3tv <br>
Input 4: sonyhdmi4tv.homebridge-sonyhdmi4tv <br>
Input: sonyinputtv.homebridge-sonyinputtv "Hey Siri Bravia Input"<br>
Left Arrow: sonylefttv.homebridge-sonylefttv "Hey Sirir Bravia Left Arrow"<br>
Right Arrow: sonyrighttv.homebridge-sonyrighttv <br>
Down Arrow: sonydowntv.homebridge-sonydowntv <br>
Up Arrow: sonyuptv.homebridge-sonyuptv <br>
Ok Button: sonydpadcentertv.homebridge-sonydpadcentertv "Hey Siri Bravia OK"<br>
Picture Off: sonypicofftv.homebridge-sonypicofftv <br>
Netlfix Button: sonynetflixtv.homebridge-sonynetflixtv <br>
CC Button: sonyclosedcaptiontv.homebridge-sonyclosedcaptiontv <br>
Subtitle Button: sonysubtitletv.homebridge-sonysubtitletv <br>
Guide: sonygguidetv.homebridge-sonygguidetv <br>
Channel Up: sonychanneluptv.homebridge-sonychanneluptv <br>
Channel Down: sonychanneldowntv.homebridge-sonychanneldowntv <br>
Stop Button: sonystoptv.homebridge-sonystoptv <br>
Pause Button: sonypausetv.homebridge-sonypausetv <br>
Play Button: sonyplaytv.homebridge-sonyplaytv <br>
System Off: sonysystemofftv.homebridge-sonysystemofftv <br>
System On: sonysystemontv.homebridge-sonysystemontv <br>
Power Toggle (power button on remote): sonypowertoggletv.homebridge-sonypowertoggletv <br>
Power Off: sonypowerofftv.homebridge-sonypowerofftv <br>
Wake Up: onywakeuptv.homebridge-sonywakeuptv <br>
Channel Tune: sonychanneltunetv.homebridge-sonychanneltunetv <br>
Channels Button: sonychannelstv.homebridge-sonychannelstv <br>
Jump Button: sonyjumptv.homebridge-sonyjumptv <br>
All Power On (all on methods in one function): sonyallpowerontv.homebridge-sonyallpowerontv <br>
Set Volume: sonysetvolumetv.homebridge-sonysetvolumetv <br>

I'll have jacked something up, be gentle.
I used Bravia because Siri sometimes gets confused by the word TV.

TODO:
Should I do numbers? That would allow Siri user to call out channels to TV with voice commands.
Probably makes more sense to just add all possible channel combinations to the existing config.

DONE:
Removed Wake On LAN functionality.  It was complexity and fragility that didn't really add anything.  Fewer dependencies now.




