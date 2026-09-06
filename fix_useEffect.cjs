const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    let animationFrame: number;
    let startTime: number;
    
    if (replayingRouteId) {
      const route = routeSegments.find(r => r.id === replayingRouteId);
      if (!route || route.positions.length < 2) {
        setReplayingRouteId(null);
        return;
      }
      
      const parseTime = (t: string) => {
        const [h,m,s] = t.split(':').map(Number);
        return (h*3600 + m*60 + (s || 0)) * 1000;
      };
      
      const nodes = route.nodes || [];
      const positions = route.positions;
      const timestamps = positions.map((_, i) => {
        if (nodes[i] && nodes[i].time) return parseTime(nodes[i].time);
        return i * 5000;
      });
      
      for (let i = 1; i < timestamps.length; i++) {
        if (timestamps[i] <= timestamps[i-1]) timestamps[i] = timestamps[i-1] + 5000;
      }
      
      const totalDuration = timestamps[timestamps.length - 1] - timestamps[0];
      const speedUpFactor = 10;
      const actualDuration = totalDuration / speedUpFactor;

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        
        if (elapsed >= actualDuration) {
          setReplayPos(positions[positions.length - 1] as [number, number]);
          setTimeout(() => setReplayingRouteId(null), 1000);
          return;
        }
        
        const simTime = timestamps[0] + (elapsed * speedUpFactor);
        
        let i = 0;
        while (i < timestamps.length - 1 && timestamps[i+1] < simTime) {
          i++;
        }
        
        const p1 = positions[i];
        const p2 = positions[i+1] || p1;
        const t1 = timestamps[i];
        const t2 = timestamps[i+1] || t1;
        
        const progress = t2 === t1 ? 0 : (simTime - t1) / (t2 - t1);
        const lat = p1[0] + (p2[0] - p1[0]) * progress;
        const lng = p1[1] + (p2[1] - p1[1]) * progress;
        
        setReplayPos([lat, lng]);
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [replayingRouteId, routeSegments]);`;

const targetAnchor = `    },
  ]);
  const [showCoordsFor, setShowCoordsFor] = useState<string | null>(null);`;

if(code.includes(targetEffect)) {
    code = code.replace(targetEffect, '');
    code = code.replace(targetAnchor, targetAnchor + "\n\n" + targetEffect);
    fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
    console.log("Fixed!");
} else {
    console.log("targetEffect not found.");
}
