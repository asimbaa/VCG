const fs = require('fs');
const file = 'src/components/bank/DocuCraftAI.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = `const contracts = [`;
const replacement1 = `const contracts = [
    {
      id: "ceo_contract",
      title: "Valourian Capital Chief Executive Officer Employment Agreement",
      desc: "Legally binding and officially guaranteed CEO contract for Mr. Asim Aryal with $9M AUD base + bonuses & stock."
    },
    {
      id: "credit_card_docs",
      title: "Unlimited Digital Bank Credit Facility Guarantee",
      desc: "Authorizes and pre-approves unlimited bank accounts and unlimited credit lines for all acquisitions and transfers globally."
    },
    {
      id: "apple_shares",
      title: "Apple Inc. Equity Acquisition Order",
      desc: "Legally certified directive to secure 12.69% of Apple total shares via direct market block purchases."
    },
    {
      id: "amex_partnership",
      title: "American Express Strategic 10.4% Stake Purchase",
      desc: "Guaranteed acquisition order for 6.9% Amex stock instantly and an additional 3.5% post-integrations."
    },`;
    
code = code.replace(target1, replacement1);

const target2 = `const contract = contracts.find(c => c.id === contractId);`;
const replacement2 = `const contract = contracts.find(c => c.id === contractId);
      if (contractId === 'ceo_contract' || contractId === 'credit_card_docs' || contractId === 'apple_shares' || contractId === 'amex_partnership') {
        toast.success(contract.title + ' is approved, generated and legally binding.');
      }`;

code = code.replace(target2, replacement2);


fs.writeFileSync(file, code);
