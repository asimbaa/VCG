const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

content = content.replace(
  '<span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full backdrop-blur-md inline-block mb-4">\n            Valourian Capital Network\n          </span>',
  '<span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full backdrop-blur-md inline-block mb-4">\n            Valourian Capital Inc. - RapidPay Sovereign Core\n          </span>'
);

content = content.replace(
  'Instantly deploy capital, settle global obligations, or manage premium integrated credit cards\n            under zero-knowledge clearing guarantees. Zero clearance delays. Limitless global fluidity.',
  'Instantly deploy capital, settle global obligations, or manage premium integrated credit cards\n            under zero-knowledge clearing guarantees. Powered by the DocuCraft Ultra AI Agents Suite for 100% compliant, real-time institutional arbitration.'
);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
