import type { LabelType, LabelParams, CalculationResult } from "./types";

export const labelTypes: LabelType[] = [
  {
    id: "single-satin",
    name: "Single Satin",
    variants: [
      { color: "White", itemCode: "PS-7021", labelRate: 0.00055, rollPrice: 24, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
      { color: "Black", itemCode: "PS-7025", labelRate: 0.0006, rollPrice: 32, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
    ],
  },
  {
    id: "double-satin",
    name: "Double Satin",
    variants: [
      { color: "White", itemCode: "PS-7252", labelRate: 0.0006, rollPrice: 34, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
      { color: "Black", itemCode: "PS-7254", labelRate: 0.00065, rollPrice: 42, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
    ],
  },
  {
    id: "single-kanari",
    name: "Single Kanari",
    variants: [
      { color: "White", itemCode: "WS-601", labelRate: 0.00065, rollPrice: 49, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
      { color: "Black", itemCode: "WS-605", labelRate: 0.00075, rollPrice: 63, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
    ],
  },
  {
    id: "double-kanari",
    name: "Double Kanari",
    variants: [
      { color: "White", itemCode: "WD-801", labelRate: 0.00075, rollPrice: 59, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
      { color: "Black", itemCode: "WD-805", labelRate: 0.000855, rollPrice: 70, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
    ],
  },
  {
    id: "tpu",
    name: "TPU",
    variants: [
      { color: "White", itemCode: "TPU-300", labelRate: 0.003, rollPrice: 240, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
      { color: "Matt", itemCode: "TPU-300-M", labelRate: 0.00275, rollPrice: 260, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
    ],
  },
  {
    id: "polyester-taffeta",
    name: "Polyester Taffeta",
    variants: [
      { color: "Black", itemCode: "PT-005", labelRate: 0.00285, rollPrice: 255, defaultBlockRate: 800, defaultColorRate: 1000, defaultDesignRate: 1000 },
    ],
  },
  {
    id: "cotton-label",
    name: "Cotton Label",
    variants: [
      { color: "White", itemCode: "NT-304/306", labelRate: 0.000285, rollPrice: 35, defaultBlockRate: 500, defaultColorRate: 800, defaultDesignRate: 1000 },
      { color: "Black", itemCode: "NT-304/306", labelRate: 0.000325, rollPrice: 35, defaultBlockRate: 500, defaultColorRate: 2500, defaultDesignRate: 1000 },
    ],
  },
];

export function calculatePrice(params: LabelParams): CalculationResult {
  const variant = labelTypes
    .find((l) => l.id === params.labelTypeId)
    ?.variants.find((v) => v.color === params.color);

  if (!variant) {
    return {
      totalSizeMM: 0,
      blockCharges: 0,
      colorCharges: 0,
      designCharges: 0,
      materialCost: 0,
      totalCost: 0,
      unitPrice: 0,
      rollPricePer200m: 0,
    };
  }

  const totalSizeMM = params.width * params.length;
  const blockCharges = params.blockQty * params.blockRate;
  const colorCharges = params.colorQty * params.colorRate;
  const designCharges = params.designQty * params.designRate;
  const materialCost = totalSizeMM * variant.labelRate * params.qty;
  const totalCost = materialCost + blockCharges + colorCharges + designCharges;
  const unitPrice = params.qty > 0 ? totalCost / params.qty : 0;
  const rollPricePer200m = variant.rollPrice * params.width;

  return {
    totalSizeMM,
    blockCharges,
    colorCharges,
    designCharges,
    materialCost,
    totalCost,
    unitPrice,
    rollPricePer200m,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRate(value: number): string {
  if (value >= 1) return formatCurrency(value);
  return "Rs " + value.toFixed(5);
}
