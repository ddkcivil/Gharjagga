export interface NepaliArea {
  bigha?: number;
  kattha?: number;
  dhur?: number;
  ropani?: number;
  aana?: number;
  paisa?: number;
  daam?: number;
}

/**
 * Converts Terai units (Bigha-Kattha-Dhur) to Square Feet
 */
export function teraiToSqFt(bigha = 0, kattha = 0, dhur = 0): number {
  return (bigha * 72900) + (kattha * 3645) + (dhur * 182.25);
}

/**
 * Converts Hilly units (Ropani-Aana-Paisa-Daam) to Square Feet
 */
export function hillyToSqFt(ropani = 0, aana = 0, paisa = 0, daam = 0): number {
  return (ropani * 5476) + (aana * 342.25) + (paisa * 85.56) + (daam * 21.39);
}

/**
 * Formats Nepalese area nicely as string
 */
export function formatNepaliArea(landType: 'Terai' | 'Hilly', area: NepaliArea): string {
  if (landType === 'Terai') {
    const b = area.bigha || 0;
    const k = area.kattha || 0;
    const d = area.dhur || 0;
    return `${b} Bigha - ${k} Kattha - ${d} Dhur`;
  } else {
    const r = area.ropani || 0;
    const a = area.aana || 0;
    const p = area.paisa || 0;
    const dm = area.daam || 0;
    return `${r} Ropani - ${a} Aana - ${p} Paisa - ${dm} Daam`;
  }
}

/**
 * Standard Nepal Real Estate Commission Slabs:
 * Up to 20 Lakhs: 3.0%
 * 20 Lakhs to 50 Lakhs: 2.5%
 * 50 Lakhs to 1 Crore: 2.0%
 * 1 Crore to 2 Crores: 1.5%
 * Above 2 Crores: 1.0%
 */
export function calculateSlabCommission(amount: number): {
  rate: number;
  amount: number;
  brackets: { label: string; rate: number; portion: number; commission: number }[];
} {
  let rate = 0;
  let commission = 0;

  if (amount <= 2000000) {
    rate = 3.0;
    commission = amount * 0.03;
  } else if (amount <= 5000000) {
    rate = 2.5;
    commission = amount * 0.025;
  } else if (amount <= 10000000) {
    rate = 2.0;
    commission = amount * 0.02;
  } else if (amount <= 20000000) {
    rate = 1.5;
    commission = amount * 0.015;
  } else {
    rate = 1.0;
    commission = amount * 0.01;
  }

  // Bracket breakdown for simulation
  const brackets = [
    { label: 'Up to NPR 20 Lakhs (3%)', rate: 3.0, portion: Math.min(amount, 2000000), commission: Math.min(amount, 2000000) * 0.03 },
    { label: 'NPR 20L - 50L (2.5%)', rate: 2.5, portion: amount > 2000000 ? Math.min(amount - 2000000, 3000000) : 0, commission: (amount > 2000000 ? Math.min(amount - 2000000, 3000000) : 0) * 0.025 },
    { label: 'NPR 50L - 1C (2%)', rate: 2.0, portion: amount > 5000000 ? Math.min(amount - 5000000, 5000000) : 0, commission: (amount > 5000000 ? Math.min(amount - 5000000, 5000000) : 0) * 0.02 },
    { label: 'NPR 1C - 2C (1.5%)', rate: 1.5, portion: amount > 10000000 ? Math.min(amount - 10000000, 10000000) : 0, commission: (amount > 10000000 ? Math.min(amount - 10000000, 10000000) : 0) * 0.015 },
    { label: 'Above NPR 2C (1%)', rate: 1.0, portion: amount > 20000000 ? amount - 20000000 : 0, commission: (amount > 20000000 ? amount - 20000000 : 0) * 0.01 }
  ].filter(b => b.portion > 0);

  return {
    rate,
    amount: commission,
    brackets
  };
}

/**
 * Calculates estimates for Nepal Government registration taxes and Capital Gain Taxes.
 */
export function calculateNepalGovTaxes(amount: number, isFemale = false, isSeniorOrDisabled = false, yearsOwned = 5): {
  registrationFee: number;
  capitalGainTax: number;
  standardRegRate: number;
  appliedRegRate: number;
  cgtRate: number;
} {
  // Registration fee: standard 5% for Municipalities
  const standardRegRate = 5.0;
  let rebate = 0;
  if (isSeniorOrDisabled) {
    rebate = 0.5; // 50% discount
  } else if (isFemale) {
    rebate = 0.25; // 25% discount
  }

  const appliedRegRate = standardRegRate * (1 - rebate);
  const registrationFee = amount * (appliedRegRate / 100);

  // Capital Gains Tax (on estimated 30% profit margin as default)
  const estimatedProfit = amount * 0.3;
  const cgtRate = yearsOwned < 5 ? 7.5 : 5.0;
  const capitalGainTax = estimatedProfit * (cgtRate / 100);

  return {
    registrationFee,
    capitalGainTax,
    standardRegRate,
    appliedRegRate,
    cgtRate
  };
}
