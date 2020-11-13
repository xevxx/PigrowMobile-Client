var routingHelpers = new function() {
	this.PopulateValueLabels = function($ele, $masterSel) {
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
	this.ConvertSensors = function(resp) {
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

};

routes = [
	{
		path: '/',
		//url: './pages/home.html',
		async: function (routeTo, routeFrom, resolve, reject) {
			if (!checkConnection())
				  return;
			var router = this;
			var readings = []
			var app = router.app;
			var temp = {}
			if (apiIP == '') {
				var works = GetConfig();
				if (!works) {
					app.views.main.router.navigate({path:'/appconfig/'});
					var pigrowConfig = localStorage.getItem('pigrow-config');
					if (pigrowConfig) {
						pigrowConfig = JSON.parse(pigrowConfig);
					}
					// let appConfig = [];
					let pigrows = {}
					pigrows['pigrows'] = pigrowConfig;
					// appConfig.push(cc);					
					resolve(
						{
							componentUrl: './pages/appconfig.html',
						},
						{
							context: {
								appConfig: pigrows,
							}
						}
					);
					return;
				}
			}

			app.preloader.show('Searching');
			let params = {
				'url': apiUrl + '/api/v1/config/getallsensors',
				'method': 'GET',
				'timeout': 3000,
				'contentType': 'application/json',
				'processData': false
			  }
			app.request.promise(params)
				.then(function(sensorsFull) { 
					if (sensorsFull == null) {
						app.preloader.hide()
						app.alert('No sensors');
					} else {
						let sensors;
						if (typeof sensorsFull.data == 'string')
							sensors = JSON.parse(sensorsFull.data);
						app.data.sensors = routingHelpers.ConvertSensors(sensors);
						var promReadings = []
						for(sensorProp in sensors) {
							let sensor = sensors[sensorProp];
							if (sensor.type && typeof sensor.type != 'undefined' ) { 
								promReadings.push(new Promise(function(resolve,reject) {
									app.request.promise.json(apiUrl + '/api/v1/config/readsensor/' + sensorProp + '/' + sensor.type).then(function (res) {
									resolve(res.data);
									});	
								}).then(function(data) {
									readings.push(data);
								})
								);
							} else {
								var toastIcon = app.toast.create({
									icon: '<i class="fa fa-ban"></i>',
									text: 'Bad sensor config for ' + sensorProp,
									position: 'center',
									closeTimeout: 10000,
								  });
								  toastIcon.open();
							}
						}
						Promise.all(promReadings).then(() => {
						
							//(readings);
							readings.sort((a,b) => a.sensortype.localeCompare(b.sensortype));
							app.preloader.hide();
							app.data.readings = readings;
							let pageReadings = JSON.parse(JSON.stringify(readings));
							let pigrowC = localStorage.getItem('pigrow-config');
							if (typeof pigrowC == 'string') {
								pigrowC = JSON.parse(pigrowC);
								let curPigrow = pigrowC.find(x => x.pigrowConfig.piname == apiPiName);
								if (curPigrow)
									apiPiName = curPigrow.pigrowConfig.piname;
								else 
									apiPiName = '';
							}
							app.data.currentPageData = pageReadings;
							let hpConfig = {};
							let pigrowConfig = localStorage.getItem('pigrow-config');
							if (typeof pigrowConfig == 'string') {
								pigrowConfig = JSON.parse(pigrowConfig);
							}
							let pigrow = pigrowConfig.find(x => x.pigrowConfig.piname == apiPiName)
							let readingsClone = JSON.parse(JSON.stringify(readings));
							for (let i =0;i<readingsClone.length;i++) {
								let r = readingsClone[i];
								let sensorOptions = pigrow.homePageConfig.sensorOptions;
								let sensors = pigrow.homePageConfig.sensors;
								let sen = sensors.find(x => x.sensorname == r.sensortype);
								let opt = sensorOptions[r.sensortype];
								r['show_Chart'] = sen.chart;
								r['show_Sensor'] = sen.checked;
								r['__log'] = sen.log
								for (let ix=0;ix<opt.length;ix++) {
									let o = opt[ix];
									r['show_' + o.measurement] = o.checked;
								}
							}
							hpConfig['readings'] = readingsClone;
							hpConfig['piname'] = apiPiName;
							resolve(
								{
									componentUrl: './pages/home2.html',
								},
								{
									context: {
										stats: hpConfig,
									}
								}
							);
						})
						
					}

				})
				.catch(function(err) {
					app.preloader.hide();
					alert('Server: ' + apiUrl + ' not contactable\n' + err.message);
					app.views.main.router.navigate({path:'/appconfig/'});
				})
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
					var convertedSensors = routingHelpers.ConvertSensors(resp);
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
					config.sensors = routingHelpers.ConvertSensors(config.sensors);
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

				routingHelpers.PopulateValueLabels('select[name="columns"]',sel);
			},
		}
	},
	{
		name: 'appconfig',
		path: '/appconfig/',
		//url: './pages/appconfig.html',
		async: function (routeTo, routeFrom, resolve, reject) {
			var homeConfig = {};
			var pigrowConfigArr = localStorage.getItem('pigrow-config');
			if (pigrowConfigArr) {
				pigrowConfigArr = JSON.parse(pigrowConfigArr);
			} else {
				pigrowConfigArr = [];
			}

			if (pigrowConfigArr.length == 0) {
				let pigrowConfig = {};
				if (typeof pigrowConfig['homePageConfig'] == 'undefined') {
					var hpConfig = pigrowConfig['homePageConfig'] = {};
					let sen = app.data.sensors;
					for (let ix=0;ix <sen.length;ix++) {
						let r = sen[ix];
						r['checked'] = true;
						if (ix == 0)
							r['chart'] = true;
						else
							r['chart'] = true;
					
					}
					hpConfig['sensors'] = sen;
					let read = app.data.readings;
					let sensorOptions = {};
					
					for (let ix=0;ix <read.length;ix++) {
						let r = read[ix];
						sensorOptions[r.sensortype] = [];				
						for(let opt in r) {

							let arrObj = {};
							if (opt != 'sensortype' && opt != 'time') {
								arrObj['measurement'] = opt;
								// if (currentConfig)
								// 	arrObj[opt] = currentConfig.sensorOptions[r.sensortype].find(x => x.measurement = r.sensortype).checked;
								// else {
									arrObj['checked'] = true;
								//}
							}
							if (Object.keys(arrObj).length > 0)
								sensorOptions[r.sensortype].push(arrObj);
						}
					}
					hpConfig['sensorOptions'] = sensorOptions;
					pigrowConfig['pigrowConfig'] = {};
					pigrowConfigArr.push(pigrowConfig);
				} 
			}
			else {
				for (let i=0;i<pigrowConfigArr.length;i++) {
					let pg = pigrowConfigArr[i];
					if (pg.homePageConfig.sensors.length == 0) {
						let sen = app.data.sensors;
						for (let ix=0;ix <sen.length;ix++) {
							let r = sen[ix];
							r['checked'] = true;
							if (ix == 0)
								r['chart'] = true;
							else
								r['chart'] = false;
						}
						pg.homePageConfig.sensors = sen;
					}
					if (Object.keys(pg.homePageConfig.sensorOptions).length == 0) {
						let read = app.data.readings;
						let sensorOptions = {};
						for (let ix=0;ix <read.length;ix++) {
							let r = read[ix];
							sensorOptions[r.sensortype] = [];
							for(let opt in r) {

								let arrObj = {};
								if (opt != 'sensortype' && opt != 'time') {
									arrObj['measurement'] = opt;
									// if (currentConfig)
									// 	arrObj[opt] = currentConfig.sensorOptions[r.sensortype].find(x => x.measurement = r.sensortype).checked;
									// else {
										arrObj['checked'] = true;
									//}
								}
								if (Object.keys(arrObj).length > 0) {
									sensorOptions[r.sensortype].push(arrObj);
								}
							}
						}		
						pg.homePageConfig.sensorOptions = sensorOptions;
					}
				}
			}
			localStorage.setItem('pigrow-config', JSON.stringify(pigrowConfigArr));
			// if (typeof homeConfig.sensors == 'undefined') {
			// 	homeConfig.sensors = [];
			// }
			// if (typeof homeConfig.sensorOptions == 'undefined') {
			// 	homeConfig.sensorOptions = [];
			// }
			pigrows = {};
			pigrows['pigrows'] = pigrowConfigArr;
			app.data.pigrowConfig = pigrowConfigArr;
			app.data.currentPageData = pigrowConfigArr;
			resolve(
				{
					componentUrl: './pages/appconfig.html',
				},
				{
					context: {
						appConfig: pigrows,
					}
				}
			);
		},
		on: {
			pageInit: function (event, page) {
				if (Object.keys(app.data.pigrowConfig[0].pigrowConfig).length == 0) {
					
					$$('.ipForm').removeClass('hide');
					$$('input[name="default"]')[0].checked = true;
				}
			}
		}
	},
	{
		name: 'infomodule',
		path: '/infomodule/',
		//url: './pages/appconfig.html',
		async: function (routeTo, routeFrom, resolve, reject) {
			var temp = {};
			app.preloader.show('Searching');
			app.request.json(apiUrl + '/api/v1/config/getfolderlisting/-_scripts-_gui-_info_modules/info_/py', function (data) { 
				app.preloader.hide()
				app.data.currentPageData = data;
				app.data.infoModules = data;
				resolve(
					{
						componentUrl: './pages/infomodule.html',
					},
					{
						context: {
							listings: data,
						}
					}
				);
			})
			
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


