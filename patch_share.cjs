const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const shareLogic = `const handleShare = () => {
    const url = new URL(window.location.href);
    if (selectedRouteIds.length > 0) {
       url.searchParams.set('routeIds', selectedRouteIds.join(','));
    }
    url.searchParams.set('traffic', trafficView ? 'true' : 'false');
    if (searchQuery) url.searchParams.set('q', searchQuery);
    url.searchParams.set('layer', mapLayer);
    
    // Add categories
    const activeCats = Object.keys(categories).filter(k => categories[k]).join(',');
    if (activeCats) url.searchParams.set('cats', activeCats);
    
    // Add transport modes
    const activeTransports = Object.keys(transportModes).filter(k => transportModes[k]).join(',');
    if (activeTransports) url.searchParams.set('transports', activeTransports);

    window.history.pushState({}, '', url.toString());
    navigator.clipboard.writeText(url.toString());
    toast.success("Share link generated and copied to clipboard.");
  };`;

// replace the old handleShare with new one
code = code.replace(/const handleShare = \(\) => \{[\s\S]*?toast\.success\("Share link generated and copied to clipboard\."\);\n  \};/, shareLogic);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
