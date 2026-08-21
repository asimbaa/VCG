import re

with open("src/components/bank/OrderTrackingDashboard.tsx", "r") as f:
    content = f.read()

# Add imports if missing
imports_to_add = """import { User } from "firebase/auth";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { Car, FileText, Home } from "lucide-react";"""

if "import { db }" not in content:
    content = content.replace("import React,", imports_to_add + "\nimport React,")

# Update signature
if "export function OrderTrackingDashboard({" not in content:
    content = content.replace(
        "export function OrderTrackingDashboard() {",
        "export function OrderTrackingDashboard({ user }: { user?: User | null }) {"
    )

with open("src/components/bank/OrderTrackingDashboard.tsx", "w") as f:
    f.write(content)
