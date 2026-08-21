with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

content = content.replace("</div>\\n                            )}\\n                            {/* Download summary button */}", "</div>\n                            )}\n")

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(content)
