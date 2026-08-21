#!/bin/bash
sed -i 's/    return () => clearInterval(intv);\n    return () => clearInterval(intv);/    return () => clearInterval(intv);/g' src/components/bank/UberEatsApp.tsx
sed -i 's/    return () => observer.disconnect();\n    return () => observer.disconnect();/    return () => observer.disconnect();/g' src/components/bank/UberEatsApp.tsx
sed -i 's/  return (\n  return (/  return (/g' src/components/bank/UberEatsApp.tsx
sed -i 's/    return () => window.removeEventListener("storage", syncCards);\n    return () => window.removeEventListener("storage", syncCards);/    return () => window.removeEventListener("storage", syncCards);/g' src/components/bank/UberEatsApp.tsx
sed -i 's/    return () => clearInterval(freezeInterval);\n    return () => clearInterval(freezeInterval);/    return () => clearInterval(freezeInterval);/g' src/components/bank/UberEatsApp.tsx
sed -i 's/    return () => unsub();\n    return () => unsub();/    return () => unsub();/g' src/components/bank/UberEatsApp.tsx
sed -i 's/    return () => clearInterval(interval);\n    return () => clearInterval(interval);/    return () => clearInterval(interval);/g' src/components/bank/UberEatsApp.tsx
sed -i 's/                                return (\n                                return (/                                return (/g' src/components/bank/UberEatsApp.tsx
sed -i 's/                    return (\n                    return (/                    return (/g' src/components/bank/UberEatsApp.tsx
sed -i 's/                  return (\n                  return (/                  return (/g' src/components/bank/UberEatsApp.tsx
sed -i 's/                        return (\n                        return (/                        return (/g' src/components/bank/UberEatsApp.tsx
