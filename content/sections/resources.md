




### When will countries reach the vaccination goal?

<script type="text/javascript">
 var zz = "World" ;
        var comma = d3.format(",");

		var abc =  d3.csv("/otherdata/covid.csv", function(consdata) {
	    var filtercitydata = consdata.filter(function(d, i) 
	    	{ 
	            if (d["location"] == zz) 
	            {return d} ;
	        }) ;
	        console.log(filtercitydata) ;
		  var ctry =  filtercitydata.filter(function(d, i){return d})[0].location2 ;      
		 var sevendays = comma(filtercitydata.filter(function(d, i){return d})[0].fvl7d)  ;
		 var date = filtercitydata.filter(function(d, i){return d})[0].date  ;
		 var vaccination_rate = filtercitydata.filter(function(d, i){return d})[0].vaccination_rate  ;
		 var already_vaccinated = filtercitydata.filter(function(d, i){return d})[0].already_vaccinated  ;
		 var vaccination_days = comma(filtercitydata.filter(function(d, i){return d})[0].vaccination_days)  ;
		 d3.select("#p3").insert("p").html("<b>" + ctry + "</b> has administered <b>" + sevendays + "</b> vaccine doses over the last seven days. This corresponds to a single dose for <b>" + vaccination_rate + "%</b> of the population. <b>"  + ctry  + "</b> has reached <b>" + already_vaccinated + "%</b> of the vaccination goal (i.e., full immunization for 80% of the population). At the current speed, <b>" + ctry + "</b> will have reached the vaccination goal in <b>" + vaccination_days + "</b> days.");
		   		}) ;
</script>

 <script>


 d3.csv("/otherdata/covid.csv", function(error, data) {
    var select = d3.select("p2")
      .append("div")
      .append("select")


    select
      .on("change", function(d) {
      	// Defining the function
		// This line of code selects the <tbody> from the html and clears it. If this is not used, then the results would appear on top of the previous result.
		d3.select("#p3").html("") ;
		// This code is needed to prevent the page from reloading.

        var location = d3.select(this).property("value");
        var comma = d3.format(",");

		var abc =  d3.csv("/otherdata/covid.csv", function(consdata) {
	    var filtercitydata = consdata.filter(function(d, i) 
	    	{ 
	            if (d["location"] == location) 
	            {return d} ;
	        }) ;
	        console.log(filtercitydata) ;
		  var ctry =  filtercitydata.filter(function(d, i){return d})[0].location2 ;      
		 var sevendays = comma(filtercitydata.filter(function(d, i){return d})[0].fvl7d)  ;
		 var date = filtercitydata.filter(function(d, i){return d})[0].date  ;
		 var vaccination_rate = filtercitydata.filter(function(d, i){return d})[0].vaccination_rate  ;
		 var already_vaccinated = filtercitydata.filter(function(d, i){return d})[0].already_vaccinated  ;
		 var vaccination_days = comma(filtercitydata.filter(function(d, i){return d})[0].vaccination_days)  ;
		 d3.select("#p3").insert("p").html("<b>" + ctry + "</b> has administered <b>" + sevendays + "</b> vaccine doses over the last seven days. This corresponds to a single dose for <b>" + vaccination_rate + "%</b> of the population. <b>"  + ctry  + "</b> has reached <b>" + already_vaccinated + "%</b> of the vaccination goal (i.e., full immunization for 80% of the population). At the current speed, <b>" + ctry + "</b> will have reached the vaccination goal in <b>" + vaccination_days + "</b> days.");
		   		}) ;


      });

    select.selectAll("option")
      .data(data)
      .enter()
        .append("option")
        .attr("location", function (d) { return d.location; })
        .text(function (d) { return d.location; });
  });



</script>






<p2>
</p2>

<br>
<div id="p3">  </div>
<div> <i>(Data source: Our World in Data. Own calculations)</i> </div>

---





### Mentoring for donations

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/EconTwitter?src=hash&amp;ref_src=twsrc%5Etfw">#EconTwitter</a> <br>I am offering FREE mentoring for anyone interested in applying for masters/predocs/PhD programs in Economics. In return, I request you to donate to an Indian Covid foundation, such as <a href="https://twitter.com/Hemkunt_Fdn?ref_src=twsrc%5Etfw">@Hemkunt_Fdn</a> or <a href="https://twitter.com/Khalsa_Aid?ref_src=twsrc%5Etfw">@Khalsa_Aid</a>. DM me if interested! <a href="https://twitter.com/hashtag/IndiaFightsCOVID19?src=hash&amp;ref_src=twsrc%5Etfw">#IndiaFightsCOVID19</a> 1/3</p>&mdash; Jonathan Old (@Jonathan_Old) <a href="https://twitter.com/Jonathan_Old/status/1392964103174492172?ref_src=twsrc%5Etfw">May 13, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

---

### Hope Index and Covid-19 vaccination progress: 

The Hope Index is the number of new vaccinations, divided by the number of new deaths in a country. While every death causes incredible pain and suffering, every vaccination potentially saves lives and nurtures the hope that we can beat this pandemic. Countries with high vaccination rates, such as the UK, have succesfully dried out the pandemic, and their high Hope Index values give reason for optimism. On the other hand, outbreaks such as in India inflict unimaginable suffering, but also slow down vaccination campaigns, worsening an already difficult situation.



<!-- Initialize a select button -->
<select id="selectButton"></select>

<!-- Create a div where the graph will take place -->
<div id="my_dataviz"></div>

<!-- Color Scale -->
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>

<script>

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 30, left: 80},
    width = my_dataviz.clientWidth - margin.left - margin.right,
    height = 0.5*window.innerHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("/otherdata/covid_panel.csv", 
	function(d){
    return { date : d3.timeParse("%Y-%m-%d")(d.date), location: d.location, hope_index_2: d.hope_index_2, vaccination_days: d.vaccination_days}
  },

  // Now I can use this dataset:
  function(data) {

    // List of groups (here I have one group per column)
    var allGroup = d3.map(data, function(d){return(d.location)}).keys()

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("vaccination_days", function (d) { return d; }) // corresponding value returned by the button


// text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style('font-family', '"Noto Sans"')
      .style('font-size' , '100%')
      .style('font-weight' , '700')
      .style('fill' , '#494949')
      .text("Hope Index");      


    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
       .style('font-family', '"Noto Sans"')
      .style('font-size' , '100%')
         .style('color' , '#494949')
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat("%b"))
      	);



    // Add Y axis
    var y = d3.scaleLog()
      .domain([10, d3.max(data, function(d) { return +d.hope_index_2; })])
      .range([ height, 10 ])
      .base(10);
    svg.append("g")
      .call(d3.axisLeft(y)
      		.tickFormat(d3.format(","))
      		 .tickValues([10, 10E1, 10E2, 10E3, 10E4, 10E5, 10E6, 10E7]))
      .style('font-family', '"Noto Sans"')
       .style('color' , '#494949')
      .style('font-size' , '100%');


    // Add Y2 axis
    var y2 = d3.scaleLog()
      .domain([10, d3.max(data, function(d) { return +d.vaccination_days; })])
      .range([ height, 10 ])
      .base(10);

    svg.append("g")
      .call(d3.axisRight(y2)
      		.tickFormat(d3.format(","))
      		 .tickValues([10, 10E1, 10E2, 10E3]))
      .style('font-family', '"Noto Sans"')
       .style('color' , '#494949')
      .style('font-size' , '100%');



    // Initialize line with first group of the list
    var line = svg
      .append('g') 
      .append("path")
        .datum(data.filter(function(d){return d.location==allGroup[0]}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(+d.hope_index_2) })
        )
        .attr("stroke", function(d){ return myColor("World") })
        .style("stroke-width", 4)
        .style("fill", "none")
        .attr("class", "axisSteelBlue")
      	.call(d3.axisLeft(y2))



    // A function that update the chart
    function update(selectedGroup) {

   
      // Create new data with the selection?
      var dataFilter = data.filter(function(d){return d.location==selectedGroup})

      // Give these new data to update line
      line 
          .datum(dataFilter)
          .transition()
          .duration(200)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(+d.hope_index_2) })
          )
          .attr("class", "axisSteelBlue")
      	.call(d3.axisLeft(y2))
          .attr("stroke", function(d){ return myColor(selectedGroup) })


    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)


    }) 

})

</script>



![Covid-19 Hope Index](/pdf/hope_index.png)


<iframe src="https://ourworldindata.org/explorers/coronavirus-data-explorer?zoomToSelection=true&pickerSort=desc&pickerMetric=population&Metric=Vaccine+doses&Interval=7-day+rolling+average&Relative+to+Population=true&Align+outbreaks=false&country=IND~GBR~USA~DEU&hideControls=true" loading="lazy" style="width: 100%; height: 600px; border: 0px none;"></iframe>





