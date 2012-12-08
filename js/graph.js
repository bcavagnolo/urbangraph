var data;
var seriesarr=[];
var masterarray =[];

// This is the id-to-county mapping.  These mapping will ultimately be hanlded
// by the back end.
id_to_county = {
    1: "Alameda",
    7: "Contra Costa",
    21: "Marin",
    38: "San Francisco",
    28: "Napa",
    41: "San Mateo",
    48: "Solano",
    49: "Sonoma",
    43: "Santa Clara",
}

$(document).ready(function() {

  try {
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
  } catch(e) {
    alert("bad");
  }

  function drawChart() {

    var fileurl = "../testdata/county_table-3_2010-2040_county__county_population.tab.txt";

    d3.text(fileurl,function(datasetText){
      var dataset = d3.tsv.parse(datasetText);
      for (var i = 0; i< dataset.length; i++){
        var series = [];
        var serobj = dataset[i];
        for (var key in serobj){
          series.push(serobj[key]);
        }

        if (id_to_county[series[0]]) {
          // Only show data for bayarea counties
          series[0] = id_to_county[series[0]]
          seriesarr.push(series);
        }
      }

      var initialyear = 2010;

      for (var i=0; i<seriesarr[0].length; i++){
        var temparr = [];
        if (i ==0) {
          temparr[0] = "Year";
        }
        else{
          temparr[0] = initialyear+'';
          initialyear = initialyear + 1;
        }
        for (var j = 0;j<seriesarr.length;j++){
          var temp = seriesarr[j][i];
          if(i==0) {
            temparr.push(temp);
          } else {
            temparr.push(parseInt(temp));
          }
        }
        masterarray.push(temparr);
      }
      data = google.visualization.arrayToDataTable(masterarray);

      var options = {
        title: 'County Data'
      };
      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(data, options);

    });
  }
  return false;
});
