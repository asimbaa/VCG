const generateValidLuhnCard = (prefix, length) => {
  let pan = prefix;
  while (pan.length < length - 1) {
    pan += Math.floor(Math.random() * 10).toString();
  }
  let sum = 0;
  let alternate = true;
  for (let i = pan.length - 1; i >= 0; i--) {
    let n = parseInt(pan.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }
    sum += n;
    alternate = !alternate;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return pan + checkDigit.toString();
};

const formatCardNumber = (number) => {
  if (number.length === 15) {
    return `${number.substring(0, 4)} ${number.substring(4, 10)} ${number.substring(10, 15)}`;
  }
  return number.match(/.{1,4}/g)?.join(" ") || number;
};

const templates = [
  { prefix: "4532", length: 16, name: "Visa Infinite Black", network: "Visa", exp: "12/40" },
  { prefix: "4242", length: 16, name: "Visa Signature Corporate", network: "Visa", exp: "11/35" },
  { prefix: "4111", length: 16, name: "Visa Platinum Sovereign", network: "Visa", exp: "08/32" },
  { prefix: "4000", length: 16, name: "Visa Classic Standard", network: "Visa", exp: "02/33" },
  { prefix: "4556", length: 16, name: "Visa Infinite Enterprise", network: "Visa", exp: "05/35" },
  { prefix: "4777", length: 16, name: "Visa Infinite Reserve", network: "Visa", exp: "06/36" },
  { prefix: "5588", length: 16, name: "Mastercard World Elite", network: "Mastercard", exp: "12/51" },
  { prefix: "5119", length: 16, name: "Mastercard Platinum Plus", network: "Mastercard", exp: "07/34" },
  { prefix: "5454", length: 16, name: "Mastercard Black Tier", network: "Mastercard", exp: "03/38" },
  { prefix: "5596", length: 16, name: "Mastercard Corporate Fleet", network: "Mastercard", exp: "04/35" },
  { prefix: "5222", length: 16, name: "Mastercard Global Reserve", network: "Mastercard", exp: "10/39" },
  { prefix: "3759", length: 15, name: "AMEX Centurion Black", network: "American Express", exp: "12/50" },
  { prefix: "3777", length: 15, name: "AMEX Platinum Corporate", network: "American Express", exp: "09/35" },
  { prefix: "3499", length: 15, name: "AMEX Gold Business", network: "American Express", exp: "05/37" },
  { prefix: "3759", length: 15, name: "AMEX Master Vault", network: "American Express", exp: "11/45" },
  { prefix: "3782", length: 15, name: "AMEX Reserve Sovereign", network: "American Express", exp: "01/40" }
];

const cards = templates.map((t, i) => {
  const pan = generateValidLuhnCard(t.prefix, t.length);
  return {
    id: `card_${i + 1}`,
    last4: pan.slice(-4),
    fullNumber: formatCardNumber(pan),
    cvv: t.length === 15 ? (Math.floor(Math.random() * 9000) + 1000).toString() : (Math.floor(Math.random() * 900) + 100).toString(),
    pin: (Math.floor(Math.random() * 9000) + 1000).toString(),
    holder: "ASIM ARYAL",
    expiry: t.exp,
    type: "primary",
    limit: "$10,000,000.00 USD",
    region: "Global",
    network: t.network,
    name: t.name,
    balance: 10000000,
    currency: "USD",
    status: "active",
    number: pan
  };
});
console.log(JSON.stringify(cards, null, 2));
