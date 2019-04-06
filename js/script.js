/* Choropleth map */

d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json")
  .defer(d3.json, "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json")
  .await(allData);

function allData(error, education, counties) {
  if (error) throw error;
  
  /* Chartsize */
  
  const w = 900,
        h = 600,
        padding = 60,
        margin = 20,
        tileHeight = 20;
  
  /* Chart values  */
  
  const eduMin = d3.min(education, (d) => d.bachelorsOrHigher);
  const eduMax = d3.max(education, (d) => d.bachelorsOrHigher);
  
  /* Chart colors  */
 
  const color = d3.scaleThreshold()
                  .domain(d3.range(eduMin, eduMax, (eduMax - eduMin) / 8))
                  .range(d3.schemeBlues[9]);

  /* SVG */

  const svg = d3.select("body")
              .append("svg")
              .attr("width", w)
              .attr("height", h)
  
  /* Tooltip */

  var tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .attr("id", "tooltip")
                  .style("opacity", 0)
                  
  function tooltipContent(d){
   
    let countyName = education.find(a => a.fips === d.id).area_name;
    let stateName = education.find(a => a.fips === d.id).state;
    let countyEdu = education.find(a => a.fips === d.id).bachelorsOrHigher; 
    
    return countyName + " [" + stateName +"]<br>" + countyEdu + "%<br><br>";
  }
  
  /* Create map part 1 - U.S. counties */
  
  svg.append("g").selectAll("path")
    .data(topojson.feature(counties, counties.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr("data-education", d => {
      return education.find(a => a.fips === d.id).bachelorsOrHigher;
    })
    .attr("fill", function (d) {
      return color(education.find(a => a.fips === d.id).bachelorsOrHigher || 0);
    })
    .on("mouseover",function(d, i) {
      tooltip.attr("data-education", d => {
        return education.bachelorsOrHigher;
      })
      tooltip.transition().style("opacity",0.9)
      tooltip.html(tooltipContent(d))
        .style("top", (d3.event.pageY) + "px")
        .style("left", (d3.event.pageX) / 2 + "px")
    })
    .on("mouseout",function(d,i){
      tooltip.transition()
             .style("opacity",0)
    })
  
  /* Create map part 2 - U.S. states */

  svg.append("path")
    .datum(topojson.mesh(counties, counties.objects.states, (a, b) => { return a !== b; }))
    .attr("class", "states")
    .attr("d", d3.geoPath());
  
  /* Legend */
  
  var legend = svg.append("g").attr("id", "legend");

  var legendScale = [10, 20, 30, 40, 50, 60];

  const lScale = d3.scaleLinear().domain([d3.min(legendScale), d3.max(legendScale)])
                   .range([w - 290, w - 140]);

  legend.append("rect")
        .attr("x", w - 285)
        .attr("y", margin)
        .attr("width", (d) => 30)
        .attr("height", (d) => tileHeight)
        .attr("fill", (d) => color(legendScale[0]))
  legend.append("rect")
        .attr("x", w - 255)
        .attr("y", margin)
        .attr("width", (d) => 30)
        .attr("height", (d) => tileHeight)
        .attr("fill", (d) => color(legendScale[1]))
  legend.append("rect")
        .attr("x", w - 225)
        .attr("y", margin)
        .attr("width", (d) => 30)
        .attr("height", (d) => tileHeight)
        .attr("fill", (d) => color(legendScale[2]))
  legend.append("rect")
        .attr("x", w - 195)
        .attr("y", margin)
        .attr("width", (d) => 30)
        .attr("height", (d) => tileHeight)
        .attr("fill", (d) => color(legendScale[3]))
  legend.append("rect")
        .attr("x", w - 165)
        .attr("y", margin)
        .attr("width", (d) => 30)
        .attr("height", (d) => tileHeight)
        .attr("fill", (d) => color(legendScale[4]))
  legend.append("rect")
        .attr("x", w - 135)
        .attr("y", margin)
        .attr("width", (d) => 30)
        .attr("height", (d) => tileHeight)
        .attr("fill", (d) => color(legendScale[5]))
  
  svg.append("g")
      .attr("id", "l-axis")
      .attr("class", "tick")
      .attr("transform", "translate(" + margin + "," + 39 + ")")
      .call(d3.axisBottom(lScale).ticks(6).tickFormat(d3.format(".0f"))) 
}