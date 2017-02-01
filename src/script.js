'use strict';

const Donut = require("./donut");
const Data = require("./data");
const jaggedDonut = Donut.jaggedDonut;
const simpleCircle = Donut.simpleCircle;


Data.readData((data_locs, data_counts) => {

  let locations = {};

  data_locs.forEach((d) => {
    const sid = d["Sensor ID"];
    locations[sid] = {
      street_name: d["Sensor Description"],
      lat: d["Latitude"],
      lon: d["Longitude"]
    }
  })

  let data = {};
  
  data_counts.forEach((d) => {

    const sid = d.Sensor_ID;

    if (data[sid] === undefined) {
      data[sid] = [];
    }

    data[sid].push(d.Hourly_Counts);
  })

  prepareDonutData(data[1]);

  /// TODO: use data to create maxs and mins for 

});

function prepareDonutData(data) {
  let hourData = [];

  const no_days = data.length / 24;

  for (let hour = 0; hour < 24; hour++) {
    hourData.push([]);
    for (let day = 0; day < no_days; day++) {
      const idx = hour + day * 24;

      hourData[hour].push(data[idx]);
    }
  }

  let result = {mins: [], maxs: []};
  /// for each hour figure out the min and the max
  for (let hour = 0; hour < 24; hour++) {

    const max = Math.max.apply(null, hourData[hour]);
    const min = Math.min.apply(null, hourData[hour]);

    result.mins.push(min);
    result.maxs.push(max);
  }

  // createDonut(result);

  // createMap(result)
}

function createDonut(cx, cy, hourData) {

    const svg = d3.select("svg");
    // dummy data to print a 'gear', doesn't really matter if min or max array is first
    var maxs = [40, 50, 40, 50, 40, 50, 40, 50, 40, 50, 90, 50, 40, 50, 40, 50, 40, 50, 40, 50, 40, 50, 40, 50];
    var mins = [0, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20];
    // var hourData = {maxs: maxs, mins: mins};

    var minimumDonutRadius = 70;
    var donutAngle = Math.PI; // will mostly likely just be Math.PI for semi-circle or 2*Math.PI for full circle;


    //"hot" half donut

    var points = jaggedDonut(cx, cy, minimumDonutRadius, donutAngle, 1, hourData.maxs)
                    .concat(jaggedDonut(cx, cy, minimumDonutRadius, donutAngle, 1, hourData.mins).reverse());

    //we have to reverse the 'second' loop, whether that's min or max, as we are drawing a poly, going around once (e.g. clockwise), then looping back the other direction (e.g. counter-cw)
    let frist_half = svg.append("svg:polygon")
      .attr("fill", "red")
    //.attr("stroke", "black")
      .attr("points", points);


    //"cold" half donut

    //we have to reverse the 'second' loop, whether that's min or max, as we are drawing a poly, going around once (e.g. clockwise), then looping back the other direction (e.g. counter-cw)
    var points = jaggedDonut(cx, cy, minimumDonutRadius, donutAngle, -1, hourData.maxs)
                    .concat(jaggedDonut(cx, cy, minimumDonutRadius, donutAngle, -1, hourData.mins).reverse());

    let second_half = svg.append("svg:polygon")
      .attr("fill", "blue")
    //.attr("stroke", "black")
      .attr("points", points);

    return [frist_half, second_half];

}

  var donutMinimumRadius = 7;
  var donutAngle = Math.PI; // will mostly likely just be Math.PI for semi-circle or 2*Math.PI for full circle;

  L.mapbox.accessToken = 'pk.eyJ1IjoidmFoYW4iLCJhIjoiY2luaWhyaDBxMHdydHUybTMzanViNzJpNCJ9.B_ndOs4dnU_XghOU9xfnSg';
  var map = L.mapbox.map('map', 'mapbox.streets',{ zoomControl:false, scrollWheelZoom :false })
    .setView([-37.8148798759503,144.965210438559], 15);
  
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.dragging.disable();
  
  
  var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("width", map._size.x).attr("height", map._size.y),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");
  
  
  var data = [
    { "coords" : [ -37.815145 , 144.966777]},
    { "coords" : [ -37.811123 , 144.962733]}
  ].map( function(d){ var newPoint = map.latLngToLayerPoint( d.coords ); d.coords = { 'x' : newPoint.x, 'y' : newPoint.y }; return d; } )
  

  g.selectAll("circle").data( data ).enter().append("circle")
    .attr("cx", function(d){ console.log(d); return d.coords.x } )
    .attr("cy", function(d){ return d.coords.y } )
    .attr("r", 10 )
    .style("fill", "red")
    .on("mouseover", function(d, i) {
        
        var s = d3.select(this);
        var marker = [];

        //this will need to be replaced to get the data from this data point
        var maxs = [40, 50, 40, 50, 40, 50, 40, 50, 40, 50, 90, 50, 40, 50, 40, 50, 40, 50, 40, 50, 40, 50, 40, 50];
        var mins = [0, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20];
        var hourData = {maxs: maxs, mins: mins};

        let svgs = createDonut(+s.attr("cx"), +s.attr("cy"), hourData);

        // var points = jaggedDonut(+s.attr("cx"), +s.attr("cy"), donutMinimumRadius, donutAngle, 1, hourData[0])
        //         .concat(jaggedDonut(+s.attr("cx"), +s.attr("cy"), donutMinimumRadius, donutAngle, 1, hourData[1]).reverse());
        
        // marker.push(svg.append("svg:polygon")
        // .attr("fill", "transparent")
        // .attr("stroke", "red")
        // .attr("points", points));

        // //this will need to be replaced to get the data from this data point
        // var maxs = [40, 50, 40, 50, 40, 50, 40, 50, 40, 50, 90, 50, 40, 50, 40, 50, 40, 50, 40, 50, 40, 50, 40, 50];
        // var mins = [0, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20];
        // var hourData = [maxs, mins];

        // var points = jaggedDonut(+s.attr("cx"), +s.attr("cy"), donutMinimumRadius, donutAngle, -1, hourData[0])
        //         .concat(jaggedDonut(+s.attr("cx"), +s.attr("cy"), donutMinimumRadius, donutAngle, -1, hourData[1]).reverse());
        
        // marker.push(svg.append("svg:polygon")
        // .attr("fill", "transparent")
        // .attr("stroke", "blue")
        // .attr("points", points))

        svg.selectAll("polygon").on("mouseout", function(d, i) {
            svgs[0].remove();
            svgs[1].remove();
        });
    })
