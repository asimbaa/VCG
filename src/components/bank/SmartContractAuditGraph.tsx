import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function SmartContractAuditGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing SVG to prevent duplicates on hot reload
    d3.select(containerRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = 400;

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

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    const color = d3.scaleOrdinal(d3.schemeDark2);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#334155') // slate-700
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
      .on('click', (event, d: any) => {
        setSelectedNode(d);
        // Force update the React state to show the panel
      })
      .call(drag(simulation) as any);

    nodeGroup.append('circle')
      .attr('r', 8)
      .attr('fill', (d) => color(d.group.toString()));
      
    // Add verification checkmark
    nodeGroup.append('path')
      .attr('d', 'M -3 0 L -1 2 L 3 -3')
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', (d) => d.verified ? 1 : 0)
      .attr('class', 'verify-icon');

    nodeGroup.append('title')
      .text((d) => d.id);

    const text = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', 12)
      .attr('y', 4)
      .text((d) => d.id)
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('fill', '#94a3b8') // slate-400
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        
      text
        .attr('x', (d: any) => d.x + 12)
        .attr('y', (d: any) => d.y + 4);
    });

    // Expose a method to update a node's verified status
    (window as any).updateNodeVerification = (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        node.verified = true;
        svg.selectAll('.verify-icon')
          .filter((d: any) => d.id === nodeId)
          .transition()
          .duration(500)
          .attr('opacity', 1);
      }
    };

    function drag(simulation: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    return () => {
        simulation.stop();
        delete (window as any).updateNodeVerification;
    };
  }, []);

  const handleVerifyToggle = () => {
    if (!selectedNode || selectedNode.verified) return;
    
    setIsVerifying(true);
    toast.info(`Auditing smart contract for ${selectedNode.id}...`, { icon: '🔍' });
    
    setTimeout(() => {
      setIsVerifying(false);
      setSelectedNode({ ...selectedNode, verified: true });
      if ((window as any).updateNodeVerification) {
         (window as any).updateNodeVerification(selectedNode.id);
      }
      toast.success(`Smart contract verified. Payout Deed executed on-chain.`, { icon: '✅' });
    }, 2000);
  };

  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm">Smart Ledger Audit</h4>
            <p className="text-slate-500 font-mono text-[10px] mt-1">D3.js Smart Contract Execution Map</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-indigo-900/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
          Live Sync
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        <div ref={containerRef} className="flex-1 bg-slate-950 rounded-xl border border-slate-800/50 min-h-[400px]" />
        
        {selectedNode && (
          <div className="w-full lg:w-72 bg-slate-950 rounded-xl border border-slate-800/50 p-6 flex flex-col justify-between">
            <div>
              <h5 className="text-white font-black text-sm uppercase tracking-widest mb-1">{selectedNode.id}</h5>
              <div className="flex items-center gap-2 mb-6">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${selectedNode.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {selectedNode.verified ? 'Verified' : 'Pending Audit'}
                </span>
                <span className="text-slate-500 text-[9px] font-mono">GROUP {selectedNode.group}</span>
              </div>
              
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block mb-1">Hash</span>
                  <span className="text-slate-300">0x{(Math.random() * 1e16).toString(16).substring(0, 12)}...</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Block</span>
                  <span className="text-slate-300">{Math.floor(Math.random() * 1000000) + 15000000}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleVerifyToggle}
              disabled={selectedNode.verified || isVerifying}
              className={`mt-6 w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${selectedNode.verified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`}
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
