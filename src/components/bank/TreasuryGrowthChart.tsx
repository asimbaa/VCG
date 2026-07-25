import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

const data = [
  { year: 2021, value: 50 },
  { year: 2022, value: 120 },
  { year: 2023, value: 380 },
  { year: 2024, value: 650 },
  { year: 2025, value: 890 },
  { year: 2026, value: 1000 },
];

export function TreasuryGrowthChart() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.year.toString()))
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) as number])
      .nice()
      .range([height, 0]);

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .attr("class", "text-xs font-bold font-mono fill-slate-400")
      .attr("dy", "1em");

    // Y Axis
    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d}B`).tickSize(-width))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", "#e2e8f0").attr("stroke-dasharray", "4 4"))
      .selectAll("text")
      .attr("class", "text-[10px] font-bold font-mono fill-slate-400")
      .attr("dx", "-0.5em");

    const tooltip = d3.select(tooltipRef.current);

    // Bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.year.toString()) as number)
      .attr("y", height)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "url(#bar-gradient)")
      .attr("rx", 4)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).attr("opacity", 0.8);
        tooltip
          .style("opacity", 1)
          .html(`
            <div class="text-xs font-bold text-slate-400 mb-1">${d.year}</div>
            <div class="text-lg font-black text-slate-900">$${d.value}B</div>
          `)
          .style("left", event.pageX - 40 + "px")
          .style("top", event.pageY - 80 + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX - 40 + "px")
          .style("top", event.pageY - 80 + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).attr("opacity", 1);
        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value));

    // Gradient
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#60a5fa");

  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden"
    >
      <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">
        $1T Treasury Fund Growth
      </h4>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
        Historical asset trajectory
      </p>
      
      <div className="relative w-full h-[300px]">
        <svg ref={svgRef} className="w-full h-full overflow-visible"></svg>
        <div
          ref={tooltipRef}
          className="absolute opacity-0 bg-white border border-slate-100 shadow-xl rounded-xl p-3 pointer-events-none transition-opacity duration-200 z-50"
          style={{ position: 'fixed' }}
        />
      </div>
    </motion.div>
  );
}
