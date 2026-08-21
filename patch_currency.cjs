const fs = require('fs');
let file = fs.readFileSync('src/contexts/CurrencyContext.tsx', 'utf8');

const apiLogic = `
  useEffect(() => {
    // Unified currency conversion hook via public finance API
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=USD');
        const data = await res.json();
        if (data && data.rates) {
          setRates(prev => ({
            ...prev,
            USD: 1,
            EUR: data.rates.EUR,
            GBP: data.rates.GBP,
            AUD: data.rates.AUD || 1.5,
            JPY: data.rates.JPY,
            AED: data.rates.AED || 3.67,
            CHF: data.rates.CHF
          }));
        }
      } catch (err) {
        console.warn('Currency sync failed, using fallbacks', err);
      }
    };
    fetchRates();
    // Daily sync interval
    const interval = setInterval(fetchRates, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
`;

if (file.includes('const [rates, setRates] = useState<Record<string, number>>')) {
    // Find the end of that useState and insert our hook
    file = file.replace(/const \[rates, setRates\] = useState[^\n]+;/g, match => match + '\n' + apiLogic);
    fs.writeFileSync('src/contexts/CurrencyContext.tsx', file);
    console.log("Currency API hook injected.");
}
