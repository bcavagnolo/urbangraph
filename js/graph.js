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

datasets = [
    {
      url: '../testdata/county_table-3_2010-2040_county__county_population.tab.txt',
      run_id: 46,
      level: 'county',
      name: 'population',
      title: 'Population over Time',
      xlabel: 'Year',
      ylabel: 'Population',
      xvalues: ['2010', '2011', '2012', '2012', '2013', '2014', '2015', '2016', '2017', '2018',
                '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028',
                '2029', '2030', '2031', '2032', '2033', '2034', '2035', '2036', '2037', '2038',
                '2039', '2040'],
    },
];

$(document).ready(function() {

  try {
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(prepareUI);
  } catch(e) {
    alert("bad");
  }

  function prepareUI() {
    drawChart(datasets[0])
  }

  function drawChart(data) {

    d3.text(data.url, function(datasetText) {
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

      for (var i=0; i<seriesarr[0].length; i++){
        var temparr = [];
        if (i ==0) {
          temparr[0] = data.xlabel;
        } else {
          temparr[0] = data.xvalues[i-1];
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

      var options = {
        title: data.title
      };
      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(google.visualization.arrayToDataTable(masterarray), options);

    });
  }
  return false;
});
