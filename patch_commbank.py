import re

with open('src/components/bank/ValourianDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("COMMBANK VIP CAPITAL", "VALOURIAN CAPITAL")
content = content.replace("commbank_vipCapital", "valourian_vipCapital")
content = content.replace("Generate CommBank Payout Certificate", "Generate Valourian Payout Certificate")
content = content.replace("Generating CommBank Payout Certificate", "Generating Valourian Payout Certificate")
content = content.replace("CommBank & NAB payout confirmations", "Valourian & Reserve Bank payout confirmations")
content = content.replace("CommBank & National Australia Bank", "Valourian & Reserve Bank")
content = content.replace("COMMBANK CASH DISPATCH DETAILS", "VALOURIAN CASH DISPATCH DETAILS")
content = content.replace("CommBank and National Australia Bank", "Valourian and Reserve Bank")
content = content.replace("{ id: \"commbank\", label: \"CommBank\", icon: Landmark },", "{ id: \"commbank\", label: \"Valourian\", icon: Landmark },")
content = content.replace("asim@commbank_vip.com", "asim@valouriancapital.io")
content = content.replace("Australia (AUD / CommBank / Osko)", "Australia (AUD / Valourian / Osko)")

with open('src/components/bank/ValourianDashboard.tsx', 'w') as f:
    f.write(content)

