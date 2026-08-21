import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function D3MapRoutes() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("width", "100%")
       .attr("height", "100%");

    // Dark background matching dashboard
    svg.append("rect")
       .attr("width", width)
       .attr("height", height)
       .attr("fill", "#0f172a") // slate-900
       .attr("rx", 16);

    const g = svg.append("g"); // Group for zoomable content

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Nodes (Locations)
    const nodes = [
      { id: "Sydney", x: 700, y: 300, type: "hub" },
      { id: "Melbourne", x: 600, y: 350, type: "hub" },
      { id: "Perth", x: 200, y: 250, type: "hub" },
      { id: "Singapore", x: 400, y: 100, type: "international" },
      { id: "Tokyo", x: 650, y: 50, type: "international" }
    ];

    // Routes (Traffic levels: 1 = Low (Green), 2 = Medium (Yellow), 3 = High (Red))
    const links = [
      { source: "Sydney", target: "Melbourne", traffic: 2 },
      { source: "Sydney", target: "Perth", traffic: 1 },
      { source: "Singapore", target: "Perth", traffic: 2 },
      { source: "Singapore", target: "Sydney", traffic: 3 },
      { source: "Tokyo", target: "Sydney", traffic: 1 },
      { source: "Tokyo", target: "Singapore", traffic: 2 }
    ];

    const getColor = (traffic: number) => {
      if (traffic === 1) return "#10b981"; // Emerald
      if (traffic === 2) return "#eab308"; // Yellow
      return "#ef4444"; // Red
    };

    const getIntensity = (traffic: number) => {
      if (traffic === 1) return 1;
      if (traffic === 2) return 0.7;
      return 0.4;
    };

    // Draw background paths
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source)!;
      const targetNode = nodes.find(n => n.id === link.target)!;

      // Base path
      g.append("path")
         .attr("d", `M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x)/2} ${(sourceNode.y + targetNode.y)/2 - 50} ${targetNode.x} ${targetNode.y}`)
         .attr("fill", "none")
         .attr("stroke", "#334155")
         .attr("stroke-width", 2)
         .attr("stroke-dasharray", "4,4");

      // Animated active path
      const path = g.append("path")
         .attr("d", `M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x)/2} ${(sourceNode.y + targetNode.y)/2 - 50} ${targetNode.x} ${targetNode.y}`)
         .attr("fill", "none")
         .attr("stroke", getColor(link.traffic))
         .attr("stroke-width", 3)
         .attr("opacity", getIntensity(link.traffic));

      const length = (path.node() as SVGPathElement).getTotalLength();

      path.attr("stroke-dasharray", `${length} ${length}`)
          .attr("stroke-dashoffset", length);

      // Loop animation
      const animate = () => {
        path.attr("stroke-dashoffset", length)
            .transition()
            .duration(3000 * link.traffic)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on("end", animate);
      };
      animate();
    });

    // Draw nodes
    g.selectAll("circle")
       .data(nodes)
       .enter()
       .append("circle")
       .attr("cx", d => d.x)
       .attr("cy", d => d.y)
       .attr("r", 6)
       .attr("fill", d => d.type === "hub" ? "#3b82f6" : "#8b5cf6")
       .attr("stroke", "#ffffff")
       .attr("stroke-width", 2);

    // Node Labels
    g.selectAll("text")
       .data(nodes)
       .enter()
       .append("text")
       .attr("x", d => d.x + 10)
       .attr("y", d => d.y + 4)
       .text(d => d.id)
       .attr("fill", "#94a3b8")
       .attr("font-size", "12px")
       .attr("font-family", "monospace")
       .attr("font-weight", "bold");

    // Title / Legend
    svg.append("text")
       .attr("x", 20)
       .attr("y", 30)
       .text("LIVE SATELLITE ROUTING")
       .attr("fill", "#ffffff")
       .attr("font-size", "14px")
       .attr("font-weight", "bold")
       .attr("letter-spacing", "2px");

    const legend = [
      { color: "#10b981", label: "Low Traffic" },
      { color: "#eab308", label: "Medium Traffic" },
      { color: "#ef4444", label: "High Traffic" }
    ];

    legend.forEach((item, i) => {
      svg.append("circle")
         .attr("cx", 20)
         .attr("cy", 60 + (i * 20))
         .attr("r", 4)
         .attr("fill", item.color);
      svg.append("text")
         .attr("x", 30)
         .attr("y", 64 + (i * 20))
         .text(item.label)
         .attr("fill", "#94a3b8")
         .attr("font-size", "12px");
    });
    
    // Keyboard instructions
    const instructions = [
      { key: "Mouse Drag", action: "Pan Map" },
      { key: "Scroll / +/-", action: "Zoom In/Out" },
      { key: "Double Click", action: "Zoom In" }
    ];

    svg.append("text")
       .attr("x", 20)
       .attr("y", 140)
       .text("NAVIGATION CONTROLS")
       .attr("fill", "#64748b")
       .attr("font-size", "10px")
       .attr("font-weight", "bold")
       .attr("letter-spacing", "1px");

    instructions.forEach((inst, i) => {
      svg.append("rect")
         .attr("x", 20)
         .attr("y", 155 + (i * 22))
         .attr("width", 75)
         .attr("height", 16)
         .attr("rx", 3)
         .attr("fill", "#1e293b");

      svg.append("text")
         .attr("x", 57)
         .attr("y", 166 + (i * 22))
         .text(inst.key)
         .attr("fill", "#cbd5e1")
         .attr("font-size", "9px")
         .attr("text-anchor", "middle")
         .attr("font-weight", "bold");

      svg.append("text")
         .attr("x", 105)
         .attr("y", 166 + (i * 22))
         .text(inst.action)
         .attr("fill", "#94a3b8")
         .attr("font-size", "10px");
    });
  }, []);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl relative overflow-hidden mb-8">
      <div className="absolute top-0 right-0 p-4 z-10 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">D3 Network Live</span>
      </div>
      <svg ref={svgRef} className="w-full h-auto aspect-[2/1] md:aspect-[3/1] outline-none" tabIndex={0} />
    </div>
  );
}
