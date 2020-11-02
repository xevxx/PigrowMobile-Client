// Dom7
var $$ = Dom7;
var testMode = false;

var apiIP = '';
var apiPort = '';
var apiUrl = 'http://' + apiIP + ':' + apiPort;

// Framework7 App main instance
var app  = new Framework7({
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
      chartData: []
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
    pageInit: function() {
      
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

/**
 * Toggle gpio setting
 * @param {element} $ele 
 */
function ToggleGpio($ele) {
  var ele = $$($ele);
  onoff = 'OFF';
  if ($ele.checked)
    onoff = 'ON';
  var gpName =  ele.parent().parent().attr('gpioname');
  var gpio = app.data.config.gpio.find(x => x.name == gpName);
  let gpioSend = {};
  gpioSend['relayName'] = gpio.name;
  gpioSend['direction'] = gpio.direction;
  gpioSend['state'] = gpio.state;
  gpioSend['pin'] = gpio.pin;

  
  let params = {
    'url': apiUrl + '/api/v1/config/setgpio/',
    'method': 'POST',
    'contentType': 'application/json',
    'data': JSON.stringify(gpioSend),
    'processData': false
  }
  app.request.promise(params).then(function(resp) { 
     if (resp) {
      var toastIcon = app.toast.create({
        icon: app.theme === 'ios' ? '<i class="f7-icons">star</i>' : '<i class="material-icons">star</i>',
        text: 'Successful',
        position: 'center',
        closeTimeout: 2000,
      });
      toastIcon.open();

     }
  });
}

/**
 * Populate select options for creating new trigger form
 */
function PopulateCreateTriggerSelect() {
  let selLogs = $$('#logs-createNew');
  var sen = app.data.sensors;
  let selOption;
  selLogs.empty();
  for (let ix=0;ix <sen.length;ix++) {
    let s = sen[ix];
    let logNameSplit = s.log.split('\\').pop().split('/').pop();
    var option = document.createElement("option");
    option.value = logNameSplit;
    option.text = logNameSplit;
    if (ix == 0) {
      option.selected = true;
      selOption = option.value;
    }
    selLogs[0].appendChild(option);
  }
  let smSelct = app.smartSelect.get(selLogs.parent());
  smSelct.setValue([selOption]);
  selLogs[0].value = selOption;
  var selVal = selLogs[0].value;
  let selType = $$('#type-createNew');
  selType.empty();
  var options = ['above','below','window','frame','all'];
  for (let ix=0;ix <options.length;ix++) {
    let opt = options[ix];
    var option = document.createElement("option");
    option.value = opt;
    option.text = opt;
    if (opt.indexOf(selVal) > -1) {
      option.selected = true;
      selOption = option.value;
    }
    selType[0].appendChild(option);
  }  
  smSelct = app.smartSelect.get(selType.parent());
  smSelct.setValue([selOption]);  
  let selSet = $$('#set-createNew');
  selSet.empty();
  var options = ['on','off','pause'];
  for (let ix=0;ix <options.length;ix++) {
    let opt = options[ix];
    var option = document.createElement("option");
    option.value = opt;
    option.text = opt;
    if (opt.indexOf(selVal) > -1) {
      option.selected = true;
      selOption = option.value;
    }
    selSet[0].appendChild(option);
  }  
  smSelct = app.smartSelect.get(selSet.parent());
  smSelct.setValue([selOption]);    
}

/**
 * Open trigger popup
 * @param {string} tName 
 * @param {element} ele 
 */
function OpenTriggerPopup(tName, ele) {
  var el = $$('#triggerPopup-' + tName);
  if (el.length > 1)
    el = $$(el[1]);
  el.find('.editMode').addClass('hide');
  $$(ele).prev().removeClass('hide');
  var trigger;
  for(var i=0; i<app.data.triggers.length-1; i++) {
    let t = app.data.triggers[i];
    if(t.conditionname === tName){
      trigger = t;
      break;
    }
  }
  el.find('.item-label').removeClass('hide');
  el.find('.item-input-wrap').addClass('hide');
  el.find('.smart-select-init').addClass('hide');

  var selects = el.find('.smart-select-init select');
  let smSelct = app.smartSelect.get(el.find('.smart-select-init'));
  for(var i=0; i<selects.length; i++) {
    let $select = $$(selects[i]);
    let $parent = $select.parent();
    $parent.addClass('hide');
    $parent.next().removeClass('hide');
  }
}

/**
 * No used
 * @param {string} tName 
 */
function EditTriggerPopUp(tName) {
  let t = triggers.find(x => x.conditionname == tName);
  let content = '<div class="popup"></div>';
  var dynamicPopup = app.popup.create({
    content: $$('#triggerPopup-' + cName).html(),
    swipeToClose: true
  });
  dynamicPopup.open();

}

/**
 * Setup edit trigger screen, showing inputs, populating selects, hiding labels
 * @param {string} tName 
 * @param {element} ele 
 */
function EditTriggers(tName, ele) {
  var el = $$('.list-' + tName);
  if (el.length > 1)
    el = $$(el[1]);
  el.find('.editMode').removeClass('hide');
  $$(ele).addClass('hide');
  var trigger;
  for(var i=0; i<app.data.triggers.length-1; i++) {
    let t = app.data.triggers[i];
    if(t.conditionname === tName){
      trigger = t;
      break;
    }
  }
  el.find('.item-label').addClass('hide');
  el.find('.item-input-wrap').removeClass('hide');
  el.find('.smart-select-init').removeClass('hide');
  var inputs = el.find('.item-input-wrap input');
  var selectedLog;
  for(var i=0; i<inputs.length; i++) {
    let inpText = $$(inputs[i]).parent().next().text();
    let input = $$(inputs[i]);
    input.val(inpText);
  }
  var selects = el.find('.smart-select-init select');
  let smSelct = app.smartSelect.get(el.find('.smart-select-init'));
  for(var i=0; i<selects.length; i++) {
    let selText = $$(selects[i]).parent().next().find('.item-title').text();
    selText = selText.replace(/[^0-9a-z]/gi, '').toLowerCase();
    let selValue = $$(selects[i]).parent().next().text().split(':');
    if (selValue.length > 1)
      selValue = selValue[1].trim();
    let select = selects[i];
    let $select = $$(select);
    var sen = app.data.sensors;
    var read = app.data.readings;
    
    switch(selText) {
      case 'log':
        $select.empty();
        for (let ix=0;ix <sen.length;ix++) {
          let s = sen[ix];
          let logNameSplit = s.log.split('\\').pop().split('/').pop();
          var option = document.createElement("option");
          option.value = logNameSplit;
          option.text = logNameSplit;
          if (logNameSplit.indexOf(selValue) > -1) {
            option.selected = true;
            selectedLog = selValue;
          }
          select.appendChild(option);
        }
        break;
      case 'valuelabel':
        $select.empty();
        for (let ix=0;ix <read.length;ix++) {
          let r = read[ix];
          
          if (selectedLog.indexOf(r.sensortype)> -1) {
            for(let opt in r) {
              var option = document.createElement("option");
              if (opt != 'sensortype' && opt != 'time') {
                option.value = opt;
                option.text = opt;
                if (opt.indexOf(selValue) > -1) {
                  option.selected = true;
                }
                select.appendChild(option);
              } 
            }
          }
        }
        break;
      case 'type':
        var selVal = $select[0].value;
        $select.empty();
        var options = ['above','below','window','frame','all'];
        for (let ix=0;ix <options.length;ix++) {
          let opt = options[ix];
          var option = document.createElement("option");
          option.value = opt;
          option.text = opt;
          if (opt.indexOf(selVal) > -1) {
            option.selected = true;
          }
          select.appendChild(option);
        }    
        break;
      case 'set':
        var selVal = $select[0].value;
        $select.empty();
        var options = ['on','off','pause'];
        for (let ix=0;ix <options.length;ix++) {
          let opt = options[ix];
          var option = document.createElement("option");
          option.value = opt;
          option.text = opt;
          if (opt.indexOf(selVal) > -1) {
            option.selected = true;
          }
          select.appendChild(option);
        }    
        break;
    }
    
    let $parent = $select.parent();
    $parent.removeClass('hide');
    $parent.next().addClass('hide');
    
  }

}

/**
 * Save updated trigger or save new trigger
 * @param {string} triggerName 
 * @param {bool} isNew 
 */
function SaveTriggers(triggerName, isNew) {
  let obj = {};
  obj['conditionname']= $$('#condName-' + triggerName).val();
  obj['log'] = $$('#logs-' + triggerName).val();
  obj['valuelabel'] = $$('#valuelabel-' + triggerName).val();
  obj['type'] = $$('#type-' + triggerName).val();
  obj['value'] = $$('#value-' + triggerName).val();
  obj['set'] = $$('#set-' + triggerName).val();
  obj['lock'] = $$('#lock-' + triggerName).val();
  obj['cmd'] = $$('#cmd-' + triggerName).val();
  obj['createnew'] = 'False';
  var triggers = app.data.triggers;
  if (!isNew) {
    let t = triggers.find(x => x.conditionname == triggerName);

    const orderedT = {};
    Object.keys(t).sort().forEach(function(key) {
      orderedT[key] = t[key];
    });

    const orderedObj = {};
    Object.keys(obj).sort().forEach(function(key) {
      orderedObj[key] = obj[key];
    });

    
    if (JSON.stringify(t) === JSON.stringify(orderedObj)) {
      alert('No changes made!')
      return;
    }
  }
  else {
    let valid = true;
    let t = triggers.find(x => x.conditionname == obj['conditionname']);
    for (o in obj) {
      if (!obj[o]) {
        valid = false;
        break;
      }
    }
    if (t) {
      alert('Condition name must be unique!')
      return;
    }
    if (valid == false) {
      alert('All fields required!')
      return;
    }

  }
  
  if (isNew == true) {
    obj['createnew'] = 'True';
  }

  let params = {
    'url': apiUrl + '/api/v1/triggers/settrigger',
    'method': 'POST',
    'contentType': 'application/json',
    'data': JSON.stringify(obj),
    'processData': false
  }
  app.preloader.show();
  app.request.promise(params).then(function(resp) {
    app.preloader.hide();
    let successful = 'Successful';
    if (resp.data.toLowerCase().indexOf('false') > -1) {
      successful = 'failure';
    }
      var toastIcon = app.toast.create({
        icon: app.theme === 'ios' ? '<i class="f7-icons">star</i>' : '<i class="material-icons">star</i>',
        text: successful,
        position: 'center',
        closeTimeout: 2000,
      });
      toastIcon.open();
  });
}


/**
 * Populate value label dropdown on log type select
 * @param {element} $ele 
 * @param {bool} fixed 
 */
function SetValueLabelOptions($ele,fixed) {
  var ele = $$($ele);
  var $select;
  if (fixed == true) {
    $select = ele.parent().parent().next().find('select');
  } else {
    $select = ele.parent().parent().parent().find('select[name="valuelabel"]');
  }
  var selectedLog = $ele.value;
  var selValue = $select[0].value;
  var read = app.data.readings;
  $select.empty();
  for (let ix=0;ix <read.length;ix++) {
    let r = read[ix];
    
    if (selectedLog.indexOf(r.sensortype)> -1) {
      for(let opt in r) {
        var option = document.createElement("option");
        if (opt != 'sensortype' && opt != 'time') {
          option.value = opt;
          option.text = opt;
          if (opt.indexOf(selValue) > -1 && !fixed) {
            option.selected = true;
          }
          $select[0].appendChild(option);
        }
        
      
      }
    }
  }
}

/**
 * Reload main page to refresh readings
 */
function LoadReadings() {
  mainView.router.refreshPage();

}

/**
 * Genrate chart based on choices in form
 * Tested chartist (too slow), chartjs (bit slow)
 * Using dygraph, supports line and bar
 * is responsive and allow pinch zoom interactions
 */
function GenerateCharts() {
  let formData = app.form.convertToData('#chartConfig');
  if (formData.length == 0 || formData.logs == "" || formData.columns.length  == 0) {
    alert('Chart type, logs and columns are required fields')
    return false;
  }
  if ((formData.dateend != '' && formData.datestart == '') || (formData.dateend == '' && formData.datestart != '')) {
    alert('Both dates or none must be filled')
    return false;
  }

  let sensors = app.data.sensors;
  let sen = sensors.find(x => x.sensorname == formData.logs);
  app.data.chartData = formData;
  let data = {};
  data['log'] = sen.log;
  data['name'] = formData.logs;
  data['type'] = sen.type;
  data['col'] = formData.columns;
  if (formData.dateend) 
    data['dateend'] = new Date(formData.dateend).toUTCString();
  if (formData.datestart) 
    data['datestart'] = new Date(formData.datestart).toUTCString();
  let params = {
    'url': apiUrl + '/api/v1/data/getcustomlog/',
    'method': 'POST',
    'contentType': 'application/json',
    'data': JSON.stringify(data),
    'processData': false
  }
  app.preloader.show();
  app.request.promise(params).then(function(graph) {
    
    graphData = JSON.parse(graph.data);
    /// chartjs attempt
    // let keys;
    // if (graphData.length>0) {
    //   keys = Object.keys(graphData[0]);
    // }
    // var out = [];
    // keys.forEach(function(k) {
    //   if (k != 'time') {
    //     var output = graphData.map(function(item){
    //       let o = {}
    //       let num;
    //       num = parseFloat(item[k]);
    //       if (num) {
    //         date = Date.parse(item['time']);
    //         o['x'] = new Date(date);
    //         o['y'] =  num;
    //         return o;
    //       }
    //     });
    //     out.push(output);
    //   }
    // });
    // var ctx = document.getElementById('myChartCanvas').getContext('2d');
    // var randomCol = [];
    // out.forEach(function(r){
    //   randomCol.push(getRandomColor());
    // })
    // var chart = new Chart(ctx, {
    //   type: 'line',
    //   data: {datasets:[{
    //       label: 'humid',
    //       data:out[0],
    //       borderColor:[randomCol[0]],
    //       backgroundColor:[randomCol[0]]
    //     },
    //     // {
    //     //   label: 'temp',
    //     //   data:out[1],
    //     //   borderColor:[randomCol[1]],
    //     //   backgroundColor:[randomCol[1]]
    //     // }
    //   ]},
    //   options: {
    //     scales: {
    //       xAxes: [{
    //         offset: true,
    //         type: 'time'
    //       }]
    //     }
    //   }
    // });
    /// dygraph working, line only
    convData = [];
    let keys;
    if (graphData.length>0) {
      keys = Object.keys(graphData[0]);
    }
    var labelsValue = [];
    for (var i=0;i<graphData.length;i++) {
        let r = graphData[i];
        conv = [];
        let date;
        let num;
        keys.forEach(function(k) {
          if (k == 'time') {
            date = Date.parse(r[k]);
            conv.push(new Date(date));
            if (i == 0) {
              labelsValue.push(k);
            }
          } 
        });
        keys.forEach(function(k) {
          if (k != 'time') {
            num = parseFloat(r[k]);
            if (num) {
              conv.push(num);
            }
            if (i == 0) {
              labelsValue.push(k);
            }
          } 
        });
        if (conv.length > 1) {
          convData.push(conv);
        }
    }
    var dygraphData = {};
    dygraphData['labels'] = labelsValue;
    dygraphData['showRoller'] = true;
    dygraphData['rollPeriod'] = 15;
    if (formData.charttype == 'bar') {
      if (labelsValue.length == 2) {
        dygraphData['plotter'] = barChartPlotter;
      }
      else if (labelsValue.length > 2) {
        dygraphData['plotter'] = multiColumnBarPlotter;
      }
    }
    new Dygraph(document.getElementById('myChart'),
      convData,
      dygraphData
    )
    // chartist but slow
    // convData = [];
    // for (var i=0;i<graphData.length;i++) {
    //     let r = graphData[i];
    //     conv = {};
    //     date = Date.parse(r.time);
    //     conv['x'] = new Date(date);
    //     conv['y'] = r.temperature;
    //     convData.push(conv);
    // }zxcvb
    // var series = {'series':[{"data":convData}]};
    // var axisX = {axisX: {
    //   type: Chartist.FixedScaleAxis,
    //   divisor: 5,
    //   labelInterpolationFnc: function(value) {
    //     return moment(value).format('MMM D, hA');
    //   }
    // }}

    // new Chartist.Line('#myChart', series,axisX);

    });
    app.preloader.hide();
}


/**
 * dygraph multicolumn plotter
 * https://dygraphs.com/tests/plotters.html
 * @param {object} e 
 */
// Multiple column bar chart
function multiColumnBarPlotter(e) {
  // We need to handle all the series simultaneously.
  if (e.seriesIndex !== 0) return;

  var g = e.dygraph;
  var ctx = e.drawingContext;
  var sets = e.allSeriesPoints;
  var y_bottom = e.dygraph.toDomYCoord(0);

  // Find the minimum separation between x-values.
  // This determines the bar width.
  var min_sep = Infinity;
  for (var j = 0; j < sets.length; j++) {
    var points = sets[j];
    for (var i = 1; i < points.length; i++) {
      var sep = points[i].canvasx - points[i - 1].canvasx;
      if (sep < min_sep) min_sep = sep;
    }
  }
  var bar_width = Math.floor(2.0 / 3 * min_sep);

  var fillColors = [];
  var strokeColors = g.getColors();
  for (var i = 0; i < strokeColors.length; i++) {
    fillColors.push(darkenColor(strokeColors[i]));
  }

  for (var j = 0; j < sets.length; j++) {
    ctx.fillStyle = fillColors[j];
    ctx.strokeStyle = strokeColors[j];
    for (var i = 0; i < sets[j].length; i++) {
      var p = sets[j][i];
      var center_x = p.canvasx;
      var x_left = center_x - (bar_width / 2) * (1 - j/(sets.length-1));

      ctx.fillRect(x_left, p.canvasy,
          bar_width/sets.length, y_bottom - p.canvasy);

      ctx.strokeRect(x_left, p.canvasy,
          bar_width/sets.length, y_bottom - p.canvasy);
    }
  }
}

/**
 * This function draws bars for a single series. See
 * multiColumnBarPlotter below for a plotter which can draw multi-series
 * bar charts.
 * https://dygraphs.com/tests/plotters.html
 * @param {object} e 
 */
function barChartPlotter(e) {
  var ctx = e.drawingContext;
  var points = e.points;
  var y_bottom = e.dygraph.toDomYCoord(0);

  ctx.fillStyle = darkenColor(e.color);

  // Find the minimum separation between x-values.
  // This determines the bar width.
  var min_sep = Infinity;
  for (var i = 1; i < points.length; i++) {
    var sep = points[i].canvasx - points[i - 1].canvasx;
    if (sep < min_sep) min_sep = sep;
  }
  var bar_width = Math.floor(2.0 / 3 * min_sep);

  // Do the actual plotting.
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var center_x = p.canvasx;

    ctx.fillRect(center_x - bar_width / 2, p.canvasy,
        bar_width, y_bottom - p.canvasy);

    ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
        bar_width, y_bottom - p.canvasy);
  }
}

/**
 * Pie chart plotter for dycharts - didnt work
 * https://varolokan.wordpress.com/2017/04/24/dygraphs-pie-chart-plotter/
 * @param {object} e 
 */
function pieChartPlotter ( e ) {
  var ctx  = e.drawingContext;
  var self = e.dygraph.user_attrs_.myCtx;
  var itm, nme, data = self._pieData;
  if ( ! data )  {
    var t, i, y, all, total = 0;
    data = {};
    all = e.allSeriesPoints; // array of array
    for ( t=0; t<all.length ; t++ )  {
      y = 0;
      itm  = all[t];
      nme  = itm[0].name;
      for ( i=0; i<itm.length; i++ )
        y += itm[i].yval;
      total += y;
      data[nme] = { color : null, y : y };
    }
    data.total = total;
    self._pieData = data;
  }
  if ( data[e.setName] )
       data[e.setName].color = e.color;
  var delta = ctx.canvas.width > ctx.canvas.height ? ctx.canvas.height : ctx.canvas.width;
  var center= parseInt ( delta / 2, 10 );
  var lastend = 0;
  ctx.clearRect ( 0, 0, ctx.canvas.width, ctx.canvas.height );
  for ( var name in data )  {
    itm = data[name];
    if ( self._highlighted === name )
      ctx.fillStyle = "#FF8844";
    else
      ctx.fillStyle = itm.color === null ? "#888888" : itm.color;
    ctx.beginPath ( );
    ctx.moveTo ( ctx.canvas.width/2, ctx.canvas.height/2 );
    ctx.arc ( ctx.canvas.width/2, ctx.canvas.height/2, center/2, lastend, lastend + ( Math.PI * 2 * ( itm.y / data.total ) ), false );
    ctx.lineTo ( ctx.canvas.width/2, ctx.canvas.height/2 );
    ctx.fill ( );
    lastend += Math.PI * 2 * ( itm.y / data.total );
  }
}

/**
 * used in dygrpahs plotters
 * @param {string} colorStr 
 */
function darkenColor(colorStr) {
  // Defined in dygraph-utils.js
  var color = Dygraph.toRGB_(colorStr);
  color.r = Math.floor((255 + color.r) / 2);
  color.g = Math.floor((255 + color.g) / 2);
  color.b = Math.floor((255 + color.b) / 2);
  return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
}

/**
 * Not used
 */
function EnableLongTap() {
  $$('.longTap').on('taphold', function (ele) {
  });
}

/**
 * CHeck cordova ensuring connection
 */
function checkConnection() {
  var networkState = navigator.connection.type;

  var states = {};
  states[Connection.UNKNOWN]  = 'Unknown connection';
  states[Connection.ETHERNET] = 'Ethernet connection';
  states[Connection.WIFI]     = 'WiFi connection';
  states[Connection.CELL_2G]  = 'Cell 2G connection';
  states[Connection.CELL_3G]  = 'Cell 3G connection';
  states[Connection.CELL_4G]  = 'Cell 4G connection';
  states[Connection.CELL]     = 'Cell generic connection';
  states[Connection.NONE]     = 'No network connection';

  var isConnected = true;

  //alert('Connection type: ' + states[networkState]);
  if (states[networkState] == 'No network connection')
  {
    app.dialog.alert("No Internet");
    isConnected = false;
  }

  return isConnected;
}

/**
 * Random color gen
 */
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function SaveConfig() {
  let formData = app.form.convertToData('#appConfig');
  localStorage.setItem('pigrow-ip', formData.ip);
  if (formData.port == '')
    formData.port = '5000';
  localStorage.setItem('pigrow-port', formData.port);
  mainView.router.refreshPage();
}



function GetConfig(fillInputs) {
  var _apiIP = localStorage.getItem('pigrow-ip');
  var _apiPort = localStorage.getItem('pigrow-port');
  if (_apiIP == null || _apiPort == null) {
    return false;
  }
  else {
    if (fillInputs === true) {
      $$('input[name="ip"]').val(_apiIP);
      $$('input[name="port"]').val(_apiPort);
    }
    apiIP = _apiIP;
    apiPort = _apiPort;
    apiUrl = 'http://' + apiIP + ':' + apiPort;
    return true;
  }

}