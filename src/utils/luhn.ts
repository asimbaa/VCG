/**
 * Deterministic Luhn Mod-10 Validation, Repair & PAN Formatting Utility
 * Supports American Express (15-digit: 4-6-5), Visa (16-digit: 4-4-4-4), and Mastercard (16-digit: 4-4-4-4).
 */

export type CardNetworkName = "Mastercard" | "Visa" | "AMEX";

export function inferCardNetwork(panOrNetwork?: string): CardNetworkName {
  const s = String(panOrNetwork || "").toUpperCase();
  if (s.includes("AMEX") || s.includes("AMERICAN EXPRESS")) return "AMEX";
  if (s.includes("VISA")) return "Visa";
  if (s.includes("MASTERCARD") || s.includes("MASTER")) return "Mastercard";
  const digits = s.replace(/\D/g, "");
  if (digits.startsWith("34") || digits.startsWith("37")) return "AMEX";
  if (digits.startsWith("4")) return "Visa";
  return "Mastercard";
}

export function verifyLuhnMod10(pan: string): boolean {
  const clean = String(pan || "").replace(/\D/g, "");
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function computeLuhnCheckDigit(prefixWithoutCheck: string): string {
  const cleanPrefix = prefixWithoutCheck.replace(/\D/g, "");
  for (let d = 0; d <= 9; d++) {
    if (verifyLuhnMod10(`${cleanPrefix}${d}`)) {
      return String(d);
    }
  }
  return "0";
}

export function formatPanForNetwork(rawPan: string, network: CardNetworkName): string {
  const clean = rawPan.replace(/\D/g, "");
  if (network === "AMEX" || clean.length === 15) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 10)} ${clean.slice(10, 15)}`.trim();
  }
  return clean.replace(/(\d{4})/g, "$1 ").trim();
}

export function repairLuhnPan(
  pan: string,
  networkHint?: string
): {
  rawPan: string;
  formattedPan: string;
  last4: string;
  wasRepaired: boolean;
  network: CardNetworkName;
} {
  const network = inferCardNetwork(networkHint || pan);
  const expectedLength = network === "AMEX" ? 15 : 16;
  let digits = String(pan || "").replace(/\D/g, "");

  // Normalize BIN prefix if digits are empty or mismatched
  if (!digits) {
    digits = network === "AMEX" ? "378282191017712" : network === "Visa" ? "4564819230195524" : "5163920144198208";
  }
  if (network === "AMEX" && !(digits.startsWith("34") || digits.startsWith("37"))) {
    digits = `3782${digits.slice(4)}`;
  } else if (network === "Visa" && !digits.startsWith("4")) {
    digits = `4564${digits.slice(4)}`;
  } else if (
    network === "Mastercard" &&
    !/^(5[1-5]|2[2-7])/.test(digits)
  ) {
    digits = `5163${digits.slice(4)}`;
  }

  if (digits.length === expectedLength && verifyLuhnMod10(digits)) {
    return {
      rawPan: digits,
      formattedPan: formatPanForNetwork(digits, network),
      last4: digits.slice(-4),
      wasRepaired: false,
      network,
    };
  }

  const padded = digits.padEnd(expectedLength, "0").slice(0, expectedLength);
  const prefix = padded.slice(0, expectedLength - 1);
  const checkDigit = computeLuhnCheckDigit(prefix);
  const repaired = `${prefix}${checkDigit}`;

  return {
    rawPan: repaired,
    formattedPan: formatPanForNetwork(repaired, network),
    last4: repaired.slice(-4),
    wasRepaired: true,
    network,
  };
}
