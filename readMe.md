**Pigrow mobile** is a companion mobile app for the Pigrow automated
grow system.

It is developed in the Framwork7 framework and published as a android
WebView app. Apks are in the publish folder.

The application allows you to access data from Pigrow and amend some
commonly used options. It is not a standalone application and only
covers a minute subset of Pigrow configuration options.

**Application Usage:**

Make sure server script is running on the Pi. See PigrowMobile-server
project (hopefully will be part of Pigrow deploy)

On init screen enter your Pi ip address and server port (defaults to
5000 for Flask built in server.

![](../PigrowMobile-Client/blob/master/ReadME/chart%20options.jpg){width="2.8734547244094486in"
height="6.229166666666667in"}

**Config screen**

This will take you to the home screen where readings will be shown from
pre-configured sensors in Pigrow main app:

Refresh will update the readings and the menu button

![](media/image2.jpeg){width="2.841346237970254in" height="6.15625in"}

**Home screen**

Menu button opens up Nav menu:

![](media/image3.jpeg){width="2.8220614610673667in"
height="6.1144674103237096in"}

**Nav menu**

Charts allows you to create interactive charts with a few simple options
(uses dygraph js library)

![](media/image4.jpeg){width="2.774038713910761in"
height="6.010416666666667in"}

**Chart config**

Line or bar charts are available

The list of logs is populated from installed sensors

The columns are updated automatically for each log type (supports chirp
and modular types currently)

Optional start and end date choosers

Hit generate to create the chart

![](media/image5.jpeg){width="2.7980763342082238in" height="6.0625in"}

**Chart display**

The chart is interactive, can be pinch and zoomed to look at particular
section more closely

Data can be clicked to get a reading at that point (wip)

Double tap to reset graph for full view

Config shows GPIO configuration and allows toggling of relay switches

![](media/image6.jpeg){width="2.8317311898512685in"
height="6.135416666666667in"}

**GPIO config with toggles**

Triggers allows the user to view current triggers in the Pigrow system

![](media/image7.jpeg){width="2.7644225721784776in"
height="5.989583333333333in"}

**Trigger list**

![](media/image8.jpeg){width="2.740384951881015in" height="5.9375in"}

**Trigger details**

Triggers can be edited or new ones created

![](media/image9.jpeg){width="2.697115048118985in" height="5.84375in"}

**Edit Trigger**

Sensors information can be viewed (read only)

![](media/image10.jpeg){width="2.884615048118985in" height="6.25in"}

**View sensor details**
