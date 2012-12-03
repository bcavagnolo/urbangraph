var data;

$(document).ready(function() {



alert("blah");
try
{
google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(drawChart);
alert("google loaded");
}
catch(e)
{
alert("bad");
}

function drawChart(){

var fileurl = "county_table-3_2010-2040_county__county_population.tab.txt";

d3.text(fileurl,function(datasetText){
				var dataset = d3.tsv.parse(datasetText);
  				for (var i = 0; i< dataset.length; i++){
  					var series = [];
  					var serobj = dataset[i];
  					//console.log(dataset[i])
  					for (var key in serobj){
  						series.push(serobj[key]);
  					}
  				seriesarr.push(series);
  				}
			}	);

data = google.visualization.arrayToDataTable([
          ['Year', 'Sales', 'Expenses'],
          ['2004',  1000,      400],
          ['2005',  1170,      460],
          ['2006',  660,       1120],
          ['2007',  1030,      540]
        ]);
//console.log(data);


        var options = {
          title: 'County Data'
        };
var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
console.log(chart);
 chart.draw(data, options);
alert("draw call back");

}

	return false;
});
	
