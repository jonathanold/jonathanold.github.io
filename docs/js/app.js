d3.csv("/static/test.csv").then(function (data) {
var movies = data;
var button = d3.select("#button");
var form = d3.select("#form");
button.on("click", runEnter);
form.on("submit", runEnter);

// Defining the function
function runEnter() {

d3.select("tbody").html("") 

d3.event.preventDefault(); 

var inputValue = d3.select("#user-input").property("value");

var filteredMovies = movies.filter(movies => movies.country.includes(inputValue));


var output = _.sortBy(filteredMovies, 'hope').reverse()

for (var i = 0; i < filteredMovies.length; i++) {
d3.select("tbody").insert("tr").html(
"<td>" + [i+1] + "</td>" +
"<td>" + (output[i]['hope'])+"</a>"+"</td>" + 
"<td>" + (output[i]['days'])+"</td>" +
"<td>" + (output[i]['average'])+"</td>" +
"<td>" + (output[i]['average'])+"</td>"
)}

};

});
