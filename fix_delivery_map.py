import re

with open('src/components/bank/DeliveryMap.tsx', 'r') as f:
    content = f.read()

# find "return (<>" which we already inserted
content = content.replace("return (<>", "return (")

# Now wrap it cleanly
target = """  return (
    <div className="space-y-4 relative font-sans">"""
replacement = """  return (
    <>
    <div className="space-y-4 relative font-sans">"""
content = content.replace(target, replacement)

target2 = """  );
}


export function DeliveryMap"""
replacement2 = """    </>
  );
}


export function DeliveryMap"""
content = content.replace(target2, replacement2)

with open('src/components/bank/DeliveryMap.tsx', 'w') as f:
    f.write(content)
