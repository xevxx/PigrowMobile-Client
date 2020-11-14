### **Pigrow mobile** 
is a companion mobile app for the Pigrow automated
grow system.

It is developed in the Framework7 framework and published as a android
WebView app. Apks are in the publish folder.

The application allows you to access data from Pigrow and amend some
commonly used options. It is not a standalone application and only
covers a minute subset of Pigrow configuration options.

**Application Usage:**

Make sure server script is running on the Pi. See PigrowMobile-server
project (hopefully will be part of Pigrow deploy)

On init screen enter your Pi ip address and server port (defaults to
5000 for Flask built in server.

<em>Connection screen</em>

<img alt="" src="/../../blob/master/ReadME/enterdetails.jpg?raw=true" width="200">

This will take you to the home screen where readings will be shown from
pre-configured sensors in Pigrow main app:

Initially a chart of the last 24hrs will be configured to display for the 1st sensor. All sensor reports can be configured in the app config section - see below

Refresh will update the readings and the menu button

<em>Home screen</em>

<img alt="" src="/../../blob/master/ReadME/homeChart.jpg?raw=true" width="200">

Menu button opens up Nav menu:

<em>Nav menu</em>

<img alt="" src="/../../blob/master/ReadME/menu.jpg?raw=true" width="200">

Charts allows you to create interactive charts with a few simple options
(uses dygraph js library)

<em>Chart config</em>

<img alt="" src="/../../blob/master/ReadME/chart%20options.jpg?raw=true" width="200">

Line or bar charts are available

The list of logs is populated from installed sensors

The columns are updated automatically for each log type (supports chirp
and modular types currently)

Optional start and end date choosers

Hit generate to create the chart

<em>Chart display</em>

<img alt="" src="/../../blob/master/ReadME/chartdisplay.jpg?raw=true" width="200">

The chart is interactive, can be pinch and zoomed to look at particular
section more closely

Data can be clicked to get a reading at that point (wip)

Double tap to reset graph for full view

GPIO shows GPIO configuration and allows toggling of relay switches

<em>GPIO config with toggles</em>

<img alt="" src="/../../blob/master/ReadME/gpioconfig.jpg?raw=true" width="200">

Triggers allows the user to view current triggers in the Pigrow system

<em>Trigger list</em>

<img alt="" src="/../../blob/master/ReadME/triggerlist.jpg?raw=true" width="200">

<em>Trigger details</em>

<img alt="" src="/../../blob/master/ReadME/triggerview.jpg?raw=true" width="200">

Triggers can be edited or new ones created

<em>Edit Trigger</em>

<img alt="" src="/../../blob/master/ReadME/triggeredit.jpg?raw=true" width="200">

Sensors information can be viewed (read only)

<em>View sensor details</em>

<img alt="" src="/../../blob/master/ReadME/sensorview.jpg?raw=true" width="200">

Info modules are scripts that are stored in the info modules folder in pigrow, any new scripts added to the folder will be read in info modules and the output of the query displayed in the app. This section currently supports outputs with data displayed on new lines.

<em>Info modules</em>

<img alt="" src="/../../blob/master/ReadME/infomodule.jpg?raw=true" width="200">

App config allowa you to change the config of the application

Change connection congfig

If multiple pigrows are added, switch bewtween them

Delete pigrow config

Edit home page configuration:
Sensor display on/ off
Chart display on/ off
Individual reading display on/ off

Note: Connection info and homepage config have different save buttons

<em>Multi pigrow choice</em>

<img alt="" src="/../../blob/master/ReadME/AppconfigMultipigrow.jpg?raw=true" width="200">

<em>Home page configuaration</em>

<img alt="" src="/../../blob/master/ReadME/homepageconfig.jpg?raw=true" width="200">