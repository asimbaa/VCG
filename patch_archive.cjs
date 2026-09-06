const fs = require('fs');
let code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const target = `  const handleArchiveRoute = (route: any) => {
    setRouteSegments((prev) => prev.filter((r) => r.id !== route.id));
    setSearchQuery("");
    setShowCoordsFor(null);
    toast.success(\`Archived \${route.id} from active view\`);
  };`;

const replacement = `  const handleArchiveRoute = async (route: any) => {
    try {
      const { db } = await import('../../firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, "archived_routes"), {
        ...route,
        archivedAt: serverTimestamp()
      });
      setRouteSegments((prev) => prev.filter((r) => r.id !== route.id));
      setSearchQuery("");
      setShowCoordsFor(null);
      toast.success(\`Archived \${route.id} from active view and persisted to database\`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to archive route to database.");
    }
  };`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', code);
