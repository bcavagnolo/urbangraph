$(document).ready(function() {

  $("#dialog-modal").dialog({
    height: 550,
    width: 400,
    modal: true,
    autoOpen: false
  });

  $("#about-urbangraph").click(function () {
    $("#dialog-modal").dialog('open');
  });

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
    var title = d.title;
    if (!title)
      title = slugToProper(d.name);

    var desc = d.desc;
    if (!desc)
      desc = "(unavailable)"
    html = "<li><a class='dataset name' name='" + d.name + "' href='#'>" +
      title + "</a><ul>" +
      "<li class='description'>Description: " + desc + "</li>" +
      "</ul></li>"
    return html;
  }

  function runToHTML(d) {
    var raw_name = "Run " + d.id;
    var name = d.name;
    var html;
    var sname = d.scenario.name.replace('_', ' ');
    if (!name) {
      html = "<li><a class='runset run' id='" + d.id + "' href='#'>";
      html += raw_name + " (" + sname + " Scenario)" + "</a><ul>";
    } else {
      html = "<li><a class='runset name' id='" + d.id + "' href='#'>" +
      html += name + "</a><ul><li class='run'>" + raw_name + "</li>";
      html += "<li class='scenario'>" + "Scenario: " + sname + "</li>";
    }

    html += "</ul></li>";
    return html;
  }

  function prepareUI() {

    $.ajax({
      url: '/api/v1/indicator/?limit=100',
      dataType: 'json',
      success: function(data) {
        data = data.objects;
        for (var i=0; i<data.length; i++) {
          $('#dataset-list .list').append(datasetToHTML(data[i]));
        }
        var options = {
          valueNames: [ 'name', 'description'],
        };
        var datasetList = new List('dataset-list', options);

        $(".dataset").live("click", function(event) {
          $('#chart-title').attr('name', this.name);
          chartEvent({type: EVENT.DRAW});
          return false;
        });
        chartEvent({type: EVENT.INDICATORS_LOADED});
      },
      error: function(data) {
        console.log("WARNING: Failed to fetch indicator data.");
        console.log(data);
      }
    });

    $.ajax({
      url: '/api/v1/run?order_by=-id',
      dataType: 'json',
      success: function(data) {
        data = data.objects;
        for (var i=0; i<data.length; i++) {
          $('#run-list .list').append(runToHTML(data[i]));
        }
        var options = {
          valueNames: [ 'name', 'run', 'scenario'],
        };
        var datasetList = new List('run-list', options);
        $(".runset").live("click", function(event) {
          $('#chart-title').attr('run_id', this.id);
          chartEvent({type: EVENT.DRAW});
          return false;
        });
        chartEvent({type: EVENT.RUNS_LOADED});
      },
      error: function(data) {
        console.log("WARNING: Failed to fetch run data.");
        console.log(data);
      }
    });

  }

  function populateXValFields(data) {
    $('label[for=xval_select]').html(data.xlabel + ':');
    s = $('#xval_select');
    for (i in data.xvalues) {
      s.append('<option value="' + data.xvalues[i] + '" >' +
               data.xvalues[i] + '</option>');
    }
  }

  function setDefaultData() {
    name = $('#dataset-list .list li a').attr('name');
    id = $('#run-list .list li a').attr('id');
    $('#chart-title').attr('name', name);
    $('#chart-title').attr('run_id', id)
  }

  function drawLine() {
    name = $('#chart-title').attr('name');
    id = $('#chart-title').attr('run_id');

    $.ajax({
      url: '/api/v1/indicatordata/?indicator__name=' + name + '&run=' + id,
      dataType: 'json',
      success: function(data) {
        data = data.objects[0];
        var column = [data.xlabel];
        var masterarray = [];
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
          title = slugToProper(data.indicator.name);
        if (data.level)
          title += ' By ' + slugToProper(data.level);

        var subtitle = data.run.scenario.name.replace('_', ' ') +
          ' Scenario, Run ' + data.run.id;
        $('#chart-title').html(title);
        $('#chart-subtitle').html(subtitle);
        var options = {
          vAxis: {
            title: slugToProper(data.indicator.name),
          },
          hAxis: {
            title: data.xlabel,
          },
        };
        var chart = new google.visualization.LineChart(document.getElementById('chart'));
        chart.draw(google.visualization.arrayToDataTable(masterarray), options);
        populateXValFields(data);
      },
      error: function(data) {
        console.log("WARNING: Failed to fetch data.");
      }
    });
  }

  function drawPie(xval) {
    name = $('#chart-title').attr('name');
    id = $('#chart-title').attr('run_id');

    $.ajax({
      url: '/api/v1/indicatordata/?indicator__name=' + name + '&run=' + id,
      dataType: 'json',
      success: function(data) {
        data = data.objects[0];
        var index = -1;
        if (!xval) {
          xval = data.xvalues[0];
          index = 0;
        } else {
          index = -1;
          for (var i=0; i<data.xvalues.length; i++) {
            if (data.xvalues[i] == xval) {
              index = i;
              break;
            }
          }
          if (index == -1) {
            xval = data.xvalues[0];
            index = 0;
          } else {
            xval = data.xvalues[index];
          }
        }

        var title = data.title;
        if (!title)
          title = slugToProper(data.indicator.name);
        title += ' By County (' + xval + ')';

        var subtitle = data.run.scenario.name.replace('_', ' ') +
          ' Scenario, Run ' + data.run.id;
        $('#chart-title').html(title);
        $('#chart-subtitle').html(subtitle);

        // TODO: Eventually we will support other levels besides county.
        var masterarray = [["County", title]];
        for (var i=0; i<data.yvalues.length; i++) {
          masterarray.push([data.yvalues[i].name, data.yvalues[i].data[index]]);
        }

        var chart = new google.visualization.PieChart(document.getElementById('chart'));
        chart.draw(google.visualization.arrayToDataTable(masterarray));
        populateXValFields(data);
      },
      error: function(data) {
        console.log("WARNING: Failed to fetch data for pie.");
      }
    });
  }

  // Things can get complicated.  Use a proper state machine.  No other
  // functions in this file should be stateful.
  var STATE = {
    INIT: 0,
    LINE : 1,
    PIE: 2,
  };
  var state = STATE.INIT;

  var EVENT = {
    DRAW : 0,
    DRAW_PIE : 1,
    DRAW_LINE: 2,
    INDICATORS_LOADED: 4,
    RUNS_LOADED: 8,
  };
  var FULLY_LOADED = EVENT.INDICATORS_LOADED|EVENT.RUNS_LOADED;
  var loadEvents = 0;

  function chartEvent(event) {
    switch (state) {
    case STATE.INIT:
      if (event.type == EVENT.INDICATORS_LOADED)
        loadEvents |= EVENT.INDICATORS_LOADED;
      else if (event.type == EVENT.RUNS_LOADED)
        loadEvents |= EVENT.RUNS_LOADED;

      if (loadEvents == FULLY_LOADED) {
        $('.list-container > ul').find('li').each(function() {
          $(this).prepend('<span class="icon"></span>');
        });
        $('.list-container > ul').find('li:has(> ul)').each(function() {
          $(this).addClass('parent');
        });
        $('.list-container li.parent > span.icon').click(function() {
          $(this).parent().toggleClass('open');
        });
        setupAntiscroll();
        state = STATE.LINE;
        setDefaultData();
        drawLine();
      }
      break;
    case STATE.LINE:
      if (event.type == EVENT.DRAW_LINE || event.type == EVENT.DRAW) {
        drawLine();
      } else if (event.type == EVENT.DRAW_PIE) {
        drawPie(event.xval, $('#xval_select').val());
        state = STATE.PIE;
        updateControls();
      }
      break;
    case STATE.PIE:
      if (event.type == EVENT.DRAW_LINE) {
        drawLine();
        state = STATE.LINE;
        updateControls();
      } else if (event.type == EVENT.DRAW_PIE || event.type == EVENT.DRAW) {
        drawPie($('#xval_select').val());
      }
      break;
    }
  }

  function updateControls() {
    switch (state) {
    case STATE.LINE:
      $('#pie-controls').hide();
      break;
    case STATE.PIE:
      $('#pie-controls').show();
      break;
    }
  }

  $(function () {
    $('#pie-controls').hide();
  });

  $('#pie-chart').click(function() {
    chartEvent({type: EVENT.DRAW_PIE});
    return false;
  });

  $('#line-chart').click(function() {
    chartEvent({type: EVENT.DRAW_LINE});
    return false;
  });

  $('#xval_select').change(function() {
    chartEvent({type: EVENT.DRAW_PIE});
    return false;
  });

  return false;
});
