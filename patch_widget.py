import re

with open("src/components/bank/CryptoPortfolioWidget.tsx", "r") as f:
    content = f.read()

# Fix import
content = content.replace("ArrowRightLeft, Building2, Coins, Wallet", "ArrowRightLeft, Building2, Coins, Wallet, Activity")

# Fix type errors
content = content.replace(
    "const allHoldings = [...cryptoHoldings, ...stockHoldings].sort((a, b) => b.value - a.value);",
    """const allHoldings: Array<{symbol: string, name: string, value: number, change?: number}> = [...cryptoHoldings, ...stockHoldings].sort((a, b) => b.value - a.value);"""
)

with open("src/components/bank/CryptoPortfolioWidget.tsx", "w") as f:
    f.write(content)

with open("src/components/bank/AuraDriveMap.tsx", "r") as f:
    aura = f.read()

aura = aura.replace(
    "routesLib.Route.computeRoutes",
    "(routesLib as any).Route.computeRoutes"
)

with open("src/components/bank/AuraDriveMap.tsx", "w") as f:
    f.write(aura)

print("Fixed lint errors")
