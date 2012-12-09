$(document).ready(function() {

  var datasetList;

  try {
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(prepareUI);
  } catch(e) {
    alert("bad");
  }

  function slugToProper(string) {
    var parts = string.split('_');
    var first = true;
    var output = '';
    for (var i=0; i<parts.length; i++) {
      if (!first) {
        output += ' ';
      }
      first = false;
      output += parts[i].charAt(0).toUpperCase() +
        parts[i].slice(1);
    }
    return output;
  }

  // From antiscroll documentation
  function setupAntiscroll() {
    scroller = $('.box-wrap').antiscroll().data('antiscroll');

    $("#addRow").click(function() {
      $('.box-wrap tr:last').clone().appendTo('.box-wrap table');
      $("#rows b").text($(".box-wrap tr").length);
      scroller.refresh();
    });

    $("#removeRow").click(function() {
      $('.box-wrap tr:last').remove();
      $("#rows b").text($(".box-wrap tr").length);
      scroller.refresh();
    });

    $("#addCol").click(function() {
      $('.box-wrap tr').each(function(index, tr) {
        $('td:last', tr).clone().appendTo(tr);
      });
      $("#cols b").text($(".box-wrap tr:last td").length);
      scroller.refresh();
    });

    $("#removeCol").click(function() {
      $('.box-wrap tr').find('td:last').remove();
      $("#cols b").text($(".box-wrap tr:last td").length);
      scroller.refresh();
    });

    $("#rows b").text($(".box-wrap tr").length);
    $("#cols b").text($(".box-wrap tr:last td").length);
  }

  function datasetToHTML(d) {
    var scenario_title = d.scenario_title;
    if (!scenario_title)
      scenario_title = d.scenario_name.replace('_', ' ');
    var title = d.title;
    if (!title)
      title = slugToProper(d.name);

    html = "<li><a class='dataset name' href='" + d.url + "'>" +
      title + "</a><ul>" +
      "<li class='run_id'>Run #" + d.run_id + "</li>" +
      "<li class='scenario_name'>" + scenario_title + " Scenario</li>" +
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

        $('#list-container > ul').find('li').each(function() {
          $(this).prepend('<span class="icon"></span>');
        });
        $('#list-container > ul').find('li:has(> ul)').each(function() {
          $(this).addClass('parent');
        });
        $('#list-container li.parent > span.icon').click(function() {
          $(this).parent().toggleClass('open');
        });
        setupAntiscroll();
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

        var title = data.title;
        if (!title)
          title = slugToProper(data.name);
        if (data.level)
          title += ' By ' + slugToProper(data.level);

        var options = {
          title: title,
          vAxis: {
            title: slugToProper(data.ylabel),
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
