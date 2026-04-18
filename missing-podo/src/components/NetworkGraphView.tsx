import { useMemo, useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { type PersonRecord } from "../utils/investigation";
import { Lock, Unlock, MousePointer2 } from "lucide-react";

export const NetworkGraphView = ({ people, onPersonClick }: { people: PersonRecord[], onPersonClick: (id: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isActivated, setIsActivated] = useState(false);
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
    <div ref={containerRef} className="w-full h-full min-h-[500px] border border-base-content/10 rounded-2xl overflow-hidden bg-gradient-to-b from-base-200 to-base-300 shadow-inner relative group">
      {!isActivated && (
        <div 
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-base-300/40 backdrop-blur-[2px] cursor-pointer transition-all hover:bg-base-300/20"
          onClick={() => setIsActivated(true)}
        >
          <div className="bg-primary text-primary-content px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <MousePointer2 className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-xs">Analizi Etkinleştir (Kaydırmak için Pasif Tutun)</span>
          </div>
        </div>
      )}
      
      {isActivated && (
        <button 
          className="absolute top-4 right-4 z-30 btn btn-circle btn-sm btn-primary shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            setIsActivated(false);
          }}
          title="Analizi Kilitle (Kaydırmayı Etkinleştir)"
        >
          <Lock className="w-4 h-4" />
        </button>
      )}

      <div className={isActivated ? "pointer-events-auto" : "pointer-events-none"}>
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
    </div>
  );
};
