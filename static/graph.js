var data;
var seriesarr=[];
var masterarray =[];
var chart; //char made a global object.
var togglearray = [];
var temparray = [];
var toggle = 0;
$(document).ready(function() {

chart = new google.visualization.LineChart(document.getElementById('chart_div'));
//chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));

$('#apply').live('click',function(event){
	
	if(masterarray.length==0)
	{
		alert("Data Set Empty , populate data set first");
	}
	
	var year1 = parseInt($('#fromyear').val());
	var year2 = parseInt($('#toyear').val());
		
	var year3 = year2-year1;
	
	
	if (year3 < 0 || year3>6)
	{
	if(year3<0)
	alert("Selection Rules : The first year selection should be lesser than the second ");
	if(year3>6)
	alert("select within a range of 6 years to zoom in and analyze");
	
	}
	else
	{
	console.log("master");
	temparray=[];	
	temparray.push(masterarray[0]);
	for(var x=1;x<masterarray.length;x++)
	{
	var curryear = parseInt(masterarray[x][0]);
	console.log(curryear+"and"+year1+"and"+year2);
	if(curryear<=year2 && curryear>=year1)
	{
		temparray.push(masterarray[x]);
	}
	
	}
	console.log("temparray");
	//chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));

	console.log(temparray);
	//togglearray =  temparray;
	drawChart(temparray);
	}
});


$('#toggle').live('click',function(event){


chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));


drawChart(temparray);
});

$('#toggle1').live('click',function(event){


chart = new google.visualization.LineChart(document.getElementById('chart_div'));


drawChart(temparray);
});

$('#pie').live('click',function(event){

var year = parseInt($('#pieyear').val());

chart = new google.visualization.PieChart(document.getElementById('chart_div'));

var tmppiearr = [];
var piearr= [];
tmppiearr.push(masterarray[0]);

for(var x1=1;x1<masterarray.length;x1++)
	{
	var curryear = parseInt(masterarray[x1][0]);
	
	if(curryear == year)
	{
		tmppiearr.push(masterarray[x1]);
	}
	
	}
console.log(tmppiearr);	
console.log(tmppiearr.length);
console.log(tmppiearr[0].length);
var tmpar = [];
for(var u=0;u<tmppiearr[0].length;u++)
{
for(var u1=0;u1<tmppiearr.length;u1++)
{
tmpar.push(tmppiearr[u1][u]);
//console.log(tmppiearr[u1][u]);
}
console.log(tmpar);
piearr.push(tmpar);
tmpar = [];
}

console.log("pi");
console.log(piearr);	
drawChart(piearr);

});



$('#display').live('click',function(event){
chart = new google.visualization.LineChart(document.getElementById('chart_div'));
alert("rohan");
var selection = $("#selection").val();
alert(selection);
console.log("watch now");
console.log(chart);
seriesarr=[]; 
masterarray=[]; //reset masterarray

//drawChart();
//google.load("visualization", "1", {packages:["corechart"]});
//google.setOnLoadCallback(drawChart);
//var fileurl = "../static/county_table-3_2010-2040_county__county_population.tab.txt";
var fileurl = selection;
//var fileurl = "../static/county_table-3_2010-2040_county__nonres_occupancy_ratio.tab.txt";

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
          //console.log("I'm here again mutherfucker")
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
      initialyear = initialyear + 1;

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

drawChart(masterarray);


      } );


});



function drawChart(temparray){

data = google.visualization.arrayToDataTable(temparray);
//console.log(data);


     var options = {
       title: 'County wise predictions - Population'
     };

chart.draw(data, options);
alert("draw call back");

google.visualization.events.addListener(chart,'select',function(){
	console.log("data here");
	console.log(data);
	var x = chart.getSelection();
	console.log(x[0].row+"and"+x[0].column);
	console.log(masterarray[0][x[0].column]);
	console.log(masterarray[x[0].row+1][x[0].column]);
//	console.log(x);
	
});




}          




	return false;
});
	
