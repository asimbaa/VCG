import re

with open("src/components/bank/SovereignStore.tsx", "r") as f:
    content = f.read()

target = """  const hasRealEstate = cart.some(item => item.brand === 'Valourian Real Estate' || item.tag === 'Real Estate' || item.category === 'Real Estate Property');"""

replacement = """  const hasRealEstate = cart.some(item => item.brand === 'Valourian Real Estate' || item.tag === 'Real Estate' || item.category === 'Real Estate Property');

  useEffect(() => {
    if (hasRealEstate) {
      setLogisticsProvider("Sotheby's International Realty");
    } else {
      setLogisticsProvider("Amazon Logistics");
    }
  }, [hasRealEstate]);"""

content = content.replace(target, replacement)

with open("src/components/bank/SovereignStore.tsx", "w") as f:
    f.write(content)

print("Effect patched successfully")
