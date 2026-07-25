import re

with open('src/components/pay/RapidPay.tsx', 'r') as f:
    content = f.read()

import_str = "import { VoiceInputButton } from '../shared/VoiceInputButton';\n"
if "VoiceInputButton" not in content:
    content = content.replace('import { toast } from "sonner";', import_str + 'import { toast } from "sonner";')

state_str = """  const [isDescListening, setIsDescListening] = useState(false);
"""
if "isDescListening" not in content:
    content = content.replace("  const [paymentAmount, setPaymentAmount] = useState('');", "  const [paymentAmount, setPaymentAmount] = useState('');\n" + state_str)


with open('src/components/pay/RapidPay.tsx', 'w') as f:
    f.write(content)
