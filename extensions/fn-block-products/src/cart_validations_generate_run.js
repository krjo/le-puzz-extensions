// @ts-check

/**
 * @typedef {import("../generated/api").CartValidationsGenerateRunInput} CartValidationsGenerateRunInput
 * @typedef {import("../generated/api").CartValidationsGenerateRunResult} CartValidationsGenerateRunResult
 */

const BLOCKED_COUNTRY_CODE = "FR";

/** @type {Record<string, string>} Product ID -> title shown in the error message */
const BLOCKED_PRODUCTS = {
  "gid://shopify/Product/8256327745822": "Cheers!",
  "gid://shopify/Product/15987267404062": "Cheers!"
};

/**
 * @param {CartValidationsGenerateRunInput} input
 * @returns {CartValidationsGenerateRunResult}
 */
export function cartValidationsGenerateRun(input) {
  const blockedTitles = new Set();

  for (const group of input.cart.deliveryGroups) {
    if (group.deliveryAddress?.countryCode !== BLOCKED_COUNTRY_CODE) continue;

    for (const { merchandise } of group.cartLines) {
      if (merchandise.__typename !== "ProductVariant") continue;

      const title = BLOCKED_PRODUCTS[merchandise.product.id];
      if (title) blockedTitles.add(title);
    }
  }

  const errors = blockedTitles.size
    ? [
        {
          message: `The following items can't be shipped to France: ${[...blockedTitles].join(", ")}. Please remove them to continue.`,
          target: "$.cart",
        },
      ]
    : [];

  const operations = [
    {
      validationAdd: {
        errors
      },
    },
  ];

  return { operations };
};
