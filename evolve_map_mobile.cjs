const fs = require('fs');
let content = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

// Update Search & Results Panel for mobile responsiveness
const oldSearchPanel = /className="absolute top-4 right-4 z-\[400\] w-64 md:w-80 pointer-events-none flex flex-col gap-2 max-h-\[90vh\]"/;
const newSearchPanel = `className="absolute top-2 right-2 left-2 md:left-auto md:top-4 md:right-4 z-[400] md:w-80 pointer-events-none flex flex-col gap-2 max-h-[50vh] md:max-h-[90vh] overflow-hidden"`;
content = content.replace(oldSearchPanel, newSearchPanel);

// Ensure the scrollable list inside search panel works beautifully on mobile
const oldResultList = /<div className="flex flex-col gap-2 pointer-events-auto max-h-\[60vh\] overflow-y-auto hide-scrollbar">/;
const newResultList = `<div className="flex flex-col gap-2 pointer-events-auto max-h-[40vh] md:max-h-[60vh] overflow-y-auto hide-scrollbar w-full transform-gpu will-change-transform">`;
content = content.replace(oldResultList, newResultList);

// Update Main Controls for mobile
const oldMainControls = /<div className="absolute top-4 left-1\/2 -translate-x-1\/2 z-\[400\] flex items-center gap-2 pointer-events-none w-full max-w-lg justify-center px-4">/;
const newMainControls = `<div className="absolute bottom-20 md:top-4 md:bottom-auto left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 pointer-events-none w-full max-w-full md:max-w-lg justify-center px-2 md:px-4 flex-wrap md:flex-nowrap">`;
content = content.replace(oldMainControls, newMainControls);

// Change the main wrapper to be fully responsive
const oldWrapper = /<div className="relative w-full h-\[800px\] bg-slate-950 overflow-hidden font-sans border border-slate-800 rounded-2xl shadow-2xl">/;
const newWrapper = `<div className="relative w-full h-[60vh] md:h-[800px] min-h-[400px] bg-slate-950 overflow-hidden font-sans border border-slate-800 rounded-xl md:rounded-2xl shadow-2xl transform-gpu">`;
content = content.replace(oldWrapper, newWrapper);

fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', content);
