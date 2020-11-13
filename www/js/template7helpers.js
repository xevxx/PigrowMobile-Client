/**
 * SPlit a string and return one lelement by index
 */
Template7.registerHelper('split', function (stringFile, options) {
    if (typeof stringFile === 'function') stringFile = stringFile.call(this);
    if (typeof options.hash.delimiter == 'undefined') {
      options.hash['delimiter'] = '_';
    }
    if (options.hash.index != 'undefined') {
      return stringFile.split(options.hash.delimiter)[options.hash.index];
    } else {
      return stringFile.split(options.hash.delimiter);
    }
  });
  
  /**
   * Return reading after filter by homepageconfig
   */
  Template7.registerHelper('display', function (tempKey, options) {
    if (typeof tempKey === 'function') tempKey = tempKey.call(this);
    let keys = tempKey.split('_');
    let propertyName = keys[1];
    let mother = {};
    for (var i = 0; i < options.parents.length; i++) {
      if (options.parents[i].hasOwnProperty(propertyName))
        mother = options.parents[i];
    }
    let retStr = '';
    if (mother[tempKey] == true) {
      retStr += '<li>' + propertyName + ' : ' + mother[propertyName] + '</li>'
    }
  
    return retStr;
  });
  
  /**
   * Init homepage charts using homepage config
   */
  Template7.registerHelper('genChart', function (chartOptions, options) {
    let data = {};
    Object.keys(chartOptions).forEach(function (key) {
      if (key.indexOf('show_') < 0 && key != 'show_Sensor' && key != 'show_Chart' && key != 'sensortype' && key != 'time') {
        if (chartOptions['show_' + key] == true)
          data[key] = chartOptions[key];
      }
    });
    let divName = 'divChart-' + chartOptions.sensortype;
    let chartSettings = {};
    chartSettings['formData'] = {};
    let c = chartSettings['formData'];
    c['columns'] = [];
    c['charttype'] = 'line';
    c['logs'] = chartOptions.sensortype;
    let dt = new Date();
    let yesterday = (d => new Date(d.setDate(d.getDate()-1)) )(new Date);
    c['datestart'] = yesterday.toISOString();
  
    c['dateend'] = dt.toISOString();
    c['selector'] = divName;
    for (let d in data) {
      c['columns'].push(d);
    }
    let json = Base64.encode(JSON.stringify(chartSettings));
    //let div = '<div id="' + divName + '"><img onLoad="GenerateCharts(\'' + json + '\',this);" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" >';
    let div = '<div id="' + divName + '">';
    //let div = '<div id="' + divName + '"><img onerror="GenerateCharts(\'' + json + '\',this);" src="" >';
    div += '</div>'
    setTimeout(function () {
      GenerateCharts('\'' + json + '\'', this);
    }, 0)
    return div;
  });