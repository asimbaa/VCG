with open('src/main.tsx', 'r') as f:
    content = f.read()

import re

if "import { ErrorBoundary } from './components/ErrorBoundary';" not in content:
    content = content.replace("import App from './App.tsx'", "import App from './App.tsx';\nimport { ErrorBoundary } from './components/ErrorBoundary';")
    content = content.replace("<App />", "<ErrorBoundary><App /></ErrorBoundary>")

    with open('src/main.tsx', 'w') as f:
        f.write(content)
    print("Patched main.tsx")
else:
    print("Already patched")
