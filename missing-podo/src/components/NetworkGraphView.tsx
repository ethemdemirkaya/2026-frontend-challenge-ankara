import { useMemo, useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { type PersonRecord } from "../utils/investigation";

export const NetworkGraphView = ({ people, onPersonClick }: { people: PersonRecord[], onPersonClick: (id: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 500
      });
    }
    
    // Auto zoom to fit after mount
    setTimeout(() => {
        if(graphRef.current) {
           graphRef.current.zoomToFit(400, 50);
        }
    }, 500);
  }, []);

  const graphData = useMemo(() => {
    const nodes = people.map(p => ({
      id: p.displayName,
      name: p.displayName,
      personId: p.id,
      val: Math.max(2, p.events.length + (p.connections.size * 2)),
      color: p.id === 'podo' ? '#ef4444' : '#3b82f6'
    }));

    const links: { source: string, target: string }[] = [];
    const addedLinks = new Set<string>();

    people.forEach(p => {
      p.connections.forEach(connName => {
        // Ensure connection names map correctly to nodes 
        // Force graph requires source and target to match node ids
        const linkId1 = `${p.displayName}-${connName}`;
        const linkId2 = `${connName}-${p.displayName}`;
        
        if (!addedLinks.has(linkId1) && !addedLinks.has(linkId2)) {
          // Check if target node exists
          if (nodes.some(n => n.id === connName)) {
             links.push({ source: p.displayName, target: connName });
             addedLinks.add(linkId1);
          }
        }
      });
    });

    return { nodes, links };
  }, [people]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] border border-base-content/10 rounded-2xl overflow-hidden bg-gradient-to-b from-base-200 to-base-300 shadow-inner">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: any) => node.color}
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
        linkWidth={2}
        onNodeClick={(node: any) => onPersonClick(node.personId)}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          if (node.id === 'podo') {
             ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          }
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, node.x, node.y + node.val + fontSize);
        }}
      />
    </div>
  );
};
