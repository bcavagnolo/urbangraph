$(document).ready(function() {

  var datasetList;

  try {
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(prepareUI);
  } catch(e) {
    alert("bad");
  }

  function prepareUI() {
    // default to county population
    drawChart('../testdata/county_population.json');
    $.ajax({
      url: '../testdata/index.json',
      dataType: 'json',
      success: function(data) {
        var options = {
          valueNames: [ 'name', 'run_id', 'scenario_name' ],
          item: "<li><span class='name'></span>" +
            "<span class='run_id'></span>" +
            "<span class='scenario_name'></span></li>"
        };
        datasetList = new List('dataset-list', options, data);
      },
      error: function(data) {
        console.log("WARNING: Failed to fetch index.");
        console.log(data);
      }
    });
  }

  function drawChart(url) {
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
        var masterarray = [];
        var column = [data.xlabel];
        for (var i=0; i<data.yvalues.length; i++) {
          column.push(data.yvalues[i].name);
        }
        masterarray.push(column);

        for (var i=0; i<data.xvalues.length; i++) {
          column = ['' + data.xvalues[i]];
          for (var j=0; j<data.yvalues.length; j++) {
            column.push(data.yvalues[j].data[i]);
          }
          masterarray.push(column);
        }

        var options = {
          title: data.title,
          vAxis: {
            title: data.ylabel,
          },
          hAxis: {
            title: data.xlabel,
          },
        };
        var chart = new google.visualization.LineChart(document.getElementById('chart'));
        chart.draw(google.visualization.arrayToDataTable(masterarray), options);
      },
      error: function(data) {
        console.log("WARNING: Failed to fetch data.");
      }
    });
  }
  return false;
});
