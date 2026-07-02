export type LabelColor = "White" | "Black" | "Matt";

export interface LabelVariant {
  color: LabelColor;
  itemCode: string;
  labelRate: number;
  rollPrice: number;
  defaultBlockRate: number;
  defaultColorRate: number;
  defaultDesignRate: number;
}

export interface LabelType {
  id: string;
  name: string;
  variants: LabelVariant[];
}

export interface LabelParams {
  labelTypeId: string;
  color: LabelColor;
  width: number;
  length: number;
  qty: number;
  blockQty: number;
  blockRate: number;
  colorQty: number;
  colorRate: number;
  designQty: number;
  designRate: number;
}

export interface CalculationResult {
  totalSizeMM: number;
  blockCharges: number;
  colorCharges: number;
  designCharges: number;
  materialCost: number;
  totalCost: number;
  unitPrice: number;
  rollPricePer200m: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  rates: CustomerRate[];
  createdAt: string;
}

export interface CustomerRate {
  id: string;
  labelTypeId: string;
  color: LabelColor;
  labelPriceRate: number;
  rollPriceRate: number;
  notes: string;
  createdAt: string;
}
