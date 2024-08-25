// components/D3Chart.js

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../css/D3chart.css';

const D3Chart = ({ data, title }) => {
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
      .domain([0, d3.max(data, d => d.pinverCountSuccess)])
      .range([innerHeight, 0]);

    // Clear previous axes
    g.selectAll('.x-axis').remove();
    g.selectAll('.y-axis').remove();

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Clear previous lines
    g.selectAll('.line').remove();

    // Define line generator
    const lineGenerator = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.pinverCountSuccess));

    // Add line for pinverCountSuccess
    g.append('path')
      .datum(data)
      .attr('class', 'line pinverCountSuccess')
      .attr('fill', 'none')
      .attr('stroke', 'green') // Ensure line color is green
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Add label for the line at the top right
    g.append('text')
      .attr('class', 'line-label')
      .attr('x', innerWidth - 10) // Position near the right edge
      .attr('y', margin.top + 20) // Position near the top
      .attr('text-anchor', 'end')
      .attr('fill', 'green') // Match label color with the line color
      .text('PVS');

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
            CR: ${d.pingenCountSuccess ? (d.pinverCountSuccess / d.pingenCount).toFixed(2) : 'N/A'}
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

    // Update the title
    svg.select('text.title')
      .attr('x', width / 2)
      .attr('y', margin.top )
      .text(title);

  }, [data, title]);

  return (
    <>
      <svg
        ref={svgRef}
        width={800}
        height={400}
      >
        <text
          className="title"
          textAnchor="middle"
          fontSize="16"
        >
          {title}
        </text>
      </svg>
      <div
        ref={tooltipRef}
        className="tooltip"
      ></div>
    </>
  );
};

export default D3Chart;