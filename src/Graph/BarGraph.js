import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../css/Barchart.css";

const BarChart = ({ data, width =800 }) => {
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
      .range([0,63]) 
      .padding(0); 

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.pingenCount, d.pinverCount))])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(["pingenCount", "pinverCount"])
      .range(["steelblue", "orange"]);

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("border", "1px solid #d3d3d3")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("pointer-events", "none");

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
      .attr("width", 30) // Set fixed width
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d) => color(d.key))
      .style("stroke", "black") // Optional: Add stroke to rectangles
      .style("stroke-width", 1) // Optional: Set stroke width
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        
        const countType = d.key;
        const item = data.find(item => 
          countType === "pingenCount" ? item.pingenCount === d.value : item.pinverCount === d.value
        );

        tooltip.html(`
          ${countType === "pingenCount" ? "PG" : "PV"}: ${d.value} <br />
          ${countType === "pingenCount" ? "PGS" : "PVS"}: ${countType === "pingenCount" ? item.pingenCountSuccess : item.pinverCountSuccess}
        `)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
      });

    // X axis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));

    // Y axis
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      d3.select(svgRef.current).selectAll("*").remove();
      tooltip.remove();
    };
  }, [data, width]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;
