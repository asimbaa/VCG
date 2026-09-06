const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const target1 = `  const [replayingRouteId, setReplayingRouteId] = useState<string | null>(null);
  const [replayProgress, setReplayProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (replayingRouteId) {
      interval = setInterval(() => {
        setReplayProgress((prev) => prev + 1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [replayingRouteId]);`;

const replacement1 = `  const [replayingRouteId, setReplayingRouteId] = useState<string | null>(null);
  const [replayPos, setReplayPos] = useState<[number, number] | null>(null);

  useEffect(() => {
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

const target2 = `  const handleReplayRoute = (id: string) => {
    if (replayingRouteId === id) {
      setReplayingRouteId(null);
      setReplayProgress(0);
    } else {
      setReplayingRouteId(id);
      setReplayProgress(0);
    }
  };`;

const replacement2 = `  const handleReplayRoute = (id: string) => {
    if (replayingRouteId === id) {
      setReplayingRouteId(null);
      setReplayPos(null);
    } else {
      setReplayingRouteId(id);
      setReplayPos(null);
    }
  };`;

const target3 = `{replayingRouteId === route.id && (
                  <Marker
                    position={
                      route.positions[
                        Math.min(replayProgress, route.positions.length - 1)
                      ] as [number, number]
                    }
                    icon={transportIcon}
                  />
                )}`;

const replacement3 = `{replayingRouteId === route.id && replayPos && (
                  <Marker
                    position={replayPos}
                    icon={transportIcon}
                  />
                )}`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
