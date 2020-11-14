/**
 * Toggle gpio setting
 * @param {element} $ele 
 */
function ToggleGpio($ele) {
    var ele = $$($ele);
    onoff = 'OFF';
    if ($ele.checked)
        onoff = 'ON';
    var gpName = ele.parent().parent().attr('gpioname');
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
    app.request.promise(params).then(function (resp) {
        if (resp) {
            let successful = 'Successful';
            let icon = '<i class="fa fa-star"></i>';
            if (resp.data.toLowerCase().indexOf('false') > -1) {
                successful = 'failure';
                icon = '<i class="fa fa-ban"></i>'
            }
            var toastIcon = app.toast.create({
                icon: icon,
                text: successful,
                position: 'center',
                closeTimeout: 2000,
            });
            toastIcon.open();

        }
    }).catch(function(err) {
        app.dialog.alert(err.message);
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
    for (let ix = 0; ix < sen.length; ix++) {
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
    var options = ['above', 'below', 'window', 'frame', 'all'];
    for (let ix = 0; ix < options.length; ix++) {
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
    var options = ['on', 'off', 'pause'];
    for (let ix = 0; ix < options.length; ix++) {
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
    $$(ele).prev().prev().removeClass('hide');
    var trigger;
    for (var i = 0; i < app.data.triggers.length - 1; i++) {
        let t = app.data.triggers[i];
        if (t.conditionname === tName) {
            trigger = t;
            break;
        }
    }
    el.find('.item-label').removeClass('hide');
    el.find('.item-input-wrap').addClass('hide');
    el.find('.smart-select-init').addClass('hide');

    var selects = el.find('.smart-select-init select');
    let smSelct = app.smartSelect.get(el.find('.smart-select-init'));
    for (var i = 0; i < selects.length; i++) {
        let $select = $$(selects[i]);
        let $parent = $select.parent();
        $parent.addClass('hide');
        $parent.next().removeClass('hide');
    }
}

/**
 * Not used
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
    $$(ele).next().addClass('hide');
    var trigger;
    for (var i = 0; i < app.data.triggers.length - 1; i++) {
        let t = app.data.triggers[i];
        if (t.conditionname === tName) {
            trigger = t;
            break;
        }
    }
    el.find('.item-label').addClass('hide');
    el.find('.item-input-wrap').removeClass('hide');
    el.find('.smart-select-init').removeClass('hide');
    var inputs = el.find('.item-input-wrap input');
    var selectedLog;
    for (var i = 0; i < inputs.length; i++) {
        let inpText = $$(inputs[i]).parent().next().text();
        let input = $$(inputs[i]);
        input.val(inpText);
    }
    var selects = el.find('.smart-select-init select');
    let smSelct = app.smartSelect.get(el.find('.smart-select-init'));
    for (var i = 0; i < selects.length; i++) {
        let selText = $$(selects[i]).parent().next().find('.item-title').text();
        selText = selText.replace(/[^0-9a-z]/gi, '').toLowerCase();
        let selValue = $$(selects[i]).parent().next().text().split(':');
        if (selValue.length > 1)
            selValue = selValue[1].trim();
        let select = selects[i];
        let $select = $$(select);
        var sen = app.data.sensors;
        var read = app.data.readings;

        switch (selText) {
            case 'log':
                $select.empty();
                for (let ix = 0; ix < sen.length; ix++) {
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
                for (let ix = 0; ix < read.length; ix++) {
                    let r = read[ix];

                    if (selectedLog.indexOf(r.sensortype) > -1) {
                        for (let opt in r) {
                            var option = document.createElement("option");
                            if (opt != 'sensortype' && opt != 'time') {
                                option.value = opt;
                                option.text = opt;
                                if (opt.indexOf(selValue) > -1) {
                                    //option.selected = true;

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
                var options = ['above', 'below', 'window', 'frame', 'all'];
                for (let ix = 0; ix < options.length; ix++) {
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
                var options = ['on', 'off', 'pause'];
                for (let ix = 0; ix < options.length; ix++) {
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
    obj['conditionname'] = $$('#condName-' + triggerName).val();
    if (isNew) {
        let matchTrigger = app.data.triggers.find(x => x.conditionname == triggerName);
        if (matchTrigger) {
            app.dialog.alert('Trigger name must be unique');
            return;
        }
    }
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
        Object.keys(t).sort().forEach(function (key) {
            orderedT[key] = t[key];
        });

        const orderedObj = {};
        Object.keys(obj).sort().forEach(function (key) {
            orderedObj[key] = obj[key];
        });


        if (JSON.stringify(t) === JSON.stringify(orderedObj)) {
            app.dialog.alert('No changes made!')
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
            app.dialog.alert('Condition name must be unique!')
            return;
        }
        if (valid == false) {
            app.dialog.alert('All fields required!')
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

    app.request.promise(params).then(function (resp) {
        app.preloader.hide();
        let successful = 'Successful';
        let icon = '<i class="fa fa-star"></i>';
        if (resp.data.toLowerCase().indexOf('false') > -1) {
            successful = 'failure';
            icon = '<i class="fa fa-ban"></i>'
        }
        var toastIcon = app.toast.create({
            icon: icon,
            text: successful,
            position: 'center',
            closeTimeout: 2000,
        });
        toastIcon.open();
        $$('#closeTriggerPopup')[0].click();
        app.views.main.router.navigate({ path: '/triggers/' }, {
            ignoreCache: true,
            reloadCurrent: true
        })
    }).catch(function (err) {
        var toastIcon = app.toast.create({
            icon: '<i class="fa fa-ban"></i>',
            text: err,
            position: 'center',
            closeTimeout: 5000,
        });
    });
}

/**
 * Delete a trigger and refresh list if successful
 * @param {string} tName 
 * @param {element} $ele 
 */
function DeleteTrigger(tName, $ele) {
    var trigger;
    app.dialog.confirm('Are you sure?, cannot be recovered!', function () {
        for (var i = 0; i < app.data.triggers.length; i++) {
            let t = app.data.triggers[i];
            if (t.conditionname === tName) {
                trigger = t;
                break;
            }
        }
        let obj = {};
        obj['conditionname'] = trigger.conditionname;
        let params = {
            'url': apiUrl + '/api/v1/triggers/deletetrigger',
            'method': 'POST',
            'contentType': 'application/json',
            'data': JSON.stringify(obj),
            'processData': false
        }
        app.preloader.show();

        app.request.promise(params).then(function (resp) {
            app.preloader.hide();
            let icon = '<i class="fa fa-star"></i>';
            let successful = 'Successful';
            if (resp.data.toLowerCase().indexOf('false') > -1) {
                successful = 'failure';
                icon = '<i class="fa fa-ban"></i>'
            }
            var toastIcon = app.toast.create({
                icon: icon,
                text: successful,
                position: 'center',
                closeTimeout: 2000,
            });
            toastIcon.open();
            $$('#closeTriggerPopup')[0].click();
            app.views.main.router.navigate({ path: '/triggers/' }, {
                ignoreCache: true,
                reloadCurrent: true
            })
        }).catch(function (err) {
            var toastIcon = app.toast.create({
                icon: '<i class="fa fa-ban"></i>',
                text: err,
                position: 'center',
                closeTimeout: 5000,
            });
        });



    })
}


/**
 * Populate value label dropdown on log type select
 * @param {element} $ele 
 * @param {bool} fixed 
 */
function SetValueLabelOptions($ele, fixed) {
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
    for (let ix = 0; ix < read.length; ix++) {
        let r = read[ix];

        if (selectedLog.indexOf(r.sensortype) > -1) {
            var option = document.createElement("option");
            option.value == '';
            option.selected = true;
            option.disabled = true;
            option.text = '--select--';
            $select[0].appendChild(option);
            for (let opt in r) {
                option = document.createElement("option");
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

    let smSelct = app.smartSelect.get($select.parent());
    smSelct.unsetValue();
}

/**
 * Reload main page to refresh readings
 */
function LoadReadings() {
    mainView.router.refreshPage();

}


 /**
  * Generate chart based on choices in form
  * Tested chartist (too slow), chartjs (bit slow)
  * Using dygraph, supports line and bar
  * is responsive and allow pinch zoom interactions
  * 
  * Params are optional (used for homepage charts)
  * @param {base64 stringified JSON} chartOptions 
  * @param {element} ele 
  */
function GenerateCharts(chartOptions, ele) {
    var formData;
    if (chartOptions) {
        chartOptions = JSON.parse(Base64.decode(chartOptions));
        formData = chartOptions.formData;
        if (ele)
            ele.onload = null;
    }
    else {
        formData = app.form.convertToData('#chartConfig');
        if (formData.length == 0 || formData.logs == "" || formData.columns.length == 0) {
            app.dialog.alert('Chart type, logs and columns are required fields')
            return false;
        }
        if ((formData.dateend != '' && formData.datestart == '') || (formData.dateend == '' && formData.datestart != '')) {
            app.dialig.alert('Both dates or none must be filled')
            return false;
        }
    }

    let sensors = app.data.sensors;
    let sen = sensors.find(x => x.sensorname == formData.logs);
    app.data.chartData = formData;
    let data = {};
    data['log'] = sen.log;
    data['name'] = formData.logs;
    data['type'] = sen.type;
    data['col'] = formData.columns;
    if (formData.selector)
        data['selector'] = formData.selector;
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
    app.request.promise(params).then(function (graph) {
        var d = JSON.parse(graph.xhr.requestParameters.data)
        var selector = 'myChart';
        if (d.hasOwnProperty('selector'))
            selector = d.selector;

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
        if (graphData.length > 0) {
            keys = Object.keys(graphData[0]);
        }
        var labelsValue = [];
        for (var i = 0; i < graphData.length; i++) {
            let r = graphData[i];
            conv = [];
            let date;
            let num;
            keys.forEach(function (k) {
                if (k == 'time') {
                    date = Date.parse(r[k]);
                    conv.push(new Date(date));
                    if (i == 0) {
                        labelsValue.push(k);
                    }
                }
            });
            keys.forEach(function (k) {
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
        //dygraphData['drawPoints'] = true,
        dygraphData['legend'] = 'always';
        dygraphData['interactionModel'] = {
            mousedown: Dygraph.defaultInteractionModel.mousedown,
            mousemove: Dygraph.defaultInteractionModel.mousemove,
            mouseup: Dygraph.defaultInteractionModel.mouseup,
            touchstart: newDygraphTouchstart,
            touchend: Dygraph.defaultInteractionModel.touchend,
            touchmove: Dygraph.defaultInteractionModel.touchmove
        };
        //dygraphData['width'] = 'auto';
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
        ResizeGraphContainer();

        new Dygraph(document.getElementById(selector),
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

    }).catch(function(err) {
        app.dialog.alert(err.message);
    });
    app.preloader.hide();
}

function ResizeGraphContainer() {
    let pc = $$('.page-current');
    let myChart = $$('#myChart');
    let w = pc.width();
    myChart.css('width', w - 50 + 'px');
}

/**
 * https://www.technogumbo.com/2013/04/Dygraphs-Tablet-and-Phone-Custom-Interaction-Touch-Point-Selection/
 * Enables touch point legend on mobile on top of hover on desktop
 * @param {event} event 
 * @param {dygraph object} g 
 * @param {context} context 
 */
function newDygraphTouchstart(event, g, context) {
    // This right here is what prevents IOS from doing its own zoom/touch behavior
    // It stops the node from being selected too
    event.preventDefault(); // touch browsers are all nice.

    if (event.touches.length > 1) {
        // If the user ever puts two fingers down, it's not a double tap.
        context.startTimeForDoubleTapMs = null;
    }

    var touches = [];
    for (var i = 0; i < event.touches.length; i++) {
        var t = event.touches[i];
        // we dispense with 'dragGetX_' because all touchBrowsers support pageX
        touches.push({
            pageX: t.pageX,
            pageY: t.pageY,
            dataX: g.toDataXCoord(t.pageX),
            dataY: g.toDataYCoord(t.pageY)
            // identifier: t.identifier
        });
    }
    context.initialTouches = touches;

    if (touches.length == 1) {
        // This is just a swipe.
        context.initialPinchCenter = touches[0];
        context.touchDirections = { x: true, y: true };

        // ADDITION - this needs to select the points
        var closestTouchP = g.findClosestPoint(touches[0].pageX, touches[0].pageY);
        if (closestTouchP) {
            var selectionChanged = g.setSelection(closestTouchP.row, closestTouchP.seriesName);
        }
        g.mouseMove_(event);

    } else if (touches.length >= 2) {
        // It's become a pinch!
        // In case there are 3+ touches, we ignore all but the "first" two.

        // only screen coordinates can be averaged (data coords could be log scale).
        context.initialPinchCenter = {
            pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
            pageY: 0.5 * (touches[0].pageY + touches[1].pageY),

            // TODO(danvk): remove
            dataX: 0.5 * (touches[0].dataX + touches[1].dataX),
            dataY: 0.5 * (touches[0].dataY + touches[1].dataY)
        };

        // Make pinches in a 45-degree swath around either axis 1-dimensional zooms.
        var initialAngle = 180 / Math.PI * Math.atan2(
            context.initialPinchCenter.pageY - touches[0].pageY,
            touches[0].pageX - context.initialPinchCenter.pageX);

        // use symmetry to get it into the first quadrant.
        initialAngle = Math.abs(initialAngle);
        if (initialAngle > 90) initialAngle = 90 - initialAngle;

        context.touchDirections = {
            x: (initialAngle < (90 - 45 / 2)),
            y: (initialAngle > 45 / 2)
        };
    }

    // save the full x & y ranges.
    context.initialRange = {
        x: g.xAxisRange(),
        y: g.yAxisRange()
    };
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
            var x_left = center_x - (bar_width / 2) * (1 - j / (sets.length - 1));

            ctx.fillRect(x_left, p.canvasy,
                bar_width / sets.length, y_bottom - p.canvasy);

            ctx.strokeRect(x_left, p.canvasy,
                bar_width / sets.length, y_bottom - p.canvasy);
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
function pieChartPlotter(e) {
    var ctx = e.drawingContext;
    var self = e.dygraph.user_attrs_.myCtx;
    var itm, nme, data = self._pieData;
    if (!data) {
        var t, i, y, all, total = 0;
        data = {};
        all = e.allSeriesPoints; // array of array
        for (t = 0; t < all.length; t++) {
            y = 0;
            itm = all[t];
            nme = itm[0].name;
            for (i = 0; i < itm.length; i++)
                y += itm[i].yval;
            total += y;
            data[nme] = { color: null, y: y };
        }
        data.total = total;
        self._pieData = data;
    }
    if (data[e.setName])
        data[e.setName].color = e.color;
    var delta = ctx.canvas.width > ctx.canvas.height ? ctx.canvas.height : ctx.canvas.width;
    var center = parseInt(delta / 2, 10);
    var lastend = 0;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var name in data) {
        itm = data[name];
        if (self._highlighted === name)
            ctx.fillStyle = "#FF8844";
        else
            ctx.fillStyle = itm.color === null ? "#888888" : itm.color;
        ctx.beginPath();
        ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, center / 2, lastend, lastend + (Math.PI * 2 * (itm.y / data.total)), false);
        ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.fill();
        lastend += Math.PI * 2 * (itm.y / data.total);
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
 * Check cordova ensuring connection
 */
function checkConnection() {
    var networkState = navigator.connection.effectiveType;

    // var states = {};
    // states[Connection.UNKNOWN]  = 'Unknown connection';
    // states[Connection.ETHERNET] = 'Ethernet connection';
    // states[Connection.WIFI]     = 'WiFi connection';
    // states[Connection.CELL_2G]  = 'Cell 2G connection';
    // states[Connection.CELL_3G]  = 'Cell 3G connection';
    // states[Connection.CELL_4G]  = 'Cell 4G connection';
    // states[Connection.CELL]     = 'Cell generic connection';
    // states[Connection.NONE]     = 'No network connection';

    var isConnected = navigator.onLine;

    //alert('Connection type: ' + states[networkState]);
    //if (states[networkState] == 'No network connection')
    if (!isConnected) {
        //app.dialog.alert("No Network");
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

/**
 * Save new pigrow config/connection
 */
function SaveConfig() {
    let formData = app.form.convertToData('#frmAppConfig');
    if (formData.port == '')
        formData.port = 5000;
    apiUrl = 'http://' + formData.ip + ':' + formData.port;
    let params = {
        'url': apiUrl + '/api/v1/config/getpigrowname',
        'method': 'GET',
        'timeout': 3000,
        'contentType': 'application/json',
        'processData': false
    }
    app.request.promise(params).then(function (piname) {
        app.preloader.hide();
        let formData = app.form.convertToData('#frmAppConfig');
        if (formData.port == '')
            formData.port = 5000;
        piName = JSON.parse(piname.data);
        let pigrowNewConfig = {}
        let pigrowConfig;
        pigrowNewConfig['piname'] = piName.pigrowname;
        pigrowNewConfig['ip'] = formData.ip;
        pigrowNewConfig['port'] = formData.port;
        pigrowNewConfig['default'] = formData.default[0] == 'on' || formData.default[0] == '' ? 'on' : 'off';
        let pigrowConfigString = localStorage.getItem('pigrow-config');
        if (pigrowConfigString) {
            pigrowConfig = JSON.parse(pigrowConfigString);
            if (pigrowConfig.length > 0) {
                if (Object.keys(pigrowConfig[0].pigrowConfig).length == 0)
                    pigrowNewConfig['default'] = 'on';
            }
            let pc = pigrowConfig.find(x => x.pigrowConfig.piname == piName.pigrowname);

            if (pc) {
                pc.pigrowConfig = pigrowNewConfig;

            }
            else {
                if (pigrowConfig.length == 1) {
                    if (Object.keys(pigrowConfig[0].pigrowConfig).length == 0) {
                        pigrowConfig[0].pigrowConfig = pigrowNewConfig;
                        apiPiName = piName.pigrowname;
                    } else {
                        let newObj = {};
                        newObj['pigrowConfig'] = pigrowNewConfig;
                        pigrowConfig.push(newObj);
                    }
                } else {
                    let newObj = {};
                    newObj['pigrowConfig'] = pigrowNewConfig;
                    pigrowConfig.push(newObj);
                }

                //localStorage.setItem('pigrow-config', JSON.stringify(pigrowConfig));
            }

            if (pigrowNewConfig['default'] == 'on') {
                let curDefaultArr = pigrowConfig.filter(x => x.pigrowConfig.default == 'on');
                if (curDefaultArr) {
                    for (let i = 0; i < curDefaultArr.length; i++) {
                        let curDefault = curDefaultArr[i];
                        if (curDefault.pigrowConfig.piname != pigrowNewConfig.piname) {
                            let cd = pigrowConfig.find(x => x.pigrowConfig.piname == curDefault.pigrowConfig.piname)
                            if (cd)
                                cd.pigrowConfig.default = 'off';
                        }
                    }
                }
            }
            localStorage.setItem('pigrow-config', JSON.stringify(pigrowConfig));

        }

        if (pigrowConfig.length == 1)
            mainView.router.refreshPage();
        else if (pigrowConfig.length > 1) {
            app.views.main.router.navigate({ path: '/appconfig/' }, {
                ignoreCache: true,
                reloadCurrent: true
            })
        }
    }).catch(function (err) {
        app.preloader.hide();
        app.dialog.alert('Server: ' + apiUrl + ' not contactable\n' + err.message);
    })
}



/**
 * Get Config on pageload for connection details
 * @param {bool} fillInputs 
 */
function GetConfig(fillInputs) {
    let pigrowConfig;
    let pigrowConfigString = localStorage.getItem('pigrow-config');
    if (pigrowConfigString) {
        pigrowConfig = JSON.parse(pigrowConfigString);
        var pc;
        for (let i = 0; i < pigrowConfig.length; i++) {
            let pigC = pigrowConfig[i].pigrowConfig;
            let isPc = pigC.default == 'on';
            if (!isPc && pigrowConfig.length == 1) {
                pc = pigC;
                break;
            }
            else if (isPc) {
                pc = pigC;
                break;
            }
        }

        // else {
        //   return false;
        // }
        var _apiIP = pc.ip;
        var _apiPort = pc.port;

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
            apiPiName = pc.piname;
            return true;
        }
    }
    else {
        return false;
    }
}

/**
 * Get info modules data result
 * Infomodules are a section of Pigrow allowing user to create their own scripts and display text results in the app
 * Mobile only currently supports text responses on new lines
 * @param element $ele 
 */
function GetInfo($ele) {
    let infoModules = app.data.infoModules;
    let val = $ele.value;
    var im = infoModules.find(x => x.id == val);
    let ele = $$('.infoModulePlaceholder');
    app.preloader.show();
    if (val == '-1') {
        app.preloader.hide();
        ele.empty();
    }
    else {
        app.request.promise.get(apiUrl + '/api/v1/config/getinfo/' + im.relPath).then(function (res) {
            app.preloader.hide();
            let html = res.data.replace('\n', '</br>')
            let ele = $$('.infoModulePlaceholder');
            ele.empty();
            ele.html('<p class="item-content">' + html + '</p>');
        })
    }
}

/**
 * Load config form for homepage for pigrow selected
 * @param {string} piName  - name of pigrow instance
 */
function LoadSettingsForm(piName) {
    let pigrowConfig = app.data.pigrowConfig;
    if (pigrowConfig.length > 0) {
        let curConfig = pigrowConfig.find(x => x.pigrowConfig.piname == piName);
        app.form.fillFromData('#frmAppConfig', curConfig.pigrowConfig);
        $$('.ipForm').removeClass('hide');

        let curHome = curConfig.homePageConfig;
        var html = '<div class="block-title">Home page configuration</div>';
        var title = '';

        var containerHtmlEnd = '</div></div>';

        for (var i = 0; i < curHome.sensors.length; i++) {
            let ht = '';
            let sen = curHome.sensors[i];
            title = sen.sensorname;
            let options = curHome.sensorOptions[sen.sensorname];
            let showSensor = sen.checked ? 'checked' : '';
            let showChart = sen.chart ? 'checked' : '';
            var containerHtmlStart =
                '<div class="card card-outline">' +
                '<div class="card-header">' + title +
                '<p>' + '<label class="checkbox"><input onchange="DisableRest(this)" name="s..' + sen.sensorname + '_checked' + '" type="checkbox" ' + showSensor + '><i class="icon-checkbox"></i></label>' + ' Show sensor' + '</p>';
            let middle = '<p>' + '  <label class="checkbox"><input name="s..' + sen.sensorname + '_chart' + '" type="checkbox" ' + showChart + '><i class="icon-checkbox"></i></label>' + ' Show chart' + '</p>';
            if (!showSensor)
                middle = '<p>' + '  <label class="checkbox opacity-05"><input disabled name="s..' + sen.sensorname + '_chart' + '" type="checkbox" ' + showChart + '><i class="icon-checkbox"></i></label>' + ' Show chart' + '</p>';
            containerHtmlStart += middle;
            containerHtmlStart += '</div>' +
                '<div class="card-content card-content-padding">';
            ht += containerHtmlStart;
            options.forEach(function (opt) {
                let checked = opt.checked ? 'checked' : '';
                let cb = '<div>' + '<label class="checkbox"><input name="so..' + sen.sensorname + '_' + opt.measurement + '" type="checkbox" ' + checked + '><i class="icon-checkbox"></i></label> ' + opt.measurement + '</div>';
                if (!showSensor)
                    cb = '<div>' + '<label class="checkbox opacity-05"><input disabled name="so..' + sen.sensorname + '_' + opt.measurement + '" type="checkbox" ' + checked + '><i class="icon-checkbox"></i></label> ' + opt.measurement + '</div>';
                ht += cb;
            })
            ht += containerHtmlEnd;
            html += ht;
        }
        let homeConfigFrm = $$('.homeConfigFrm');
        homeConfigFrm.empty();
        homeConfigFrm.html(html);
        $$('.homeConfigFrm-btns').removeClass('hide');
    }
}

/**
 * Set specific pigrow as current for session - will revert to default on app reload
 * @param {string} piName 
 */
function MakeCurrent(piName) {
    let selConfig = app.data.pigrowConfig.find(x => x.pigrowConfig.piname == piName);
    if (selConfig) {
        let pc = selConfig.pigrowConfig;
        apiUrl = 'http://' + pc.ip + ':' + pc.port;
        apiPiName = piName;
        app.views.main.router.navigate({ path: '/' });
    }
    else {
        app.dialog.alert('Route not found!');
    }

}

/**
 * Show form for new pigrow connection
 */
function AddNewPigrow() {
    CancelConfig();
    $$('.ipForm').removeClass('hide');
}

/**
 * close form for either connection or homepageconfig
 * @param {string} eleName 
 */
function CancelConfig(eleName) {
    if (eleName == 'connection') {
        $$('input[name="ip').val('');
        $$('input[name="port').val('');
        $$('input[name="default').val('');
        $$('.ipForm').addClass('hide')
    }
    else if (eleName == 'homepage') {
        $$('.homeConfigFrm').html('');
        $$('.homeConfigFrm-btns').addClass('hide');
    }
}

/**
 * Delete spcific pigrow instance from app
 * @param {string} piName 
 */
function DeletePigrow(piName) {
    app.dialog.confirm('Are you sure? data cannot be recovered!', function () {
        let itemToRemoveIndex = app.data.pigrowConfig.findIndex(function (item) {
            return item.pigrowConfig.piname == piName;
        });

        // proceed to remove an item only if it exists.
        if (itemToRemoveIndex !== -1) {
            app.data.pigrowConfig.splice(itemToRemoveIndex, 1);
            if (app.data.pigrowConfig.length > 0) {
                localStorage.setItem('pigrow-config', JSON.stringify(app.data.pigrowConfig));
                app.views.main.router.navigate(app.view.main.router.currentRoute.url, {
                    ignoreCache: true,
                    reloadCurrent: true
                })
            }
            else {
                localStorage.removeItem('pigrow-config');
                apiIP = '';
                app.views.main.router.navigate({ path: '/' }, {
                    ignoreCache: true,
                    reloadCurrent: true
                })
            }
        }

    });
}

/**
 * Save home page config
 */
function SaveHomePageConfig() {
    let inputs = $$('.homeConfigFrm').find('input');
    let pConfig = app.data.pigrowConfig;
    for (let i = 0; i < inputs.length; i++) {
        let input = $$(inputs[i]);
        let id = input[0].name;
        let firstSplit = id.split('..');
        let inpType = firstSplit[0];
        let details = firstSplit[1].split('_');
        let sensorname = details[0];
        var inp;
        if (inpType == 's') {
            inp = pConfig.find(x => x.homePageConfig.sensors.sensorname = details[0]);
            let sen = inp.homePageConfig.sensors.find(x => x.sensorname == details[0]);
            sen[details[1]] = input[0].checked;
        }
        else if (inpType == 'so') {
            inp = pConfig.find(x => x.homePageConfig.sensors.sensorname = details[0]);
            let seno = inp.homePageConfig.sensorOptions[details[0]];
            let o = seno.find(x => x.measurement == details[1]);
            o.checked = input[0].checked;
        }

    }
    localStorage.setItem('pigrow-config', JSON.stringify(pConfig));
    var toastIcon = app.toast.create({
        icon: '<i class="fa fa-star"></i>',
        text: 'Successful',
        position: 'center',
        closeTimeout: 2000,
    });
    toastIcon.open();
    app.views.main.router.navigate(app.view.main.router.currentRoute.url, {
        ignoreCache: true,
        reloadCurrent: true
    })

}

/**
 * Disable checkboxes in homepageconfig form if sensor is unchecked for display
 * @param {element} $ele 
 */
function DisableRest($ele) {
    let ele = $$($ele);
    let container = ele.parent().parent().parent().next();
    let inputs = container.find('input');
    let checked = $ele.checked;
    let el = ele.parent().parent().parent().find('p input');
    var chartEl;
    el.forEach(function (e) {
        $e = $$(e);
        if (e != $ele) {
            chartEl = e;
            if (checked) {
                if (chartEl != $ele) {
                    $e.removeAttr('disabled');
                    $e.parent().removeClass('opacity-05');
                }

            }
            else {
                if (chartEl != $ele) {
                    $e.attr('disabled', true);
                    $e.parent().addClass('opacity-05');
                }
            }
        }
    })

    inputs.forEach(function (inp) {
        let ip = $$(inp);
        if (inp != $ele) {
            if (checked) {
                ip.removeAttr('disabled');
                ip.parent().removeClass('opacity-05');
            }
            else {
                ip.attr('disabled', true);
                ip.parent().addClass('opacity-05');
            }
        }
    })
}


