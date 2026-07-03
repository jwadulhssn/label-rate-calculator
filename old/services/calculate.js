export const PRODUCTS = {
  SINGLE_SATIN: {
    id: "SIGLE SATIN",
    name: "Single Satin",
    whiteFactor: 0.00055,
    blackFactor: 0.0006,
  },

  DOUBLE_SATIN: {
    id: "DOUBLE SATIN",
    name: "Double Satin",
    whiteFactor: 0.0006,
    blackFactor: 0.00065,
  },

  SINGLE_KANARI: {
    id: "SINGLE KANARI",
    name: "Single Kanari",
    whiteFactor: 0.00065,
    blackFactor: 0.00075,
  },

  DOUBLE_KANARI: {
    id: "DOUBLE KANARI",
    name: "Double Kanari",
    whiteFactor: 0.00075,
    blackFactor: 0.000855,
  },

  TPU: {
    id: "TPU-PT005",
    name: "TPU PT005",
    whiteFactor: 0.00275,
    blackFactor: 0.00275,
  },

  COTTON: {
    id: "COTTON LABEL-ROLL",
    name: "Cotton Label Roll",
    whiteFactor: 0.000285,
    blackFactor: 0.000325,
  },
};

export const DEFAULT_INPUT = {
  width: 0,
  length: 0,
  quantity: 1,

  blocks: 0,
  blockRate: 800,

  colors: 0,
  colorRate: 1000,

  designs: 0,
  designRate: 1000,
};

export function calculateWhite(product, input) {
  return calculate(input, product.whiteFactor);
}

export function calculateBlack(product, input) {
  return calculate(input, product.blackFactor);
}

function calculate(input, factor) {
  const width = number(input.width);
  const length = number(input.length);
  const quantity = number(input.quantity);

  const blocks = number(input.blocks);
  const blockRate = number(input.blockRate);

  const colors = number(input.colors);
  const colorRate = number(input.colorRate);

  const designs = number(input.designs);
  const designRate = number(input.designRate);

  /*
      Excel

      E4 = Width × Length
  */

  const totalSize = width * length;

  /*
      A8 = Block × Rate
  */

  const blockCharges = blocks * blockRate;

  /*
      C8 = Color × Rate
  */

  const colorCharges = colors * colorRate;

  /*
      E8 = Design × Rate
  */

  const designCharges = designs * designRate;

  /*
      Printing Cost
  */

  const printingCost = totalSize * factor * quantity;

  /*
      Total Cost
  */

  const totalCost = printingCost + blockCharges + colorCharges + designCharges;

  /*
      Roll Price (200 Meter)
  */

  const rollPrice = 25 * width;

  /*
      Unit Price
  */

  const unitPrice = quantity === 0 ? 0 : totalCost / quantity;

  return {
    totalSize,

    printingCost,

    blockCharges,

    colorCharges,

    designCharges,

    totalCost,

    rollPrice,

    unitPrice,
  };
}

function number(value) {
  return Number(value || 0);
}
