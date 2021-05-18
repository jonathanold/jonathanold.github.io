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
		  var ctry =  filtercitydata.filter(function(d, i){return d})[0].location ;      
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

### Covid-19 vaccination progress: 

The Hope Index is the number of new vaccinations, divided by the number of new deaths in a country. While every death causes incredible pain and suffering, every vaccination potentially saves lives and nurtures the hope that we can beat this pandemic. Countries with high vaccination rates, such as the UK, have succesfully dried out the pandemic, and their high Hope Index values give reason for optimism. On the other hand, outbreaks such as in India inflict unimaginable suffering, but also slow down vaccination campaigns, worsening an already difficult situation.
![Covid-19 Hope Index](/pdf/hope_index.png)


<iframe src="https://ourworldindata.org/explorers/coronavirus-data-explorer?zoomToSelection=true&pickerSort=desc&pickerMetric=population&Metric=Vaccine+doses&Interval=7-day+rolling+average&Relative+to+Population=true&Align+outbreaks=false&country=IND~GBR~USA~DEU&hideControls=true" loading="lazy" style="width: 100%; height: 600px; border: 0px none;"></iframe>





