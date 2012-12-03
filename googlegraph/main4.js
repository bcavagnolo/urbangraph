var data;
var seriesarr=[];
var masterarray =[];

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
        console.log("rohan look at me ",dataset);
  				for (var i = 0; i< dataset.length; i++){
  					var series = [];
  					var serobj = dataset[i];
  					//console.log(dataset[i])
  					for (var key in serobj){
  						series.push(serobj[key]);
  					}
          console.log("I'm here again mutherfucker")
  				seriesarr.push(series);

  				}

          alert("file loaded");
          var initialyear = 2010;
console.log("seriesarr[0] length ",seriesarr.length); 

for (var i=0;i<seriesarr[0].length;i++){
  var temparr = []
  if (i ==0) {
      temparr[0] = "Year";
    }
  else{
      temparr[0] = initialyear+'';
      initialyear = initialyear + 2;

    }
    for (var j = 1;j<seriesarr.length;j++){
        var temp = seriesarr[j][i];
        if(i==0)  
          temparr.push(temp);
        else 
          temparr.push(parseInt(temp));
    }
  masterarray.push(temparr);
  console.log(temparr.length);

}

console.log(masterarray);
console.log(masterarray.length);


console.log("look");
console.log(masterarray);
data = google.visualization.arrayToDataTable(masterarray);
//console.log(data);


        var options = {
          title: 'County Data'
        };
var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
chart.draw(data, options);
alert("draw call back");


      } );


}          




	return false;
});
	
