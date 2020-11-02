routes = [
	{
		path: '/',
		//url: './pages/home.html',
		async: function (routeTo, routeFrom, resolve, reject) {
			//if (!checkConnection())
			//	  return;
			var router = this;
			var readings = []
			var app = router.app;
			var temp = {}
			if (apiIP == '') {
				var works = GetConfig();
				if (!works) {
					resolve(
						{
							componentUrl: './pages/appconfig.html',
						},
						{
							context: {
								stats: temp,
							}
						}
					);
					return;
				}
			}

			app.preloader.show('Searching');
			app.request.json(apiUrl + '/api/v1/config/getallsensors', function (sensors) {
				if (sensors == null) {
					app.preloader.hide()
					app.alert('No sensors');
				} else {
					app.data.sensors = ConvertSensors(sensors);
					var promReadings = []
					for(sensorProp in sensors) {
					let sensor = sensors[sensorProp];
					promReadings.push(new Promise(function(resolve,reject) {
						app.request.promise.json(apiUrl + '/api/v1/config/readsensor/' + sensorProp + '/' + sensor.type, sensorProp).then(function (res) {
						resolve(res.data);
						});	
					}).then(function(data) {
						readings.push(data);
					})
					);
					}
					Promise.all(promReadings).then(() => {
					
						//(readings);
						readings.sort((a,b) => a.sensortype.localeCompare(b.sensortype));
						app.preloader.hide();
						app.data.readings = readings;
						let pageReadings = JSON.parse(JSON.stringify(readings));
						app.data.currentPageData = pageReadings;
						
						resolve(
							{
								componentUrl: './pages/home.html',
							},
							{
								context: {
									stats: pageReadings,
								}
							}
						);
					})
					
				}

			});
		},
		on: {
			pageInit: function (event, page) {
				EnableLongTap()
				var gpio = {};
				var sensors = {};
				var triggers = {};
				var readings = [];
				//LoadReadings();

			},
		}

	},
	{
		path: '/sensors/',
		async: function (routeTo, routeFrom, resolve, reject) {
			//if (!checkConnection())
			//	  return;
			var router = this;
			var app = router.app;
			app.preloader.show('Searching');
			app.request.json(apiUrl + '/api/v1/config/getallsensors', function (resp) {
				if (resp == null) {
					app.preloader.hide()
					app.alert('No sensors');
				} else {
					//resp.sort((a,b) => a.type.localeCompare(b.type));
					var convertedSensors = ConvertSensors(resp);
					app.data.sensors = convertedSensors;
					app.preloader.hide();
					app.data.currentPageData = convertedSensors
					resolve(
						{
							componentUrl: './pages/sensors.html',
						},
						{
							context: {
								sensors: convertedSensors,
							}
						}
					);
				}

			});
		},
		on: {
			pageInit: function (event, page) {
				EnableLongTap();
			}
		}
	},
	{
		path: '/triggers/',
		async: function (routeTo, routeFrom, resolve, reject) {
			//if (!checkConnection())
			//	  return;
			var router = this;
			var app = router.app;
			app.preloader.show('Searching');
			app.request.json(apiUrl + '/api/v1/triggers/getalltriggers', function (trigg) {
				if (trigg == null) {
					app.preloader.hide()
					app.alert('No sensors');
				} else {
					trigg.sort((a,b) => a.conditionname.localeCompare(b.conditionname));
					app.data.triggers = trigg;
					app.preloader.hide();
					app.data.currentPageData = trigg
					resolve(
						{
							componentUrl: './pages/triggers.html',
						},
						{
							context: {
								triggers: trigg,
							}
						}
					);
				}

			});
		},
		on: {
			pageInit: function (event, page) {
				EnableLongTap();
			}
		}
	},
	{
		path: '/config/',
		async: function (routeTo, routeFrom, resolve, reject) {
			//if (!checkConnection())
			//	  return;
			var router = this;
			var app = router.app;
			app.preloader.show('Searching');
			app.request.json(apiUrl + '/api/v1/config/getconfig', function (config) {
				if (config == null) {
					app.preloader.hide()
					app.alert('Failed details');
				} else {
					var gpioCleaned = [];
					config.sensors = ConvertSensors(config.sensors);
					let tempArr = [];
					let keys = Object.keys(config.gpio).sort();

					for (var gpio in config.gpio) {
						let idx = keys.indexOf(gpio);
						if (gpio.indexOf('_on') < 0) {
							let o = {};
							o['name'] = gpio;
							o['pin'] = config.gpio[gpio]
							tempArr.push(o);
							if (keys[idx+1].indexOf('_on') < 0) {
								gpioCleaned.push(o);
								tempArr = [];
							}

						} else {
							let lastIndex = gpio.lastIndexOf('_');
							let sub = gpio.substring(0,lastIndex);
							if (sub == tempArr[0].name) {
								let o = tempArr[0];
								o['direction'] = config.gpio[gpio]
								gpioCleaned.push(o);
								tempArr = [];
							}
								
						}
					}
					let params = {
						'url': apiUrl + '/api/v1/config/checkgpio/',
						'method': 'POST',
						'contentType': 'application/json',
						'data': JSON.stringify(gpioCleaned),
						'processData': false
					}
					app.request.promise(params).then(function(state) {
						app.preloader.hide();
						config.gpio = JSON.parse(state.data);
						app.data.config = config;
						app.data.currentPageData = config
						resolve(
							{
								componentUrl: './pages/config.html',
							},
							{
								context: {
									config: config,
								}
							}
						);
						});

					
					
				}

			});
		},
		on: {
			pageInit: function (event, page) {
				EnableLongTap();
			},
			pageBeforeIn: function (event, page) {
				var gpioDivs = $$('.gpio');
				for(var i=0;i<gpioDivs.length;i++) {
					let gp = $$(gpioDivs[i]);
					var gpName =  gp.attr('gpioname');
					var gpio = app.data.config.gpio.find(x => x.name == gpName);
					var input = gp.find('input[type=checkbox]');
					if (gpio.state == 'ON') {
						input[0].checked = true;
					}
						

				}
			},
		}
	},
	{
		name: 'charts',
		path: '/charts/',
		url: './pages/charts.html',
		on: {
			pageInit: function (event, page) {
				EnableLongTap();
			},
			pageBeforeIn: function (event, page) {
				let sen  = app.data.sensors;
				let sel = $$('select[name="logs"]');
				let smSelct = app.smartSelect.get(sel.parent());
				let selOption;
				for (var i=0;i<sen.length;i++) {
					let s = sen[i];
					var option = document.createElement("option");
					option.value = s.sensorname;
					option.text = s.sensorname;
					if (i == 0) {
						option.selected = true;
						selOption = option.value;
						
					}
					sel[0].appendChild(option);
				}
				smSelct.setValue([selOption]);

				PopulateValueLabels('select[name="columns"]',sel);
			},
		}
	},
	{
		name: 'appconfig',
		path: '/appconfig/',
		//url: './pages/appconfig.html',
		async: function (routeTo, routeFrom, resolve, reject) {
			var temp = {};
			resolve(
				{
					componentUrl: './pages/appconfig.html',
				},
				{
					context: {
						stats: temp,
					}
				}
			);
		},
		on: {
			pageInit: function (event, page) {
				GetConfig(true);
			},
			pageBeforeIn: function (event, page) {
				
			},
		}
	},
	// Default route (404 page). MUST BE THE LAST
	{
		path: '(.*)',
		url: './pages/404.html',
	},
];

function PopulateValueLabels($ele, $masterSel) {
	ele = $$($ele);
	let masterSel = $$($masterSel);
	let selLog = masterSel.val();
	ele.empty();
	let smSelct = app.smartSelect.get(ele.parent());
	smSelct.setValue([]);
	let read = app.data.readings;
	for (let ix=0;ix <read.length;ix++) {
		let r = read[ix];
		
		if (selLog.indexOf(r.sensortype)> -1) {
			for(let opt in r) {
				var option = document.createElement("option");
				if (opt != 'sensortype' && opt != 'time') {
					option.value = opt;
					option.text = opt;
					ele[0].appendChild(option);
				} 
			}
		}
	}
}

function ConvertSensors(resp) {
	let convertedSensors = [];
	for (var sen in resp) {
		var o = {}
		o['sensorname'] = sen;
		let prop = resp[sen];
		for (var p in prop ) {
			o[p] = prop[p];
		}
		convertedSensors.push(o);
	}
	return convertedSensors;
}