		$(document.ready(function(){

			alert("doc loaded");


		}));
		



		


			var fileurl = "../testdata/county_table-3_2010-2040_county__county_population.tab.txt";
        	var seriesarr = []
        	
        	console.log(seriesarr);
        	console.log("something");

        	var w = 400,
			h = 200,
			margin = 20,
			y = d3.scale.linear().domain([0, 2200000]).range([0 + margin, h - margin]),
			x = d3.scale.linear().domain([0, 30]).range([0 + margin, w - margin]);


			var vis = d3.select("body")
			    .append("svg:svg")
			    .attr("width", w)
			    .attr("height", h);


			var g = vis.append("svg:g")
			    .attr("transform", "translate(0, 200)");   
        	//get data from TSV
        	d3.text(fileurl,function(datasetText){
				var dataset = d3.tsv.parse(datasetText);
  				for (var i = 0; i< dataset.length; i++){
  					var series = [];
  					var serobj = dataset[i]
  					//console.log(dataset[i])
  					for (var key in serobj){
  						series.push(serobj[key])
  					}
  				seriesarr.push(series);
  				}

  				for(var i=0;i<seriesarr.length;i++)
        		{
        		console.log(seriesarr[i]);
        		drawline(seriesarr[i][0],seriesarr[i].splice(1,seriesarr[i].length));
        		}
  				//console.log(seriesarr);
			});		


        	//var data = [3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 7];

        	

        	function drawline(id,data){

//			,


			
			console.log("blah")
			console.log(data)
			console.log(id)
			
			var line = d3.svg.line()
			    .x(function(d,i) { return x(i); })
			    .y(function(d) { return -1 * y(d); })
			
			g.append("svg:path").attr("d", line(data))
				.attr("class","line")
				.attr("id",id);

			g.append("svg:line")
			    .attr("x1", x(0))
			    .attr("y1", -1 * y(0))
			    .attr("x2", x(w))
			    .attr("y2", -1 * y(0))


			g.append("svg:line")
			    .attr("x1", x(0))
			    .attr("y1", -1 * y(0))
			    .attr("x2", x(0))
			    .attr("y2", -1 * y(d3.max(data)))
			
			g.selectAll(".xLabel")
			    .data(x.ticks(5))
			    .enter().append("svg:text")
			    .attr("class", "xLabel")
			    .text(String)
			    .attr("x", function(d) { return x(d) })
			    .attr("y", 0)
			    .attr("text-anchor", "middle")

			g.selectAll(".yLabel")
			    .data(y.ticks(4))
			    .enter().append("svg:text")
			    .attr("class", "yLabel")
			    .text(String)
			    .attr("x", 0)
			    .attr("y", function(d) { return -1 * y(d) })
			    .attr("text-anchor", "right")
			    .attr("dy", 4)
			
			g.selectAll(".xTicks")
			    .data(x.ticks(5))
			    .enter().append("svg:line")
			    .attr("class", "xTicks")
			    .attr("x1", function(d) { return x(d); })
			    .attr("y1", -1 * y(0))
			    .attr("x2", function(d) { return x(d); })
			    .attr("y2", -1 * y(-0.3))

			g.selectAll(".yTicks")
			    .data(y.ticks(4))
			    .enter().append("svg:line")
			    .attr("class", "yTicks")
			    .attr("y1", function(d) { return -1 * y(d); })
			    .attr("x1", x(-0.3))
			    .attr("y2", function(d) { return -1 * y(d); })
			    .attr("x2", x(0))
			}
