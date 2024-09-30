import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../css/Barchart.css";

const BarChart = ({ data, width = 820 }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, chartWidth])
      .padding(0);

    const x1 = d3
      .scaleBand()
      .domain(["pingenCount", "pinverCount"])
      .range([0, 63])
      .padding(0);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.pingenCount, d.pinverCount))])
      .nice()
      .range([height, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(["pingenCount", "pinverCount"])
      .range(["steelblue", "orange"]);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("border", "1px solid #d3d3d3")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("pointer-events", "none");

    // Draw grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks())
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");

    svg
      .append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x0(d.date)},0)`)
      .selectAll("rect")
      .data((d) => [
        { key: "pingenCount", value: d.pingenCount },
        { key: "pinverCount", value: d.pinverCount }
      ])
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", 30)
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d) => color(d.key))
      .style("stroke", "black")
      .style("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);

        const countType = d.key;
        const item = data.find((item) =>
          countType === "pingenCount" ? item.pingenCount === d.value : item.pinverCount === d.value
        );

        tooltip
          .html(`
            ${countType === "pingenCount" ? "PG" : "PV"}: ${d.value} <br />
            ${countType === "pingenCount" ? "PGS" : "PVS"}: ${
            countType === "pingenCount" ? item.pingenCountSuccess : item.pinverCountSuccess
          }
          `)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // X axis
    const xAxis = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));

    // Y axis
    const yAxis = svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // Style the axes to be bold and colored
    xAxis.select("path").style("stroke", "black").style("stroke-width", 2);
    xAxis.selectAll("line").style("stroke", "black").style("stroke-width", 2);
    yAxis.select("path").style("stroke", "black").style("stroke-width", 2);
    yAxis.selectAll("line").style("stroke", "black").style("stroke-width", 2);

    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
      tooltip.remove();
    };
  }, [data, width]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;
