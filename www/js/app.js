// Dom7
var $$ = Dom7;
var testMode = false;

var apiIP = '';
var apiPort = '';
var apiUrl = 'http://' + apiIP + ':' + apiPort;
var apiPiName = '';



// Framework7 App main instance
var app = new Framework7({
  root: '#app',
  id: 'io.framework7.pigrow-mobile', // App bundle ID
  name: 'pigrow-mobile',
  theme: 'auto',
  routes: routes,
  dialog: {
    title: 'Pigrow Mobile'
  },
  data: function () {
    return {
      sensors: [],
      config: [],
      gpio: [],
      readings: [],
      chartData: [],
      infoModules: [],
      pigrowConfig: []
    }
  },
  touch: {
    fastClicks: true,
    tapHold: true
  },
  panel: {
    swipe: true,
    visibleBreakpoint: 1024,
  },
  on: {
    pageInit: function () {

    }
  },
  smartSelect: {
    pageTitle: 'Select Option',
    openIn: 'popup',
    routableModals: false
  }
});


// Init/Create main view
var mainView = app.views.create('.view-main', {
  url: '/'
});

$$(document).on('deviceready', function deviceIsReady() {
  console.log('Device is ready!');

});
$$(document).on('submit', 'readingsFrm', readingsRefresh);
function readingsRefresh(e) {
  if (!checkConnection())
    return;
  mainView.router.refreshPage();
}

window.addEventListener("orientationchange", function () {
  ResizeGraphContainer();
});


window.addEventListener("resize", function () {
  ResizeGraphContainer();
});

