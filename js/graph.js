$(document).ready(function() {

  var datasetList;

  try {
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(prepareUI);
  } catch(e) {
    alert("bad");
  }

  function datasetToHTML(d) {
    html = "<li><a class='dataset name' href='" + d.url + "'>" +
      d.name + "</a><ul class='dataset-inner'>" +
      "<li class='run_id'>Run " + d.run_id + "</li>" +
      "<li class='scenario_name'>" + d.scenario_name + " Scenario</li>" +
      "</ul></li>"
    return html;
  }

  function prepareUI() {
    $.ajax({
      url: '../testdata/index.json',
      dataType: 'json',
      success: function(data) {
        for (var i=0; i<data.length; i++) {
          $('#dataset-list .list').append(datasetToHTML(data[i]));
        }
        var options = {
          valueNames: [ 'name', 'run_id', 'scenario_name'],
        };
        datasetList = new List('dataset-list', options);

		$(".dataset").live("click", function(event) {
          drawChart(this.href);
          return false;
		});

        drawChart(data[0].url);
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
