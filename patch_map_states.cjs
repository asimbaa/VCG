const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const newStates = `
  const [polygonSelectionMode, setPolygonSelectionMode] = useState(false);
  const [replayingRouteId, setReplayingRouteId] = useState<string | null>(null);
  const [replayProgress, setReplayProgress] = useState(0);
  
  useEffect(() => {
     let interval: any;
     if (replayingRouteId) {
        interval = setInterval(() => {
           setReplayProgress(prev => prev + 1);
        }, 100);
     }
     return () => clearInterval(interval);
  }, [replayingRouteId]);

  useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     const routeId = urlParams.get('routeId');
     if (routeId) {
        setSelectedRouteIds([routeId]);
        setSearchQuery(routeId);
     }
  }, []);

  const handlePolygonComplete = (polygon: [number, number][]) => {
     setPolygonSelectionMode(false);
     const selected = routeSegments.filter(route => {
        return route.positions.some(pos => isPointInPolygon(pos, polygon));
     }).map(r => r.id);
     
     if (selected.length > 0) {
        setSelectedRouteIds(selected);
        toast.success(\`Selected \${selected.length} routes via polygon.\`);
     } else {
        toast.info("No routes found in selected area.");
     }
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    if (selectedRouteIds.length === 1) {
       url.searchParams.set('routeId', selectedRouteIds[0]);
    }
    url.searchParams.set('traffic', trafficView ? 'true' : 'false');
    window.history.pushState({}, '', url.toString());
    navigator.clipboard.writeText(url.toString());
    toast.success("Share link generated and copied to clipboard.");
  };

  const handleReplayRoute = (id: string) => {
    if (replayingRouteId === id) {
       setReplayingRouteId(null);
       setReplayProgress(0);
    } else {
       setReplayingRouteId(id);
       setReplayProgress(0);
    }
  };
`;

if (!code.includes("const [polygonSelectionMode")) {
  code = code.replace(
    "const [liveTraffic, setLiveTraffic] = useState(false);",
    "const [liveTraffic, setLiveTraffic] = useState(false);\n" + newStates
  );
}

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
