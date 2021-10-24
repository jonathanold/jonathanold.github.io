


### Covid-19 vaccination progress

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
		 var vaccination_rate = filtercitydata.filter(function(d, i){return d})[0].vaccination_rate2  ;
		 var already_vaccinated = filtercitydata.filter(function(d, i){return d})[0].already_vaccinated  ;
		 var vaccination_days = comma(filtercitydata.filter(function(d, i){return d})[0].vaccination_days)  ;
     var day = filtercitydata.filter(function(d, i){return d})[0].day ;
    var month = filtercitydata.filter(function(d, i){return d})[0].month ;
     var year = filtercitydata.filter(function(d, i){return d})[0].year ;

     d3.select("#p3").insert("p").html("As of <b>" + month + " " 
    + day + ", " + year +  "</b>, <b>" + ctry + "</b> has administered <b>" + sevendays + "</b> vaccine doses over the last seven days. This corresponds to a single dose for <b>" + vaccination_rate2 + "%</b> of the population. <b>"  + ctry  + "</b> has reached <b>" + already_vaccinated + "%</b> of the vaccination goal (i.e., full immunization for 80% of the population). At the current speed, <b>" + ctry + "</b> will have reached the vaccination goal in <b>" + vaccination_days + "</b> days.");
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
     var day = filtercitydata.filter(function(d, i){return d})[0].day ;
    var month = filtercitydata.filter(function(d, i){return d})[0].month ;
     var year = filtercitydata.filter(function(d, i){return d})[0].year ;

		 d3.select("#p3").insert("p").html("As of <b>" + month + " " 
    + day + ", " + year +  "</b>, <b>" + ctry + "</b> has administered <b>" + sevendays + "</b> vaccine doses over the last seven days. This corresponds to a single dose for <b>" + vaccination_rate + "%</b> of the population. <b>"  + ctry  + "</b> has reached <b>" + already_vaccinated + "%</b> of the vaccination goal (i.e., full immunization for 80% of the population). At the current speed, <b>" + ctry + "</b> will have reached the vaccination goal in <b>" + vaccination_days + "</b> days.");
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






<!-- Initialize a select button -->
<select id="selectButton"></select>

<!-- Create a div where the graph will take place -->
<div id="my_dataviz"></div>

<!-- Color Scale -->
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>

<script>

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 30, left: 60},
    width = my_dataviz.clientWidth - margin.left - margin.right ,
    height = 0.5*window.innerHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right +40)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("/otherdata/covid_panel.csv", 
	function(d){
    return { date : d3.timeParse("%Y-%m-%d")(d.date), location: d.location, new_deaths_smoothed_per_million: d.new_deaths_smoothed_per_million, vaccination_days: d.vaccination_days, vaccination_rate2: d.vaccination_rate2}
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
      .attr("vaccination_rate2", function (d) { return d; }) // corresponding value returned by the button


    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);


  
// text label for the y axis
  var lax = svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style('font-family', '"Noto Sans"')
      .style('font-size' , '100%')
      .style('font-weight' , '700')
        .style('fill' , function(d){ return myColor("World")})
      .style("fill-opacity", 1.0)
      .text("New Deaths per million per day");      


  var rax = svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + 30)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style('font-family', '"Noto Sans"')
      .style('font-size' , '100%')
      .style('font-weight' , '700')
        .style('fill' , function(d){ return myColor("World")})
      .style("fill-opacity", 0.6)
          .text("New vaccinations per 100 per week");  





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
    var y = d3.scaleLinear()
      .domain([0, 3])
      .range([ height, 0 ]);
 
      var leftaxis =  svg.append("g")
      .call(d3.axisLeft(y)
      .tickFormat(d3.format(","))
      .ticks(5))
      .style('font-family', '"Noto Sans"')
      .style('color' , '#494949')
      .style('font-size' , '100%');
 

    // Add Y2 axis
    var y2 = d3.scaleLinear()
      .domain([0, 5])
      .range([ height, 0 ]);


    var rightaxis = svg.append("g")
      .call(d3.axisRight(y2)
      		.tickFormat(d3.format(","))
      		 .ticks(5))
      .style('font-family', '"Noto Sans"')
      .style('color' , '#494949')
      .style('font-size' , '100%')
       .attr("transform", "translate( " + 1.00*width  + ", 0 )");



    // Initialize line with first group of the list
    var line = svg
      .append('g') 
      .append("path")
        .datum(data.filter(function(d){return d.location==allGroup[0]}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(+d.new_deaths_smoothed_per_million) })
        )
        .attr("stroke", function(d){ return myColor("World") })
        .style("stroke-width", 4)
        .style("fill", "none")

    var line2 = svg
      .append('g') 
      .append("path")
        .datum(data.filter(function(d){return d.location==allGroup[0]}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y2(+d.vaccination_rate2) })
        )
        .attr("stroke", function(d){ return myColor("World") })
        .style("stroke-width", 4)
        .style("stroke-opacity", 0.6)
        .style("fill", "none");
  
    // A function that update the chart
    function update(selectedGroup) {

   
      // Create new data with the selection?
      var dataFilter = data.filter(function(d){return d.location==selectedGroup})

      y .domain([0, 1.2*d3.max(dataFilter, function(d) { return +d.new_deaths_smoothed_per_million; })]);
      y2 .domain([0, 1.2*d3.max(dataFilter, function(d) { return +d.vaccination_rate2; })]);


 leftaxis
 		.transition()
        .duration(500)
      .call(d3.axisLeft(y)
      .tickFormat(d3.format(","))
      .ticks(5));
 


   rightaxis 
    		.transition()
        .duration(500)
      .call(d3.axisRight(y2)
      		.tickFormat(d3.format(","))
      		 .ticks(5))
      .style('font-family', '"Noto Sans"')
      .style('color' , '#494949')
      .style('font-size' , '100%')
       .attr("transform", "translate( " + 1.00*width  + ", 0 )");




  
		rax 
		.transition()
          .duration(500)
 		.style('fill' , function(d){ return myColor(selectedGroup)})
 		;


		lax 
		 .transition()
          .duration(500)
		 .style('fill' , function(d){ return myColor(selectedGroup)})
		 ;

      // Give these new data to update line
      line 
          .datum(dataFilter)
          .transition()
          .duration(200)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(+d.new_deaths_smoothed_per_million) })
          )
          .attr("stroke", function(d){ return myColor(selectedGroup) })
          .style("stroke-width", 4)
        .style("fill", "none")
          ;


    line2 
      .datum(dataFilter)
          .transition()
          .duration(200)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y2(+d.vaccination_rate2) })
        )
        .attr("stroke", function(d){ return myColor(selectedGroup) })
        .style("stroke-width", 4)
        .style("fill", "none")
        .style("stroke-opacity", 0.6);


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


---


### Mentoring for donations

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/EconTwitter?src=hash&amp;ref_src=twsrc%5Etfw">#EconTwitter</a> <br>I am offering FREE mentoring for anyone interested in applying for masters/predocs/PhD programs in Economics. In return, I request you to donate to an Indian Covid foundation, such as <a href="https://twitter.com/Hemkunt_Fdn?ref_src=twsrc%5Etfw">@Hemkunt_Fdn</a> or <a href="https://twitter.com/Khalsa_Aid?ref_src=twsrc%5Etfw">@Khalsa_Aid</a>. DM me if interested! <a href="https://twitter.com/hashtag/IndiaFightsCOVID19?src=hash&amp;ref_src=twsrc%5Etfw">#IndiaFightsCOVID19</a> 1/3</p>&mdash; Jonathan Old (@Jonathan_Old) <a href="https://twitter.com/Jonathan_Old/status/1392964103174492172?ref_src=twsrc%5Etfw">May 13, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

---




