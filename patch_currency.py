import re

with open("src/utils/CurrencyConverter.ts", "r") as f:
    content = f.read()

new_rates = """export const EXCHANGE_RATES: Record<string, number> = {
  AUD: 1,
  USD: 0.65,
  EUR: 0.60,
  GBP: 0.51,
  CAD: 0.88,
  NZD: 1.08,
  SGD: 0.88,
  JPY: 98.5,
  CHF: 0.58,
};

export const SYMBOLS: Record<string, string> = {
  AUD: '$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: '$',
  NZD: '$',
  SGD: '$',
  JPY: '¥',
  CHF: 'CHf',
};"""

content = re.sub(r"export const EXCHANGE_RATES: Record<string, number> = \{.*?\};.*?export const SYMBOLS: Record<string, string> = \{.*?\};", new_rates, content, flags=re.DOTALL)

with open("src/utils/CurrencyConverter.ts", "w") as f:
    f.write(content)
