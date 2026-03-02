/**
 * Shared pricing utilities — used by both frontend and backend.
 */

export interface TierInput {
  moq: number;
  costPrice: number;
}

/**
 * Pick the best cost-price tier: highest MOQ that is ≤ ordered qty.
 */
export function pickTierCostPrice(tiers: TierInput[], qty: number): number | null {
  if (!tiers.length) return null;
  const sorted = [...tiers].sort((a, b) => b.moq - a.moq);
  for (const t of sorted) {
    if (qty >= t.moq) return t.costPrice;
  }
  // If qty is below all MOQs, use the lowest MOQ tier
  return sorted[sorted.length - 1].costPrice;
}

/**
 * Compute sell price from cost price + markup rule.
 * PERCENT: costPrice * (1 + markupValue / 100)
 * FIXED:   costPrice + markupValue
 */
export function computeSellPrice(
  costPrice: number,
  markupType: "PERCENT" | "FIXED",
  markupValue: number
): number {
  if (markupType === "PERCENT") {
    return Math.round(costPrice * (1 + markupValue / 100) * 10000) / 10000;
  }
  return Math.round((costPrice + markupValue) * 10000) / 10000;
}

/**
 * Compute service fee: sum of margins across line items, floored at minFee.
 */
export function computeServiceFee(
  lineItems: Array<{ qty: number; costPrice: number; sellPrice: number }>,
  minFee: number = 0
): number {
  const totalMargin = lineItems.reduce((sum, li) => {
    return sum + (li.sellPrice - li.costPrice) * li.qty;
  }, 0);
  return Math.max(Math.round(totalMargin * 100) / 100, minFee);
}

/**
 * Compute margin for a single line item.
 */
export function computeLineMargin(costPrice: number, sellPrice: number, qty: number): number {
  return Math.round((sellPrice - costPrice) * qty * 10000) / 10000;
}

/**
 * Apply override to sell price.
 */
export function applyOverride(
  costPrice: number,
  overrideType: string | null | undefined,
  overrideValue: number | null | undefined,
  defaultSellPrice: number
): number {
  if (!overrideType || overrideValue == null) return defaultSellPrice;
  if (overrideType === "PERCENT") {
    return computeSellPrice(costPrice, "PERCENT", overrideValue);
  }
  if (overrideType === "SELL_PRICE") {
    return overrideValue;
  }
  return defaultSellPrice;
}
