"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// We must dynamically import ForceGraph since it heavily relies on window/document globally
// but in Next.js app dir we must use next/dynamic if server components are involved.
// Since we used "use client", we can just conditionally render it if window exists.

export default function NetworkGraph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    // Load the topological graph data
    const fetchNetwork = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/analytics/network`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load network analytics", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetwork();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: 500
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 500
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient, containerRef.current]);


  if (!isClient) return <div className="h-[500px] w-full bg-gray-50 flex items-center justify-center animate-pulse rounded-xl" />;

  return (
    <div ref={containerRef} className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden relative">
      
      {/* Overlay Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Node Segmentation</h4>
        <div className="flex flex-col gap-1.5 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#E60000]" /> Private Banking (High Value)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1d4ed8]" /> Premier</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#333333]" /> Retail / Standard</div>
        </div>
      </div>
      
      {loading ? (
        <div className="h-[500px] w-full flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Aggregating Transaction Edges</p>
        </div>
      ) : (
        <div className="bg-slate-50 cursor-move">
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeLabel={(node: any) => `${node.name}\nCentrality: ${node.pagerank}`}
            nodeColor={(node: any) => {
              if (node.segment === "PRIVATE_BANK") return '#E60000';
              if (node.segment === "PREMIER") return '#1d4ed8';
              return '#333333';
            }}
            nodeRelSize={2}
            linkColor={() => "rgba(0,0,0,0.15)"}
            linkWidth={(link: any) => Math.min(3, Math.max(0.5, link.amount / 1000))}
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.08}
            onNodeClick={(node: any, event) => {
              // Zoom into node visually if wanted
            }}
          />
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-10 bg-black text-white text-[10px] font-mono px-3 py-1.5 rounded-full shadow-lg opacity-80 pointer-events-none">
        {data.nodes.length} Nodes | {data.links.length} Edges | Algo: PageRank
      </div>
      
    </div>
  );
}
