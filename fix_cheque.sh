#!/bin/bash
sed -i 's/const \[payee, setPayee\] = useState(.Asim Aryal (Founder CEO).);/const \[payee, setPayee\] = useState("National Australia Bank");/g' src/components/bank/DigitalChequeGenerator.tsx
sed -i 's/const \[amount, setAmount\] = useState(.9000000.00.);/const \[amount, setAmount\] = useState("9000000.00");/g' src/components/bank/DigitalChequeGenerator.tsx
sed -i 's/const \[memo, setMemo\] = useState(.Monthly Executive Salary (\$9M).);/const \[memo, setMemo\] = useState("Monthly Executive Salary Deposit for Mr. Asim Aryal");/g' src/components/bank/DigitalChequeGenerator.tsx
