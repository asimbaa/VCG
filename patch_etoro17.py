import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Fix the JSX completely
content = content.replace("    </div>\n  );\n}", "      </div>\n    </div>\n  );\n}")


with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
