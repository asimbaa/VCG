const fs = require('fs');
let file = fs.readFileSync('src/components/bank/SovereignDispatchMonitor.tsx', 'utf8');

if (!file.includes('const previousFleetRef')) {
    // Add useRef
    file = file.replace(
        'import React, { useEffect, useState } from \'react\';',
        'import React, { useEffect, useState, useRef } from \'react\';'
    );
    
    const notifyBlock = `
    const previousFleetRef = useRef<FleetVehicle[]>([]);

    useEffect(() => {
        if (previousFleetRef.current.length > 0 && fleet.length > 0) {
            fleet.forEach(currentVehicle => {
                const prevVehicle = previousFleetRef.current.find(v => v.id === currentVehicle.id);
                if (prevVehicle && prevVehicle.status !== 'DELIVERED' && currentVehicle.status === 'DELIVERED') {
                    toast.success(\`\${currentVehicle.vehicleId} has arrived at \${currentVehicle.destination}. Package Ready for Signature.\`, {
                        duration: 8000,
                        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    });
                }
            });
        }
        previousFleetRef.current = fleet;
    }, [fleet]);
`;
    
    file = file.replace(
        'useEffect(() => {\n        const q = query',
        notifyBlock + '\n    useEffect(() => {\n        const q = query'
    );
}

fs.writeFileSync('src/components/bank/SovereignDispatchMonitor.tsx', file);
