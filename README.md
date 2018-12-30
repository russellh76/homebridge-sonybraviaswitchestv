# homebridge-sonybraviaswitchestv
Apple homekit homebridge accessory for treating Sony Bravia TVs as a series of switches

NOTE: There's now a platform available for these Televisions.  I don't yet know how well it works or how much functionality overlaps.
https://www.npmjs.com/package/homebridge-sonybravia-platform


1. I'm somewhat new to this.  Start with a more established project if you are new to homebridge.

2. This treats sony bravia TVs as a series of switches and bulbs.  So it's actually many accessories.  On/off switches can just be mentioned to Siri and she'll toggle them.  So even though it's technically "Bravia Mute On", you can just say "Bravia Mute" and she'll mute it.  I currently have all TV devices in their own room in Homekit.  Helps preserve my sanity.

3. Currently supported features are: </i><br>

Mute: sonymutetv.homebridge-sonymutetv <i>"Hey Siri Bravia Mute"</i><br>
UnMute: sonyunmutetv.homebridge-sonyunmutetv  <i>"Hey Siri Bravia Mute Off"</i><br>
Input 1: sonyhdmi1tv.homebridge-sonyhdmi1tv  <i>"Hey Siri Bravia HDMI One"</i><br>
Input 2: sonyhdmi2tv.homebridge-sonyhdmi2tv  <i>"Hey Siri Bravia HDMI Two"</i><br>
Input 3: sonyhdmi3tv.homebridge-sonyhdmi3tv  <i>"Hey Siri Bravia HDMI Three"</i><br>
Input 4: sonyhdmi4tv.homebridge-sonyhdmi4tv  <i>"Hey Siri Bravia HDMI Four"</i><br>
Input: sonyinputtv.homebridge-sonyinputtv  <i>"Hey Siri Bravia Input"</i><br>
Left Arrow: sonylefttv.homebridge-sonylefttv  <i>"Hey Siri Bravia Left Arrow"</i><br>
Right Arrow: sonyrighttv.homebridge-sonyrighttv  <i>"Hey Siri Bravia Right Arrow"</i><br>
Down Arrow: sonydowntv.homebridge-sonydowntv  <i>"Hey Siri Bravia Down Arrow"</i><br>
Up Arrow: sonyuptv.homebridge-sonyuptv  <i>"Hey Siri Bravia Up Arrow"</i><br>
Ok Button: sonydpadcentertv.homebridge-sonydpadcentertv  <i>"Hey Siri Bravia OK"</i><br>
Picture Off: sonypicofftv.homebridge-sonypicofftv  <i>"Hey Siri Bravia Picture Off"</i><br>
Netlfix Button: sonynetflixtv.homebridge-sonynetflixtv  <i>"Hey Siri Bravia Netflix"</i><br>
CC Button: sonyclosedcaptiontv.homebridge-sonyclosedcaptiontv <i>"Hey Siri Bravia ClosedCaption"</i><br>
Subtitle Button: sonysubtitletv.homebridge-sonysubtitletv <i>"Hey Siri Bravia Subtitles"</i><br>
Guide: sonygguidetv.homebridge-sonygguidetv <i>"Hey Siri Bravia Guide"</i><br>
Channel Up: sonychanneluptv.homebridge-sonychanneluptv <i>"Hey Siri Bravia Channel Up"</i><br>
Channel Down: sonychanneldowntv.homebridge-sonychanneldowntv <i>"Hey Siri Bravia Channel Down"</i><br>
Stop Button: sonystoptv.homebridge-sonystoptv <i>"Hey Siri Bravia Stop"</i><br>
Pause Button: sonypausetv.homebridge-sonypausetv <i>"Hey Siri Bravia Pause"</i><br>
Play Button: sonyplaytv.homebridge-sonyplaytv <i>"Hey Siri Bravia Play"</i><br>
System Off: sonysystemofftv.homebridge-sonysystemofftv <i>"Hey Siri Bravia Off"</i><br>
System On: sonysystemontv.homebridge-sonysystemontv <i>"Hey Siri Bravia On"</i><br>
Power Toggle: sonypowertoggletv.homebridge-sonypowertoggletv <i>"Hey Siri Bravia Power Toggle"</i><br>
Power Off: sonypowerofftv.homebridge-sonypowerofftv <i>"Hey Siri Bravia Power Off"</i><br>
Wake Up: onywakeuptv.homebridge-sonywakeuptv <i>"Hey Siri Bravia WakeUp"</i><br>
Channel Tune: sonychanneltunetv.homebridge-sonychanneltunetv <i>"Hey Siri Bravia ABC"</i><br>
Channels Button: sonychannelstv.homebridge-sonychannelstv <i>"Hey Siri Bravia Channels"</i><br>
Jump Button: sonyjumptv.homebridge-sonyjumptv <i>"Hey Siri Bravia Jump"</i><br>
All Power On (all on methods in one function): sonyallpowerontv.homebridge-sonyallpowerontv <i>"Hey Siri Bravia On"</i><br>
Set Volume: sonysetvolumetv.homebridge-sonysetvolumetv <i>"Hey Siri Bravia Set Volume 40"</i><br>
Plus Volume: sonysetvolumeplustv.homebridge-sonysetvolumeplustv <i>"Hey Siri Bravia Volume plus 12"</i><br>
Minus Volume: sonysetvolumeminustv.homebridge-sonysetvolumeminustv <i>"Hey Siri Bravia Set minus 20"</i><br>

I'll have jacked something up, be gentle.
I used Bravia because Siri sometimes gets confused by the word TV.

TODO 1:
Should I do numbers? That would allow Siri user to call out channels to TV with voice commands.
Probably makes more sense to just add all possible channel combinations to the existing config.

DONE: 
Finally figured out the status checking for TV Power, Inputs, Mute and Volume.

DONE:
I can implement polling for status on volume, mute, the input options.  Set a polling value in config.json for off/on timing.

DONE:
I've left Video1 and Video2 out.

DONE: 
Finally figured out the status checking for TV Power.

DONE:
Expanded navigation commands to append a PLAY or OK to the end.

DONE:
Volume and navigation are now treated as bulds so they can take a numeric argument.

DONE:
Set arrow commands to repeat, which will ease navigation.

DONE:
Removed Wake On LAN functionality.  It was complexity and fragility that didn't really add anything.  Fewer dependencies now.
