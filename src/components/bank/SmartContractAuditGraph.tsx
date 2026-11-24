import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function SmartContractAuditGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let currentWidth = Math.max(280, el.clientWidth || 600);
    const height = 400;
    const pad = 28;

    const clampX = (x: number) => Math.max(pad, Math.min(currentWidth - pad, x));
    const clampY = (y: number) => Math.max(pad, Math.min(height - pad, y));

    d3.select(el).selectAll('*').remove();

    const nodes = [
      { id: 'Valourian OS (Root)', group: 1, verified: true },
      { id: 'Payout Deed TX-001', group: 2, verified: false },
      { id: 'Payout Deed TX-002', group: 2, verified: false },
      { id: 'Smart Escrow', group: 3, verified: true },
      { id: 'Treasury Settlement', group: 3, verified: false },
      { id: 'Identity Oracle', group: 4, verified: true },
      { id: 'Compliance Matrix', group: 4, verified: true },
      { id: 'Blockchain Sync Node', group: 5, verified: true },
    ];

    const links = [
      { source: 'Valourian OS (Root)', target: 'Payout Deed TX-001' },
      { source: 'Valourian OS (Root)', target: 'Payout Deed TX-002' },
      { source: 'Payout Deed TX-001', target: 'Smart Escrow' },
      { source: 'Payout Deed TX-002', target: 'Smart Escrow' },
      { source: 'Smart Escrow', target: 'Treasury Settlement' },
      { source: 'Payout Deed TX-001', target: 'Identity Oracle' },
      { source: 'Payout Deed TX-002', target: 'Identity Oracle' },
      { source: 'Identity Oracle', target: 'Compliance Matrix' },
      { source: 'Treasury Settlement', target: 'Blockchain Sync Node' },
      { source: 'Compliance Matrix', target: 'Blockchain Sync Node' },
    ];

    const svg = d3.select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${currentWidth} ${height}`)
      .attr('class', 'touch-none select-none w-full block');

    const color = d3.scaleOrdinal(d3.schemeDark2);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(currentWidth < 460 ? 72 : 100))
      .force('charge', d3.forceManyBody().strength(currentWidth < 460 ? -220 : -300))
      .force('center', d3.forceCenter(currentWidth / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);

    const nodeGroup = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'grab')
      .on('click', (_event, d: any) => {
        setSelectedNode(d);
      })
      .call(drag(simulation) as any);

    nodeGroup.append('circle')
      .attr('r', 9)
      .attr('fill', (d) => color(d.group.toString()));

    nodeGroup.append('path')
      .attr('d', 'M -3 0 L -1 2 L 3 -3')
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', (d) => (d.verified ? 1 : 0))
      .attr('class', 'verify-icon');

    nodeGroup.append('title').text((d) => d.id);

    const text = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', 12)
      .attr('y', 4)
      .text((d) => d.id)
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('fill', '#cbd5e1')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      for (const n of nodes as any[]) {
        n.x = clampX(n.x ?? currentWidth / 2);
        n.y = clampY(n.y ?? height / 2);
      }

      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      text
        .attr('x', (d: any) => (d.x > currentWidth - 135 ? d.x - 14 : d.x + 13))
        .attr('text-anchor', (d: any) => (d.x > currentWidth - 135 ? 'end' : 'start'))
        .attr('y', (d: any) => d.y + 4);
    });

    (window as any).updateNodeVerification = (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        node.verified = true;
        svg.selectAll('.verify-icon')
          .filter((d: any) => d.id === nodeId)
          .transition()
          .duration(400)
          .attr('opacity', 1);
      }
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver((entries) => {
          const rect = entries[0]?.contentRect;
          if (!rect || rect.width < 200) return;
          currentWidth = Math.round(rect.width);
          svg.attr('viewBox', `0 0 ${currentWidth} ${height}`);
          simulation.force('center', d3.forceCenter(currentWidth / 2, height / 2));
          simulation.alpha(0.2).restart();
        })
      : null;

    resizeObserver?.observe(el);

    function drag(sim: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = clampX(d.x);
        d.fy = clampY(d.y);
      }
      function dragged(event: any, d: any) {
        d.fx = clampX(event.x);
        d.fy = clampY(event.y);
      }
      function dragended(event: any, d: any) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      resizeObserver?.disconnect();
      simStop();
      delete (window as any).updateNodeVerification;
    };

    function simStop() {
      simulation.stop();
    }
  }, []);

  const handleVerifyToggle = () => {
    if (!selectedNode || selectedNode.verified) return;

    setIsVerifying(true);
    toast.info(`Auditing smart contract for ${selectedNode.id}...`);

    setTimeout(() => {
      setIsVerifying(false);
      setSelectedNode({ ...selectedNode, verified: true });
      if ((window as any).updateNodeVerification) {
        (window as any).updateNodeVerification(selectedNode.id);
      }
      toast.success('Smart contract verified. Payout Deed executed on-chain.');
    }, 1200);
  };

  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div>
          <h4 className="text-white font-black uppercase tracking-widest text-sm">Smart Ledger Audit</h4>
          <p className="text-slate-400 font-mono text-[11px] mt-1">
            Interactive contract execution graph · Drag nodes within viewport
          </p>
        </div>
        <span className="text-[11px] font-mono text-indigo-300 font-semibold">
          Live Graph Sync
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        <div
          ref={containerRef}
          className="flex-1 bg-slate-950 rounded-xl border border-slate-800/70 min-h-[400px] overflow-visible"
        />

        {selectedNode && (
          <div className="w-full lg:w-72 bg-slate-950 rounded-xl border border-slate-800/70 p-5 flex flex-col justify-between shrink-0">
            <div>
              <h5 className="text-white font-black text-sm uppercase tracking-widest mb-1">{selectedNode.id}</h5>
              <div className="flex items-center gap-2 mb-5 text-[11px] font-mono">
                <span className={selectedNode.verified ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {selectedNode.verified ? 'Verified' : 'Pending Audit'}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">Group {selectedNode.group}</span>
              </div>

              <div className="space-y-4 text-xs font-mono tabular-nums">
                <div>
                  <span className="text-slate-500 block mb-1">Hash</span>
                  <span className="text-slate-200">0x{(Math.random() * 1e16).toString(16).substring(0, 12)}...</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Block</span>
                  <span className="text-slate-200">{Math.floor(Math.random() * 1000000) + 15000000}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleVerifyToggle}
              disabled={selectedNode.verified || isVerifying}
              className={`mt-6 w-full min-h-[44px] py-3 rounded-lg font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedNode.verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {selectedNode.verified ? 'Audit Passed' : 'Verify Contract'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
