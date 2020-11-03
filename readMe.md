### **Pigrow mobile** 
is a companion mobile app for the Pigrow automated
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

<img alt="" src="/../../blob/master/ReadME/enterdetails.jpg?raw=true" width="200">
*Config screen*

This will take you to the home screen where readings will be shown from
pre-configured sensors in Pigrow main app:

Refresh will update the readings and the menu button

<img alt="" src="/../../blob/master/ReadME/homescreen.jpg?raw=true" width="200">
*Home screen*

Menu button opens up Nav menu:

<img alt="" src="/../../blob/master/ReadME/sidemenu.jpg?raw=true" width="200">
*Nav menu*

Charts allows you to create interactive charts with a few simple options
(uses dygraph js library)

<img alt="" src="/../../blob/master/ReadME/chart%20options.jpg?raw=true" width="200">
*Chart config*

Line or bar charts are available

The list of logs is populated from installed sensors

The columns are updated automatically for each log type (supports chirp
and modular types currently)

Optional start and end date choosers

Hit generate to create the chart

<img alt="" src="/../../blob/master/ReadME/chartdisplay.jpg?raw=true" width="200">
*Chart display*

The chart is interactive, can be pinch and zoomed to look at particular
section more closely

Data can be clicked to get a reading at that point (wip)

Double tap to reset graph for full view

Config shows GPIO configuration and allows toggling of relay switches

<img alt="" src="/../../blob/master/ReadME/gpioconfig.jpg?raw=true" width="200">
*GPIO config with toggles*

Triggers allows the user to view current triggers in the Pigrow system

<img alt="" src="/../../blob/master/ReadME/triggerlist.jpg?raw=true" width="200">
*Trigger list*

<img alt="" src="/../../blob/master/ReadME/triggerview.jpg?raw=true" width="200">
*Trigger details*

Triggers can be edited or new ones created

<img alt="" src="/../../blob/master/ReadME/triggeredit.jpg?raw=true" width="200">
*Edit Trigger*

Sensors information can be viewed (read only)

<img alt="" src="/../../blob/master/ReadME/sensorview.jpg?raw=true" width="200">
*View sensor details*
