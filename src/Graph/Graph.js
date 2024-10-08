// components/D3Chart.js

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../css/D3chart.css';

const LinearChart = ({ data, title }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create or select the chart group
    let g = svg.selectAll('g.chart-group').data([data]);

    // Enter new chart group
    g = g.enter()
      .append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .merge(g);

    // Set up scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.pinverCountSuccess)]).nice()
      .range([innerHeight, 0]);
    
    // Clear previous axes
    g.selectAll('.x-axis').remove();
    g.selectAll('.y-axis').remove();
    g.selectAll('.grid').remove(); // Clear previous grid lines

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Add horizontal grid lines
    const yTicks = y.ticks(); // Get y-axis ticks
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#ccc') // Grid line color
      .attr('stroke-dasharray', '2,2'); // Dashed lines

    // Clear previous lines and area
    g.selectAll('.line').remove();
    g.selectAll('.area').remove(); // Remove previous area fills

    // Define line generator
    const lineGenerator = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.pinverCountSuccess));

    // Define area generator
    const areaGenerator = d3.area()
      .x(d => x(d.date))
      .y0(innerHeight) // Start from the bottom of the chart
      .y1(d => y(d.pinverCountSuccess));

    // Add area fill for pinverCountSuccess
    g.append('path')
      .datum(data)
      .attr('class', 'area pinverCountSuccess')
      .attr('fill', '#edafb8') // Fill color
      .attr('d', areaGenerator);

    // Add line for pinverCountSuccess
    g.append('path')
      .datum(data)
      .attr('class', 'line pinverCountSuccess')
      .attr('fill', 'none')
      .attr('stroke', '#edafb8') // Ensure line color is green
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Clear previous dots
    g.selectAll('.dot').remove();

    // Add dots for interaction
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.pinverCountSuccess))
      .attr('r', 5)
      .attr('fill', 'black') // Neutral color for dots
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(`
        Hour: ${d3.timeFormat('%I:%M %p')(d.date)}<br/>
           PG: ${d.pingenCount}<br/>
         PGS: ${d.pingenCountSuccess}<br/>
          PV: ${d.pinverCount}<br/>
           PVS: ${d.pinverCountSuccess}<br/>
            CR: ${d.pingenCountSuccess ? ((d.pinverCountSuccess / d.pingenCount) * 100).toFixed(2) : 'N/A'}
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

  }, [data, title]);

  return (
    <>
      <svg
        ref={svgRef}
        width={800}
        height={400}
      >
      </svg>
      <div
        ref={tooltipRef}
        className="tooltip"
      ></div>
    </>
  );
};

export default LinearChart;
