import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";

function drawGraph(baseTemp, dataset) {
  //console.log(dataset[0].year);
  // dimensions
  const width = 1100;
  const height = 500;
  const padding = 60;
    
  const minYear = d3.min(dataset, (d) => d.year);
  const maxYear = d3.max(dataset, (d) => d.year);
  
  const cellWidth = (width - (2 * padding)) / (maxYear - minYear);
  const cellHeight = (height - (2 * padding)) / 12;
  
  const colors = [    //array with colors and text for the legend
    ['rgb(151, 233, 249)', '< 6℃'], 
    ['rgb(47, 151, 231)', '< 8℃'], 
    ['rgb(247, 216, 98)', '8-9℃'], 
    ['rgb(240, 161, 51)', '> 9℃'], 
    ['rgb(215, 37, 36)', '> 11℃']
  ];
    
  const svg = d3.select('#graph')
    .attr('width', width)
    .attr('height', height);

  // scales
  const xScale = d3.scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([padding * 2, width - padding]);

  const yScale = d3.scaleTime()
    .domain([new Date().setMonth(-1), new Date().setMonth(11)])
    .range([padding, height - padding]);  
  
  // tooltip
  const tooltip = d3.select('#tooltip')
    .style('opacity', 0); 
  
  // draw cells
  svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('fill', (d) => {
      let temp = baseTemp + d.variance;
      if (temp < 6) {
        return 'rgb(151, 233, 249)';
      } else if (temp < 8) {
        return 'rgb(47, 151, 231)';
      } else if (temp >= 8 && temp <= 9 ) {
        return 'rgb(247, 216, 98)';
      } else if (temp > 11) {
        return 'rgb(215, 37, 36)';
      } else {
        return 'rgb(240, 161, 51)';
      }
    })
    .attr('data-month', (d) => d.month)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => baseTemp + d.variance)
    .attr('height', cellHeight)
    .attr('width', cellWidth)
    .attr('y', (d) => yScale(new Date().setMonth(d.month - 1)))
    .attr('x', (d) => xScale(d.year))
    .on('mouseover', (e, d) => {    
      tooltip.transition().style('opacity', 0.9);
      tooltip.attr('data-year', d.year);
      tooltip
        .html(`${d.year} - ${new Date(2000, d.month).toLocaleString('default', { month: 'long' })} <br/> ${(baseTemp + d.variance).toFixed(1)} <br/> ${d.variance.toFixed(1)}`)
        .style('left', `${e.pageX + 10}px`)
        .style('top', `${e.pageY - 28}px`);
  })
    .on('mouseout', (d) => {
      tooltip.transition().style('opacity', 0);
  }); 

  // axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

  svg.append("g")
    .attr('id', 'x-axis')
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  svg.append("g")
    .attr('id', 'y-axis')
    .attr("transform", `translate(${padding * 2}, 0)`)
    .call(yAxis);

  // axes titles
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height - padding / 3)
    .text('Years');

  svg.append('text')
    .attr('class', 'axis-title')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${padding / 3}, ${height / 2}) rotate(-90)`)
    .text('Months');
  
  // legend
  const legend = d3.select('#legend')
    .attr('width', 200)
    .attr('height', 200);

  const legendGroup = legend.selectAll('g')
    .data(colors)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0, ${i * 22})`);

  legendGroup.append('rect')
    .attr('width', 20)
    .attr('height', 20)
    .attr('fill', (d) => d[0]);

  legendGroup.append('text')
    .text((d) => d[1])
    .attr('x', 30)
    .attr('y', 15)
    .style('font-size', '0.8rem');
    
};

async function getData() {
  const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json");
  const data = await response.json();
  const baseTemp = data.baseTemperature;
  const dataset = data.monthlyVariance;
  dataset.map((d) => d.month -= 1);     // -1 to let month start on 0 instead of 1
  //console.log(dataset);
  drawGraph(baseTemp, dataset);
};

getData();