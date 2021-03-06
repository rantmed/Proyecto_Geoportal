// Global Variables HTML// 
var $poblacion = $('#poblacion');
var $parques = $('#parques');
var $indicadores = $('#indicadores');
var $piramide = $('#piramide');
var $aire = $('#aire');
var $titleChart = $('#titleChart');
var $school = $('#school');
var $locateMe = $('#locateMe');
var $servicios = $('#servicios');
var $libraries = $('#libraries');
var $mercados = $('#mercados');
var $nearMe = $('#nearMe');
var $displayData = $('#displayData');
var $contenedor = $('#contenedor');

// Mapbox maps variables
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>';
var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
var satelite  = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFudG1lZCIsImEiOiJjaXF0ZTQza2MwMDFhaHhtMzljbHR4ZzZrIn0.7_tOO6QZdvSbzPYlixXbhw', {attribution: mbAttr});
var streets  = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFudG1lZCIsImEiOiJjaXF0ZTQza2MwMDFhaHhtMzljbHR4ZzZrIn0.7_tOO6QZdvSbzPYlixXbhw', {attribution: mbAttr});
var dark  = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFudG1lZCIsImEiOiJjaXF0ZTQza2MwMDFhaHhtMzljbHR4ZzZrIn0.7_tOO6QZdvSbzPYlixXbhw', {attribution: mbAttr});

// Create Leaflet map object
var map = L.map('map',{ center: [37.3714105564361,-5.9999776906], zoom: 11,layers: [dark]});
var baseMaps = {
	"Imagen Satélite": satelite,
	"Street Map ": streets,
	"Mapa Base": dark
};

L.control.layers(baseMaps).addTo(map);

// Create Leaflet map object
var osmGeocoder = new L.Control.OSMGeocoder({
	collapsed: false,
	position: 'bottomright',
	text: 'Busca una calle',
	});
	
map.addControl(osmGeocoder);


// Create Leaflet map object
var geoJsonLayer = {};


// Set Global Variable that will hold your location
var myLocation = null;

// Set Global Variable that will hold the marker that goes at our location when found
var locationMarker = {};


// Database Queries
// Will go here
// Get all data from dataset
var sqlQuery = "SELECT * FROM info_distritos";

// Get all stations from dataset
var sqlQueryEstaciones = "SELECT * FROM estaciones_medicion ";
 
// Set CARTO Username
var cartoDBUserName = "rantmed87";

// Function to add color to park layer
function getColorPark(d) {
	return  d > 600000 ? '#005824' :
		d > 400000 ? '#238b45' :
		d > 300000 ? '#41ab5d' :
		d > 200000 ? '#74c476' :
		d > 150000 ? '#addd8e' :
		d > 100000 ? '#d9f0a3' :
		d > 50000 ? '#ffffcc' :
		'#ffffcc' ; 
}

function getColorPopulation(d) {
	return  d > 100000 ? '#662506' :
		d > 90000 ? '#993404' :
		d > 80000 ? '#cc4c02' :
		d > 70000 ? '#ec7014' :
		d > 60000 ? '#fe9929' :
		d > 50000 ? '#fec44f' : 
		d > 40000 ? '#fee391' :
		d > 30000 ? '#fff7bc' :
		d > 20000 ? '#ffffe5' :
			'#ffffe5' ; 
}


function getColorPiramides(d) {
	return	d > 10 ? '#3FE480' :
		d > 9 ? '#1BFFE5' :
		d > 8 ? '#D62770' :
		d > 7 ? '#6E7CBA' :
		d > 6 ? '#37821F' :
		d > 5 ? '#bcbddc' :
		d > 4 ? '#ff7f00' :
		d > 3 ? '#fdbf6f' :
		d > 2 ? '#eaadf5' :
		d > 1 ? '#e31a1c' :
			'#ffff99' ; 
}


function parkStyle(feature) { 
	return { 
		fillColor: getColorPark(
		feature.properties.parquestotal), 
		weight: 0, 
		opacity: 1, 
		color: 'red', 
		dashArray: '3', 
		fillOpacity: 0.4
	};
}

// Function to add Style to population layer 
function populationStyle(feature) {
	return { 
		fillColor: getColorPopulation(
		feature.properties.datospoblacion_2016total),
		weight: 0,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.4
	};
}

function piramideStyle(feature) {
	return {
		fillColor: geolorPiramides(
		feature.properties.cartodb_id),
		weight: 0,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.4
	};
}

$nearMe.on("click", function(e) {
	e.preventDefault();
	$('#displayChart').addClass('unvisible');
	if(map.hasLayer(geoJsonLayer)){
		map.removeLayer(geoJsonLayer);
	};
});

$displayData.on("click", function(e) {
	e.preventDefault();
	if(map.hasLayer(locationMarker)){
		map.removeLayer(locationMarker);
	};
	if(map.hasLayer(marketLocations)){
		map.removeLayer(marketLocations);
	};
	if(map.hasLayer(libraryLocations)){
		map.removeLayer(libraryLocations);
	};
	if(map.hasLayer(servicesLocations)){
		map.removeLayer(servicesLocations);
	};
	if(map.hasLayer(schoolLocations)){
		map.removeLayer(schoolLocations);
	};
});

// Run showAll function automatically when document loads
$poblacion.on("click", function(e) {
	e.preventDefault();
	$('.info.legend.leaflet-control').empty();
	showLayer();
});

// Run showAll function automatically when document loads
$piramide.on('click', function(e) {
	e.preventDefault();
	$('.info.legend.leaflet-control').empty();
	showLayer();
});

$parques.on("click", function(e) {
	e.preventDefault();
	$('.info.legend.leaflet-control').empty();
	showLayer();
});

$aire.on("click", function(e) {
	e.preventDefault();
	$('.info.legend.leaflet-control').empty();
	showPointLayer();
	$('#displayChart').addClass('unvisible');
});

// Functions to add layers
function showLayer(){
	var buttonClicked = $(event.target).attr('id');
	if(map.hasLayer(geoJsonLayer)){
		map.removeLayer(geoJsonLayer);
	};
	if(map.hasLayer(locationMarker)){
		map.removeLayer(locationMarker);
	};
	// Get CARTO selection as GeoJSON and Add to Map
	$.ajax({
		metod : 'GET',
		url: "https://"+cartoDBUserName+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlQuery, 
		//async: false,  
		context: this,
		dataType: 'json',
		success: addLayer });

		function addLayer (data){

			function zoomToFeature(e) { 
				var layer = e.target; 
				map.fitBounds(e.target.getBounds());
			}

			function onEachFeature(feature, layer) {
				//layer.bindPopup('<p><b>' + feature.properties.distrito + '</b><br /><em>' + feature.properties.direccion + '</em></p>');
				layer.cartodb_id=feature.properties.cartodb_id;
				layer.on({
					mouseover: highlightFeature,
					mouseout: resetHighlight,
					//dblclick: zoomToFeature,
					click:  addCharts
				});
			}

			function highlightFeature(e) {
				var layer = e.target;
				layer.setStyle({
					weight: 1,
					color: '#DDD',
					dashArray: '',
					fillOpacity: 0.4
				});
			}

			function resetHighlight(e) {
				geoJsonLayer.resetStyle(e.target);
				//info.update();
			}

			// Funcion y controles de leyenda
			function showLeyend(e){

			}

			if (buttonClicked === 'poblacion'){
					// Añadir capa de poblacion
				geoJsonLayer = L.geoJson(data,{
					style: populationStyle,
					onEachFeature: onEachFeature
				}).addTo(map);

				var legend = L.control({position: 'bottomright'});
				legend.onAdd = function (map) {

				var div = L.DomUtil.create('div', 'info legend'),
					grades = [30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000],
					labels = [];
				// loop through our density intervals and generate a label with a colored square for each interval
				for (var i = 0; i < grades.length; i++) {
					div.innerHTML +=
					'<i style="background:' + getColorPopulation(grades[i] + 1) + '"></i> ' +
					 grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
				}
				return div;
				};

				legend.addTo(map);
			}

			else if (buttonClicked === 'piramide'){
				// Añadir capa de poblacion
				geoJsonLayer = L.geoJson(data,{
					style: piramideStyle,
					onEachFeature: onEachFeature
				}).addTo(map);
			}

			else if (buttonClicked === 'parques'){
				// Añadir capa de poblacion
				geoJsonLayer = L.geoJson(data,{
					style: parkStyle,
					onEachFeature: 		function onEachFeature(feature, layer) {
						layer.bindPopup('<p><b>' + 'Distrito'+' '+feature.properties.distrito + '</b><br /><em>' + 'Superficie Total en m2 '+'  ' + feature.properties.parquestotal + '</em></p>');
						layer.cartodb_id=feature.properties.cartodb_id;
						layer.on({
							mouseover: highlightFeature,
							mouseout: resetHighlight,
							dblclick: zoomToFeature
						});
					}
				}).addTo(map);

				var legend = L.control({position: 'bottomright'});
				legend.onAdd = function (map) {
				var div = L.DomUtil.create('div', 'info legend'),
					grades = [50000, 100000, 150000, 200000, 300000, 400000, 600000],
					labels = [];
				// loop through our density intervals and generate a label with a colored square for each interval
				for (var i = 0; i < grades.length; i++) {
					div.innerHTML +=
					'<i style="background:' + getColorPark(grades[i] + 1) + '"></i> ' +
					grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
				}
				return div;
				};
				legend.addTo(map); 
			}

		function addCharts(e) {
			var layer = e.target;
			var distrito = layer.feature.properties.distrito;
			var direccion = layer.feature.properties.direccion;
			var telefono = layer.feature.properties.telefono;
			var fax = layer.feature.properties.fax
			var superficie = layer.feature.properties.area_2;
			$('#displayChart').toggleClass('unvisible');
			titleChart.innerText = distrito +' '+' '+' '+ " Dirección: " +direccion + ' Telefono: ' + telefono + " Superficie: " + superficie

			var categories = ['0-4', '5-9', '10-14', '15-19',
				'20-24', '25-29', '30-34', '35-39', '40-44',
				'45-49', '50-54', '55-59', '60-64', '65-69',
				'70-74', '75-79', '80-84', '85-89', '90 +'];

			var dataMen = layer.feature.properties.piramide_poblacion;
			var arrayMen = JSON.parse(dataMen);
			var mySeriesMen = [];
			var mySeriesFemale = [];
			arrayMen.forEach ( function (male){
				var males = -Math.abs(male.HOMBRES);
				var females = male.MUJERES;
				mySeriesMen.push(males); 
				mySeriesFemale.push(females);
			});

			if (buttonClicked === 'poblacion'){
			// Añadir capa de poblacion
				Highcharts.chart('charts', {
						
					title: {
						text: 'Población de Sevilla 2016'
					},
					subtitle: {
						text: 'Fuente: <a href="http://www.ine.es/">Ayuntamiento de Sevilla</a>'
					},
					yAxis: {
						title: {
							text: 'Número de habitantes',
							align: 'high'
						},
						labels: {
							overflow: 'justify'
						}
					},
					xAxis:{
					  startOnTick: false,
					  categories: [2011,2012,2013,2014,2015,2016]
					},
					tooltip: {
						formatter: function () {
						  return '<b>' + this.x + '</b><br/>' +
							this.series.name + ': ' + this.y + '<br/>' +
							'Total: ' + this.point.stackTotal;
						}
					},

					plotOptions: {
						series: {
						}
					},

					credits: {
						enabled: false
					},
					series: [ {
						name: "Total",
						data: [
						layer.feature.properties.datospoblacion_2011total,
						layer.feature.properties.datospoblacion_2012total,
						layer.feature.properties.datospoblacion_2013total,
						layer.feature.properties.datospoblacion_2014total,
						layer.feature.properties.datospoblacion_2015total,
						layer.feature.properties.datospoblacion_2016total]
					}],
					responsive: {
					rules: [{
						condition: {
							maxWidth: 500
						},
						chartOptions: {
							legend: {
								align: 'center',
								verticalAlign: 'bottom',
								layout: 'horizontal'
							},
							yAxis: {
								labels: {
									align: 'left',
									x: 0,
									y: -5
								},
								title: {
									text: null
								}
							},
							subtitle: {
								text: null
							},
							credits: {
								enabled: false
							}
						}
					}]
					}
				});
			}

			else if (buttonClicked === 'piramide'){
				Highcharts.chart('charts', {
					chart: {
						type: 'bar'
					},
					title: {
						text: 'Piramide de población, 2016'
					},
					subtitle: {
						text: 'Fuente: <a href="http://populationpyramid.net/germany/2015/">Ayuntamiento de Sevilla</a>'
					},
					xAxis: [{
						categories: categories,
						reversed: false,
						labels: {
							step: 1
						}
					}, { // mirror axis on right side
						opposite: true,
						reversed: false,
						categories: categories,
						linkedTo: 0,
						labels: {
							step: 1
						}
					}],
					yAxis: {
						title: {
							text: null
						},
						labels: {
							formatter: function () {
								return Math.abs(this.value) + '%';
							}
						}
					},
					plotOptions: {
						series: {
							stacking: 'normal'
						}
					},
					tooltip: {
						formatter: function () {
							return '<b>' + this.series.name + ', edad ' + this.point.category + '</b><br/>' +
							'Población: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
						}
					},
					series: [{
						name: 'Hombres',
						data: mySeriesMen
					}, {
						name: 'Mujeres',
						data: mySeriesFemale
					}]
				});
			}
		};
		return geoJsonLayer;
	};
	return addLayer;
};

function showPointLayer(){
	$('#displayChart').addClass('unvisible');
		if(map.hasLayer(geoJsonLayer)){
			map.removeLayer(geoJsonLayer);
		};
		if(map.hasLayer(locationMarker)){
			map.removeLayer(locationMarker);
	};
		// Get CARTO selection as GeoJSON and Add to Map
		$.ajax({
			metod : 'GET',
			url: "https://"+cartoDBUserName+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlQueryEstaciones, 
			dataType: 'json',
			success: addBarrios });

				function addBarrios (data){	

					function onEachFeature(feature, layer) {
						layer.on({
							click: addChart
						});
					}

					geoJsonLayer = L.geoJson(data, {
						pointToLayer: function (feature, latlng) {
							return L.marker(latlng, {icon: pollutionMarker});
						},
						onEachFeature: onEachFeature
						}).addTo(map);

					function addChart(e) {					
						var layer = e.target;
						var nombre = layer.feature.properties.nombre;
						$('#displayChart').toggleClass('unvisible');
						titleChart.innerText = 'Nombre de la estación de medición:' +' '+ nombre 
						var categories = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

						var dataMen = layer.feature.properties.calidad_aire;
						var arrayMen = JSON.parse(dataMen);

						var mySeriesBuena = [];
						var mySeriesAdmisible = [];  
						var mySeriesMala = [];
						var mySeriesMuymala = [];   

						arrayMen.forEach ( function (male){
							var buena = male.BUENA;
							var admisible = male.ADMISIBLE;
							var mala = male.MALA;
							var muymala = male.MUY_MALA;
							mySeriesBuena.push(buena);
							mySeriesAdmisible.push(admisible);
							mySeriesMala.push(mala);
							mySeriesMuymala.push(muymala);
						});

						Highcharts.chart('charts', {
								chart: {
									type: 'column'
								},

								title: {
									text: 'Resumen mensual de la calidad del aire. 2016'
								},

								xAxis: {
									categories: categories
								},

								yAxis: {
									allowDecimals: false,
									tickInterval: 5,
									min: 0,
									title: {
										text: 'Número de días'
									}
								},

								tooltip: {
									formatter: function () {
										return '<b>' + this.x + '</b><br/>' +
										this.series.name + ': ' + this.y + '<br/>' +
										'Total: ' + this.point.stackTotal;
									}
								},
								plotOptions: {
									column: {
										stacking: 'normal'
									}
								},
								series: [{
									name: 'Buena',
									data: mySeriesBuena,
									color: '#1a9641'
								}, {
									name: 'Admisible',
									data: mySeriesAdmisible,
									color: '#a6d96a'
									
								}, {
									name: 'Mala',
									data: mySeriesMala,
									color: '#fdae61'
									
								}, {
									name: 'Muy mala',
									data: mySeriesMuymala,
									color: '#d7191c'
									
								}]
							});
						};
				};
};



// Set 'Your Location' and  icon
var myIcon = L.icon({
	iconUrl: 'images/female.png',
	shadowUrl: 'images/marker-shadow.png',
	iconAnchor: [13, 41]
});

var schoolIcon =L.AwesomeMarkers.icon({
	icon: 'fa-graduation-cap', 
	markerColor: 'green', 
	prefix: 'fa', 
	iconColor: 'black'
});

var libraryIcon = L.AwesomeMarkers.icon({
	icon: 'fa-book', 
	markerColor: 'blue', 
	prefix: 'fa', 
	iconColor: 'black'
});

var servicesIcon = L.AwesomeMarkers.icon({
	icon: 'glyphicon-info-sign', 
	markerColor: 'orange', 
	prefix: 'glyphicon', 
	iconColor: 'black'
});

var marketIcon = L.AwesomeMarkers.icon({
	icon: 'glyphicon-shopping-cart', 
	markerColor: 'purple', 
	prefix: 'glyphicon', 
	iconColor: 'black'
});

var redMarker = L.AwesomeMarkers.icon({
	icon: 'fa-user-circle', 
	markerColor: 'red', 
	prefix: 'fa', 
	iconColor: 'black'
});

 var pollutionMarker = L.AwesomeMarkers.icon({
	icon: 'fa-exclamation-triangle', 
	markerColor: 'green', 
	prefix: 'fa', 
	iconColor: 'yellow'
});


$locateMe.on("click", function(e) {
	e.preventDefault();
	$locateMe.toggleClass('activeButton');

	if(map.hasLayer(geoJsonLayer)){
		map.removeLayer(geoJsonLayer);
	};

	var buttonClicked = $(event.target).attr('class');
		if (buttonClicked === 'botoncolor btn btn-primary activeButton'){
			function geoFindMe(position) {
				var lat  = position.coords.latitude;
				var lng = position.coords.longitude;
				var latLng = {lat, lng};
				myLocation = latLng;
				locationMarker = L.marker(latLng, {icon: redMarker})
				map.addLayer(locationMarker);
				map.setView([lat, lng], 14);
			};
		}

		else if (buttonClicked === 'botoncolor btn btn-primary'){
			console.log('eliminar');
			map.removeLayer(locationMarker);
		}
 
	navigator.geolocation.getCurrentPosition(geoFindMe);
 
});


var schoolLocations ={};
var servicesLocations ={};
var libraryLocations ={};
var marketLocations ={};


$school.on("click", function(e) {
	e.preventDefault();
	$school.toggleClass('activeButton');
	var buttonClicked = $(event.target).attr('class');
	if (buttonClicked === 'btn btn-primary activeButton'){
		console.log('añadir');
		showSchool();
	}

	else if (buttonClicked === 'btn btn-primary'){
		console.log('eliminar');
		removeSchool();
	}
 });

function showSchool(){
	var sqlQueryClosest = "SELECT * FROM equipamiento_escolar ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+myLocation.lng+","+myLocation.lat+"), 4326) LIMIT 5";
		$.ajax({
		metod : 'GET',
		url: "https://"+cartoDBUserName+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlQueryClosest,
		context: this,
		//async: false,		
		dataType: 'json',
		success: addData });

	function addData (data){
		schoolLocations = L.geoJson(data, {
			pointToLayer: function (feature, latlng) {
					 return L.marker(latlng, {icon:schoolIcon});
					},
			onEachFeature: function (feature, layer) {
				 layer.bindPopup('<div>' + '<strong>' + feature.properties.nombre + '</strong>' + '<br/>' + feature.properties.tipo + 
				'<br/><br/>' + feature.properties.direccion + 
				'<br/>' + feature.properties.telefono + '<br/><br/>' +
				'<a href="' + feature.properties.web + '"' +  'target="_blank"> Ir a la web </a></div>'
				 );
				layer.cartodb_id=feature.properties.cartodb_id;
			}
		}).addTo(map);
	};
};

function removeSchool(){
  map.removeLayer(schoolLocations);
 };

$servicios.on("click", function(e) {
	e.preventDefault();
	console.log('botonservicios')
	$servicios.toggleClass('activeButton');
	var buttonClicked = $(event.target).attr('class');
	if (buttonClicked === 'btn btn-primary activeButton'){
		console.log('añadir');
		showServicios();
	}

	else if (buttonClicked === 'btn btn-primary'){
		console.log('eliminar');
		removeServicios();   
	}
});

function showServicios(){
	var sqlQueryClosest = "SELECT * FROM servicios_municipales ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+myLocation.lng+","+myLocation.lat+"), 4326) LIMIT 5";
	$.ajax({
		metod : 'GET',
		url: "https://"+cartoDBUserName+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlQueryClosest,
		context: this,
		//async: false,		
		 dataType: 'json',
		success: addData });

		function addData (data){
			servicesLocations = L.geoJson(data, {
				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {icon:servicesIcon});
				},
				onEachFeature: function (feature, layer) {
					layer.bindPopup('<div>' + '<strong>' + feature.properties.nombre + '</strong>' + 
						'<br/><br/>' + feature.properties.direccion + 
						'<br/>' + feature.properties.telefono + '<br/><br/>' +
						'<a href="' + feature.properties.web + '"' +  'target="_blank"> Ir a la web </a></div>' );
					layer.cartodb_id=feature.properties.cartodb_id;
				}
			}).addTo(map);
		};
};


function removeServicios(){
	map.removeLayer(servicesLocations);
};

$libraries.on("click", function(e) {
	e.preventDefault();
	$libraries.toggleClass('activeButton');
	var buttonClicked = $(event.target).attr('class');
		if (buttonClicked === 'btn btn-primary activeButton'){
			console.log('añadir');
			showlibraries();
		}

		else if (buttonClicked === 'btn btn-primary'){
			console.log('eliminar');
			removelibraries();
		}
});

function showlibraries(){
	var sqlQueryClosest = "SELECT * FROM bibliotecas ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+myLocation.lng+","+myLocation.lat+"), 4326) LIMIT 5";
		$.ajax({
			metod : 'GET',
			url: "https://"+cartoDBUserName+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlQueryClosest,
			context: this,
			//async: false,
			dataType: 'json',
			success: addData });

			function addData (data){
				libraryLocations = L.geoJson(data, {
					pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {icon:libraryIcon});
					},
					onEachFeature: function (feature, layer) {
						layer.bindPopup('<div>' + '<strong>' + feature.properties.nombre + '</strong>' + 
						'<br/><br/>' + feature.properties.direccion + 
						'<br/>' + feature.properties.telefono + '<br/><br/>' +
						'<a href="' + feature.properties.web + '"' +  'target="_blank"> Ir a la web </a></div>' +
						'<img class="popupPhoto" src="' + feature.properties.fotos + '"' +  '>  </img></div>');
						layer.cartodb_id=feature.properties.cartodb_id;
					}
				}).addTo(map);
			};
};


function removelibraries(){
	map.removeLayer(libraryLocations);
};


$mercados.on("click", function(e) {
	e.preventDefault();
	$mercados.toggleClass('activeButton');
	var buttonClicked = $(event.target).attr('class');
		if (buttonClicked === 'btn btn-primary activeButton'){
			console.log('añadir');
			showMercados();
		}
		else if (buttonClicked === 'btn btn-primary'){
			console.log('eliminar');
			removeMercados();
		}
});


function showMercados(){
	var sqlQueryClosest = "SELECT * FROM mercados ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+myLocation.lng+","+myLocation.lat+"), 4326) LIMIT 5";
	$.ajax({
		metod : 'GET',
		url: "https://"+cartoDBUserName+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlQueryClosest,
		context: this,
		//async: false,         
		dataType: 'json',
		success: addData });

		function addData (data){
			marketLocations = L.geoJson(data, {
				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {icon:marketIcon});
				},
				onEachFeature: function (feature, layer) {
					layer.bindPopup('<div>' + '<strong>' + feature.properties.nombre + '</strong>' + 
					'<br/><br/>' + feature.properties.texto + 
					'<br/><br/>' + feature.properties.m_html + 
					'<img class="popupPhoto" src="' + feature.properties.foto + '"' +  '>  </img></div>');
					layer.cartodb_id=feature.properties.cartodb_id;
				}
			}).addTo(map);
		};
};

function removeMercados(){
	map.removeLayer(marketLocations);
};


