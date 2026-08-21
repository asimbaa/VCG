const fs = require('fs');
let file = fs.readFileSync('src/components/bank/SovereignAI.tsx', 'utf8');

if (!file.includes('firebase/firestore')) {
    file = file.replace(
        'import { toast } from \'sonner\';',
        'import { toast } from \'sonner\';\nimport { collection, query, onSnapshot, setDoc, doc } from \'firebase/firestore\';\nimport { db } from \'../../firebase\';'
    );
    
    const firestoreBlock = `
  useEffect(() => {
    // Only save to firestore if it's not the initial load to prevent overwriting
    if (sessions.length > 0) {
      sessions.forEach(session => {
        setDoc(doc(db, 'ai_sessions', session.id), session).catch(console.error);
      });
    }
  }, [sessions]);

  useEffect(() => {
    const q = query(collection(db, 'ai_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fbSessions: ChatSession[] = [];
      snapshot.forEach(doc => fbSessions.push(doc.data() as ChatSession));
      if (fbSessions.length > 0) {
        // Merge or just set if we want full cloud authoritative
        // For now we'll just set it to keep it simple, sorted by updated
        const sorted = fbSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setSessions(prev => {
            // Only update if cloud has more or different data to prevent infinite loops
            if (JSON.stringify(prev) !== JSON.stringify(sorted)) {
                return sorted;
            }
            return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);
`;
    
    file = file.replace(
        'useEffect(() => {\n    localStorage.setItem(\'sovereign_chat_sessions\', JSON.stringify(sessions));\n  }, [sessions]);',
        'useEffect(() => {\n    localStorage.setItem(\'sovereign_chat_sessions\', JSON.stringify(sessions));\n  }, [sessions]);\n' + firestoreBlock
    );
}

fs.writeFileSync('src/components/bank/SovereignAI.tsx', file);
