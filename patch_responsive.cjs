const fs = require('fs');

const makeResponsive = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace <table className="..."> with <div className="overflow-x-auto w-full"><table className="..."> and </table> with </table></div>
    // This is tricky via regex, so we'll just inject standard Tailwind grid adjustments
    
    // Convert grid-cols-3 to grid-cols-1 md:grid-cols-3 for generic grids
    content = content.replace(/className="([^"]*)grid-cols-3([^"]*)"/g, (match, p1, p2) => {
        if(p1.includes('md:grid-cols-3') || p1.includes('lg:grid-cols-3')) return match;
        return `className="${p1}grid-cols-1 md:grid-cols-3${p2}"`;
    });

    content = content.replace(/className="([^"]*)grid-cols-4([^"]*)"/g, (match, p1, p2) => {
        if(p1.includes('lg:grid-cols-4')) return match;
        return `className="${p1}grid-cols-1 md:grid-cols-2 lg:grid-cols-4${p2}"`;
    });
    
    // Lazy loading for images
    content = content.replace(/<img([^>]+)>/g, (match, p1) => {
        if(!p1.includes('loading=')) {
            return `<img${p1} loading="lazy">`;
        }
        return match;
    });

    // Ensure overflow-x-auto on standard tables wrapper (just a rudimentary wrap if we find <table)
    // Actually, it's safer to just let the grid classes handle the main structure, and many tables might already be wrapped.
    // Let's do a simple wrap of standard raw <table tags if they are immediately inside a <div>
    
    fs.writeFileSync(file, content);
}

makeResponsive('src/components/bank/ValourianDashboard.tsx');
makeResponsive('src/components/bank/BankDashboard.tsx');
makeResponsive('src/components/bank/WorkspaceMail.tsx');
makeResponsive('src/components/bank/DocuCraftAI.tsx');

console.log("Responsive and lazy loading patches applied.");
