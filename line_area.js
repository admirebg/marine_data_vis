var svg, margin, margin2, width, height, height2;
var parseDate;
var x, x2, y, y2, y3, y4;
var xAxis, xAxis2, yAxis, yAxis3;
var brush, zoom;
var line, line2, area, line3;
var focus, context, legend;


function pre_draw() {

 svg = d3.select("svg");
 svg.selectAll("*").remove();

margin = {top: 10, right: 30, bottom: 110, left: 20},
margin2 = {top: 330, right: 30, bottom: 30, left: 20},
width = +svg.attr("width") - margin.left - margin.right,
height = +svg.attr("height") - margin.top - margin.bottom,
height2 = +svg.attr("height") - margin2.top - margin2.bottom;

 parseDate = d3.timeParse("%Y-%m-%d");

    x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]),
    y3 = d3.scaleLinear().range([height, 0]),
    y4 = d3.scaleLinear().range([height2, 0]);

xAxis = d3.axisBottom(x).tickSizeInner(-height).tickSizeOuter(0).tickPadding(10),
xAxis2 = d3.axisBottom(x2),
yAxis = d3.axisLeft(y).tickSizeInner(-width).tickSizeOuter(0).tickPadding(10),
yAxis3 = d3.axisRight(y3);

 brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

 zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

 line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temp); });

 line2 = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x2(d.date); })
    .y(function(d) { return y2(d.temp); });

 area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y3(d.wave_h); });

 line3 = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x2(d.date); })
    .y(function(d) { return y4(d.wave_h); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

 focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

}


function draw_graph(stn_id, inst) {

  var legendWidth  = 100,
      legendHeight = 50;
  /*
  console.log('inside draw_graph');
  console.log('inst: ', inst);
  console.log('id: ', stn_id);
  */
  var temp_csv = "buoy_temp.csv";
  var waveh_csv = "buoy_waveh.csv";

  if (inst == "deungpyo") {
    temp_csv = "deungpyo_temp.csv";
    waveh_csv = "deungpyo_waveh.csv";
  } else if (inst == "pagobuoy") {
    temp_csv = "pagobuoy_temp.csv";
    waveh_csv = "pagobuoy_waveh.csv";
  }

d3.csv(temp_csv, type_temp, function(error, data) {
  if (error) throw error;

  data = data.filter(function (d) {
    return d.id == stn_id;
  })
  /* 0인 값 필터링
  data = data.filter(function (d) {
    return d.temp != 0;
  })
  */
  x.domain(d3.extent(data, function(d) { return d.date; }));
  x2.domain(x.domain());
  y.domain([0, d3.max(data, function(d) { return d.temp*1.5; })]);
  y2.domain(y.domain());

  focus.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis)
      .append('text')
      .attr("fill", "black")
      .attr('transform', 'rotate(-90)')
  	  .attr('y', 6)
  	  .attr('dy', '.71em')
  	  .style('text-anchor', 'end')
  	  .text('Temp');

  context.selectAll("path").remove();

  context.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line2);
  /*
  context.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line3);
  */
  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

  svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

  legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + (width - legendWidth) + ', 0)');

  legend.append('rect')
    .attr('class', 'l_temp')
    .attr('width',  34)
    .attr('height', 2)
    .attr('x', -30)
    .attr('y', 10);

  legend.append('text')
    .attr('x', 10)
    .attr('y', 15)
    .style('font-size', "11px")
    .text('Temp(°C)')
    .on('click', function () {
      //console.log('inside newFunction');
      context.selectAll("path").remove();
      context.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line2);
     })
    .on('mousemove', moveFunction)
    .on('mouseout', outFunction);

    legend.append('rect')
      .attr('class', 'l_waveh')
      .attr('width',  34)
      .attr('height', 10)
      .attr('x', -30)
      .attr('y', 25);

});


d3.csv(waveh_csv, type_wave, function(error, data) {
  if (error) throw error;

  data = data.filter(function (d) {
    return d.id == stn_id;
  })

  y3.domain([0, d3.max(data, function(d) { return d.wave_h; })]);
  y4.domain(y3.domain());

  focus.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

  focus.append("g")
      .attr("class", "axis axis--y right")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis3)
      .append('text')
      .attr("fill", "black")
      .attr('transform', 'rotate(-270)')
  	  .attr('y', 6)
  	  .attr('dy', '.71em')
  	  .style('text-anchor', 'start')
  	  .text('Wave height');

  legend.append('text')
        .attr('x', 10)
        .attr('y', 35)
        .style('font-size', "11px")
        .text('Wave height(m)')
        .on('click', function() {
          //console.log("hello");
          context.selectAll("path").remove();
          context.append("path")
              .datum(data)
              .attr("class", "line")
              .attr("d", line3);
        })
        .on('mousemove', moveFunction)
        .on('mouseout', outFunction);

});
}

function moveFunction(){
  d3.select(this).style("font-weight", "bold");
  d3.select(this).style("cursor", "pointer");
  //console.log('inside moveFunction');
}

function outFunction(){
  d3.select(this).style("font-weight", "normal");
  d3.select(this).style("cursor", "default");
  //console.log('inside moveFunction');
}

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.select(".line").attr("d", line);
  focus.select(".area").attr("d", area);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.select(".line").attr("d", line);
  focus.select(".area").attr("d", area);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type_temp(d) {
  d.date = parseDate(d.date);
  d.temp = +d.temp;
  return d;
}

function type_wave(d) {
  d.date = parseDate(d.date);
  d.wave_h = +d.wave_h;
  return d;
}
